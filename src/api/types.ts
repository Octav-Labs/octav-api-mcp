export interface Asset {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  price?: number;
  value?: number;
  chain?: string;
}

export interface Protocol {
  protocol: string;
  chain: string;
  positions: any[];
  totalValue?: number;
}

export interface PortfolioResponse {
  wallets: {
    [chain: string]: Asset[];
  };
  protocols: Protocol[];
  totalValue?: number;
  timestamp: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  chain: string;
  status: string;
  type?: string;
  gasUsed?: string;
  gasPrice?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  offset: number;
  limit: number;
}

export interface NAVResponse {
  nav: number;
  currency: string;
}

export interface StatusResponse {
  address: string;
  synced: boolean;
  lastSync?: number;
  chains: {
    [chain: string]: {
      synced: boolean;
      lastBlock?: number;
    };
  };
}

export interface CreditsResponse {
  balance: number;
  used: number;
  remaining: number;
}

export interface SnapshotResponse {
  address: string;
  date: string;
  portfolio: PortfolioResponse;
}

export interface SubscribeSnapshotResponse {
  address: string;
  frequency: string;
  subscribed: boolean;
}

export interface TokenOverview {
  symbol: string;
  balance: string;
  value: number;
  percentage: number;
  chains: string[];
}

export interface TokenOverviewResponse {
  address: string;
  tokens: TokenOverview[];
  totalValue: number;
}

export interface HistoricalResponse {
  address: string;
  date: string;
  portfolio: PortfolioResponse;
}

export interface SyncResponse {
  address: string;
  status: string;
  message: string;
}

export interface AirdropResponse {
  address: string;
  airdrops: Array<{
    project: string;
    eligible: boolean;
    amount?: string;
    claimUrl?: string;
  }>;
}

export interface PolymarketPosition {
  marketId: string;
  question: string;
  outcome: string;
  shares: string;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
}

export interface PolymarketResponse {
  address: string;
  positions: PolymarketPosition[];
  totalValue: number;
  totalPnL: number;
}
