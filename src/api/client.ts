import fetch from "node-fetch";
import {
  OctavAPIError,
  AuthenticationError,
  InsufficientCreditsError,
  RateLimitError,
} from "./errors.js";
import type {
  PortfolioResponse,
  TransactionsResponse,
  NAVResponse,
  StatusResponse,
  CreditsResponse,
  SubscribeSnapshotResponse,
  TokenOverviewResponse,
  HistoricalResponse,
  SyncResponse,
  AirdropResponse,
  PolymarketResponse,
} from "./types.js";

export class OctavAPIClient {
  private baseUrl = "https://api.octav.fi/v1";
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Octav API key is required");
    }
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: any,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.error(`[OCTAV] ${method} ${url}`);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // Handle error status codes
      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        switch (response.status) {
          case 401:
            throw new AuthenticationError(
              errorData.message ||
                "Invalid API key. Please check your OCTAV_API_KEY.",
            );
          case 402:
            throw new InsufficientCreditsError(
              errorData.message ||
                "Insufficient credits. Please purchase more credits at https://octav.fi",
              errorData.creditsNeeded,
            );
          case 429:
            throw new RateLimitError(
              errorData.message ||
                "Rate limit exceeded. Please try again later.",
              errorData.retryAfter,
            );
          default:
            throw new OctavAPIError(
              errorData.message ||
                `API request failed with status ${response.status}`,
              response.status,
              errorData,
            );
        }
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof OctavAPIError) {
        throw error;
      }
      throw new OctavAPIError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // Portfolio endpoints
  async getPortfolio(addresses: string[]): Promise<PortfolioResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    return this.request<PortfolioResponse>(`/portfolio?${params}`);
  }

  async getWallet(addresses: string[]): Promise<PortfolioResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    return this.request<PortfolioResponse>(`/wallet?${params}`);
  }

  async getNAV(addresses: string[], currency = "USD"): Promise<NAVResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    params.append("currency", currency);
    return this.request<NAVResponse>(`/nav?${params}`);
  }

  async getTokenOverview(addresses: string[]): Promise<TokenOverviewResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    return this.request<TokenOverviewResponse>(`/token-overview?${params}`);
  }

  // Transaction endpoints
  async getTransactions(
    addresses: string[],
    options?: {
      chain?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      offset?: number;
      limit?: number;
    },
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    if (options?.chain) params.append("chain", options.chain);
    if (options?.type) params.append("type", options.type);
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.offset !== undefined)
      params.append("offset", options.offset.toString());
    if (options?.limit !== undefined)
      params.append("limit", options.limit.toString());
    return this.request<TransactionsResponse>(`/transactions?${params}`);
  }

  async syncTransactions(addresses: string[]): Promise<SyncResponse> {
    return this.request<SyncResponse>("/transactions/sync", "POST", {
      addresses,
    });
  }

  // Historical endpoints
  async getHistorical(
    addresses: string[],
    date: string,
  ): Promise<HistoricalResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    params.append("date", date);
    return this.request<HistoricalResponse>(`/historical?${params}`);
  }

  async subscribeSnapshot(
    addresses: string[],
    frequency: "daily" | "weekly" | "monthly",
  ): Promise<SubscribeSnapshotResponse> {
    return this.request<SubscribeSnapshotResponse>(
      "/snapshot/subscribe",
      "POST",
      {
        addresses,
        frequency,
      },
    );
  }

  // Metadata endpoints
  async getStatus(addresses: string[]): Promise<StatusResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    return this.request<StatusResponse>(`/status?${params}`);
  }

  async getCredits(): Promise<CreditsResponse> {
    return this.request<CreditsResponse>("/credits");
  }

  // Specialized endpoints
  async getAirdrop(address: string): Promise<AirdropResponse> {
    return this.request<AirdropResponse>(`/airdrop?addresses=${address}`);
  }

  async getPolymarket(address: string): Promise<PolymarketResponse> {
    return this.request<PolymarketResponse>(`/polymarket?addresses=${address}`);
  }

  async getAgentWallet(addresses: string[]): Promise<PortfolioResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    return this.request<PortfolioResponse>(`/agent/wallet?${params}`);
  }

  async getAgentPortfolio(addresses: string[]): Promise<PortfolioResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append("addresses", addr));
    return this.request<PortfolioResponse>(`/agent/portfolio?${params}`);
  }
}
