import fetch from 'node-fetch';
import {
  OctavAPIError,
  AuthenticationError,
  InsufficientCreditsError,
  RateLimitError,
} from './errors.js';
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
  AddressBookResponse,
  AddressBookEntryResponse,
  BundlesResponse,
  BundleResponse,
  ChainsResponse,
  ChainProtocolsResponse,
  ContractProtocolResponse,
  ApprovalsResponse,
  VirtualUsersResponse,
} from './types.js';

// Options shared by endpoints that return a full portfolio
export interface PortfolioOptions {
  waitForSync?: boolean;
  includeExplorerUrls?: boolean;
}

function appendPortfolioOptions(params: URLSearchParams, options: PortfolioOptions) {
  if (options.waitForSync) params.append('waitForSync', 'true');
  if (options.includeExplorerUrls) params.append('includeExplorerUrls', 'true');
}

// Most routes fail with { message }. Address book and bundle routes use
// { error: { code, message, ...details } }, and request-schema failures use
// { error: 'Validation Failed', details: { <location>: [{ message }] } }.
function describeError(errorData: any): string | undefined {
  if (typeof errorData?.message === 'string') {
    return errorData.message;
  }
  const { error, details } = errorData ?? {};
  if (typeof error === 'string') {
    const messages = Object.values(details ?? {})
      .flat()
      .map((d: any) => d?.message)
      .filter((m): m is string => typeof m === 'string');
    return messages.length > 0 ? `${error}: ${messages.join('; ')}` : error;
  }
  if (error && typeof error === 'object') {
    const { code, message, ...extra } = error;
    const text = code ? `${code}: ${message}` : message;
    return Object.keys(extra).length > 0 ? `${text} ${JSON.stringify(extra)}` : text;
  }
  return undefined;
}

export class OctavAPIClient {
  private baseUrl = 'https://api.octav.fi/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Octav API key is required');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.error(`[OCTAV] ${method} ${url}`);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        const message = describeError(errorData);

        switch (response.status) {
          case 401:
            throw new AuthenticationError(
              message || 'Invalid API key. Please check your OCTAV_API_KEY.'
            );
          case 402:
            throw new InsufficientCreditsError(
              message || 'Insufficient credits. Please purchase more credits at https://octav.fi',
              errorData.creditsNeeded
            );
          case 429:
            throw new RateLimitError(
              message || 'Rate limit exceeded. Please try again later.',
              errorData.retryAfter
            );
          default:
            throw new OctavAPIError(
              message || `API request failed with status ${response.status}`,
              response.status,
              errorData
            );
        }
      }

      // 204 No Content (e.g. DELETE) has no body to parse
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof OctavAPIError) {
        throw error;
      }
      throw new OctavAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async requestText(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any
  ): Promise<string> {
    const url = `${this.baseUrl}${endpoint}`;
    console.error(`[OCTAV] ${method} ${url}`);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

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
              errorData.message || 'Invalid API key. Please check your OCTAV_API_KEY.'
            );
          case 402:
            throw new InsufficientCreditsError(
              errorData.message || 'Insufficient credits.',
              errorData.creditsNeeded
            );
          case 429:
            throw new RateLimitError(
              errorData.message || 'Rate limit exceeded.',
              errorData.retryAfter
            );
          default:
            throw new OctavAPIError(
              errorData.message || `API request failed with status ${response.status}`,
              response.status,
              errorData
            );
        }
      }

      return await response.text();
    } catch (error) {
      if (error instanceof OctavAPIError) {
        throw error;
      }
      throw new OctavAPIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Portfolio endpoints — all return arrays
  async getPortfolio(
    addresses: string[],
    options: PortfolioOptions = {}
  ): Promise<PortfolioResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    appendPortfolioOptions(params, options);
    return this.request<PortfolioResponse>(`/portfolio?${params}`);
  }

  async getPortfolioAtBlock(
    address: string,
    chain: string,
    block: number
  ): Promise<PortfolioResponse> {
    const params = new URLSearchParams({
      addresses: address,
      chainKey: chain,
      blockNumber: block.toString(),
    });
    return this.request<PortfolioResponse>(`/portfolio/at-block?${params}`);
  }

  async getWallet(addresses: string[]): Promise<PortfolioResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    return this.request<PortfolioResponse>(`/wallet?${params}`);
  }

  async getNAV(addresses: string[], currency = 'USD'): Promise<NAVResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    params.append('currency', currency);
    return this.request<NAVResponse>(`/nav?${params}`);
  }

  async getTokenOverview(addresses: string[], date: string): Promise<TokenOverviewResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    params.append('date', date);
    return this.request<TokenOverviewResponse>(`/token-overview?${params}`);
  }

  // Transaction endpoints
  async getTransactions(
    addresses: string[],
    options: {
      chain?: string;
      type?: string;
      protocol?: string;
      interactingAddresses?: string[];
      search?: string;
      tokenId?: string;
      startDate?: string;
      endDate?: string;
      sort?: 'ASC' | 'DESC';
      hideSpam?: boolean;
      hideDust?: boolean;
      offset: number;
      limit: number;
    }
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    // The API calls these networks and txTypes, and rejects chain and type with a 400
    if (options.chain) params.append('networks', options.chain);
    if (options.type) params.append('txTypes', options.type);
    if (options.protocol) params.append('protocols', options.protocol);
    if (options.interactingAddresses?.length) {
      params.append('interactingAddresses', options.interactingAddresses.join(','));
    }
    if (options.search) params.append('initialSearchText', options.search);
    if (options.tokenId) params.append('tokenId', options.tokenId);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.sort) params.append('sort', options.sort);
    if (options.hideSpam) params.append('hideSpam', 'true');
    if (options.hideDust) params.append('hideDust', 'true');
    params.append('offset', options.offset.toString());
    params.append('limit', options.limit.toString());
    return this.request<TransactionsResponse>(`/transactions?${params}`);
  }

  async syncTransactions(addresses: string[]): Promise<SyncResponse> {
    // API returns a JSON string like "Address already syncing"
    const text = await this.requestText('/sync-transactions', 'POST', { addresses });
    // Strip surrounding quotes if present
    return text.replace(/^"|"$/g, '');
  }

  // Historical endpoints
  async getHistorical(addresses: string[], date: string): Promise<HistoricalResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    params.append('date', date);
    return this.request<HistoricalResponse>(`/historical?${params}`);
  }

  async subscribeSnapshot(
    addresses: { address: string; description?: string }[]
  ): Promise<SubscribeSnapshotResponse> {
    return this.request<SubscribeSnapshotResponse>('/subscribe-snapshot', 'POST', {
      addresses,
    });
  }

  // Metadata endpoints
  async getStatus(addresses: string[]): Promise<StatusResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    return this.request<StatusResponse>(`/status?${params}`);
  }

  async getCredits(): Promise<CreditsResponse> {
    const text = await this.requestText('/credits');
    const num = Number(text);
    if (isNaN(num)) {
      throw new OctavAPIError(`Unexpected credits response: ${text}`);
    }
    return num;
  }

  async getChains(): Promise<ChainsResponse> {
    return this.request<ChainsResponse>('/chains');
  }

  async getChainProtocols(
    chain: string,
    page: number,
    limit: number
  ): Promise<ChainProtocolsResponse> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return this.request<ChainProtocolsResponse>(
      `/chains/${encodeURIComponent(chain)}/protocols?${params}`
    );
  }

  async getContractProtocol(contract: string, chain?: string): Promise<ContractProtocolResponse> {
    const params = new URLSearchParams({ contract });
    if (chain) params.append('chain', chain);
    return this.request<ContractProtocolResponse>(`/contract-protocol?${params}`);
  }

  // Specialized endpoints
  async getAirdrop(address: string): Promise<AirdropResponse> {
    return this.request<AirdropResponse>(`/airdrop?addresses=${address}`);
  }

  async getPolymarket(address: string): Promise<PolymarketResponse> {
    return this.request<PolymarketResponse>(`/portfolio/proxy/polymarket?addresses=${address}`);
  }

  async getAgentWallet(addresses: string[]): Promise<PortfolioResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    return this.request<PortfolioResponse>(`/agent/wallet?${params}`);
  }

  async getAgentPortfolio(addresses: string[]): Promise<PortfolioResponse> {
    const params = new URLSearchParams();
    addresses.forEach((addr) => params.append('addresses', addr));
    return this.request<PortfolioResponse>(`/agent/portfolio?${params}`);
  }

  async getApprovals(
    address: string,
    chain: string,
    limit: number,
    cursor?: string
  ): Promise<ApprovalsResponse> {
    const params = new URLSearchParams({ addresses: address, limit: limit.toString() });
    if (cursor) params.append('cursor', cursor);
    return this.request<ApprovalsResponse>(`/approvals/${encodeURIComponent(chain)}?${params}`);
  }

  // Virtual user endpoints (Pro)
  async listVirtualUsers(): Promise<VirtualUsersResponse> {
    return this.request<VirtualUsersResponse>('/virtual-users');
  }

  async getVirtualUsersPortfolio(
    addresses: string[],
    aggregated: boolean,
    options: PortfolioOptions = {}
  ): Promise<PortfolioResponse> {
    // Unlike other endpoints, virtual user addresses go in one comma-separated value
    const params = new URLSearchParams({ addresses: addresses.join(',') });
    if (aggregated) params.append('aggregated', 'true');
    appendPortfolioOptions(params, options);
    return this.request<PortfolioResponse>(`/virtual-users/portfolio?${params}`);
  }

  // Address book endpoints — entries are keyed by address
  async listAddressBook(): Promise<AddressBookResponse> {
    return this.request<AddressBookResponse>('/addressbook');
  }

  async addAddressBookEntries(
    entries: { address: string; label?: string }[]
  ): Promise<AddressBookResponse> {
    return this.request<AddressBookResponse>('/addressbook', 'POST', { entries });
  }

  async renameAddressBookEntry(address: string, label: string): Promise<AddressBookEntryResponse> {
    return this.request<AddressBookEntryResponse>(
      `/addressbook/${encodeURIComponent(address)}`,
      'PATCH',
      { label }
    );
  }

  async removeAddressBookEntry(address: string): Promise<void> {
    return this.request<void>(`/addressbook/${encodeURIComponent(address)}`, 'DELETE');
  }

  // Bundle endpoints
  async listBundles(): Promise<BundlesResponse> {
    return this.request<BundlesResponse>('/bundles');
  }

  async getBundle(bundleId: string): Promise<BundleResponse> {
    return this.request<BundleResponse>(`/bundles/${encodeURIComponent(bundleId)}`);
  }

  async createBundle(name: string, addresses: string[]): Promise<BundleResponse> {
    return this.request<BundleResponse>('/bundles', 'POST', { name, addresses });
  }

  async renameBundle(bundleId: string, name: string): Promise<BundleResponse> {
    return this.request<BundleResponse>(`/bundles/${encodeURIComponent(bundleId)}`, 'PATCH', {
      name,
    });
  }

  async deleteBundle(bundleId: string): Promise<void> {
    return this.request<void>(`/bundles/${encodeURIComponent(bundleId)}`, 'DELETE');
  }

  async addBundleAddress(bundleId: string, address: string): Promise<BundleResponse> {
    return this.request<BundleResponse>(
      `/bundles/${encodeURIComponent(bundleId)}/addresses`,
      'POST',
      { address }
    );
  }

  async removeBundleAddress(bundleId: string, address: string): Promise<BundleResponse> {
    return this.request<BundleResponse>(
      `/bundles/${encodeURIComponent(bundleId)}/addresses/${encodeURIComponent(address)}`,
      'DELETE'
    );
  }
}
