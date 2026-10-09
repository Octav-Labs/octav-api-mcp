// Portfolio types — matches actual /v1/portfolio response
// API returns an ARRAY (one entry per address)
export interface PortfolioAsset {
  address: string;
  symbol: string;
  name: string;
  image: string;
  balance: string;
  price: string;
  value: string;
  percentage: string;
  chainKey: string;
  chainContract: string;
  contract: string;
  decimal: string;
  openPnl: string;
  totalCostBasis: string;
  priceSource: string;
}

export interface ProtocolPosition {
  name: string;
  assets: PortfolioAsset[];
  totalValue: string;
  totalOpenPnl: string;
  totalCostBasis: string;
  unlockAt: string;
}

export interface ChainEntry {
  name: string;
  key: string;
  value: string;
  totalCostBasis: string;
  totalClosedPnl: string;
  totalOpenPnl: string;
  protocolPositions: {
    [positionName: string]: ProtocolPosition;
  };
}

export interface ProtocolEntry {
  name: string;
  key: string;
  value: string;
  totalCostBasis: string;
  totalClosedPnl: string;
  totalOpenPnl: string;
  chains: {
    [chainKey: string]: ChainEntry;
  };
}

export interface PortfolioEntry {
  address: string;
  networth: string;
  lastUpdated: string;
  cashBalance: string;
  manualBalanceNetworth: string;
  assetByProtocols: {
    [protocolKey: string]: ProtocolEntry;
  };
  conversionRates: Record<string, string>;
  priceAdapters: string[];
}

// Portfolio/Wallet endpoints return arrays
export type PortfolioResponse = PortfolioEntry[];

// Transaction types — /v1/transactions returns { transactions: [...] }
export interface TransactionAsset {
  symbol: string;
  name: string;
  image: string;
  address: string;
  balance: string;
  price: string;
  value: string;
}

export interface Transaction {
  hash: string;
  timestamp: string;
  chain: {
    key: string;
    name: string;
  };
  from: string;
  to: string;
  type: string;
  protocol: {
    key: string;
    name: string;
  };
  assetsIn: TransactionAsset[];
  assetsOut: TransactionAsset[];
  valueFiat: string;
  fees: string;
  feesFiat: string;
  explorerUrl: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
}

// NAV types — matches actual /v1/nav response
export interface NAVResponse {
  nav: number;
  currency: string;
}

// Status types — matches actual /v1/status response (array)
export interface StatusEntry {
  address: string;
  portfolioLastSync: string;
  transactionsLastSync: string | null;
  syncInProgress: boolean;
}

export type StatusResponse = StatusEntry[];

// Credits types — API returns a plain number
export type CreditsResponse = number;

// Subscribe snapshot types
export interface SubscribeSnapshotResponse {
  message: string;
  [key: string]: any;
}

// Token overview types — matches actual /v1/token-overview response (array)
export interface TokenOverviewItem {
  image: string;
  symbol: string;
  name: string;
  price: string;
  balance: string;
  value: string;
  percentage: string;
  protocolsDetailed: any[];
}

export type TokenOverviewResponse = TokenOverviewItem[];

// Historical types — same shape as portfolio (array)
export type HistoricalResponse = PortfolioEntry[];

// Sync types — API returns a JSON string
export type SyncResponse = string;

// Airdrop types — array of portfolio-like objects
export type AirdropResponse = PortfolioEntry[];

// Polymarket types — same shape as portfolio (array)
export type PolymarketResponse = PortfolioEntry[];

// Address book types — entries are keyed by address, there is no id
export interface AddressBookEntry {
  address: string;
  label: string;
  plan: 'FREE' | 'LITE' | 'PRO';
  expiresAt: string | null;
  isPaid: boolean;
}

export interface AddressBookResponse {
  data: AddressBookEntry[];
}

export interface AddressBookEntryResponse {
  data: AddressBookEntry;
}

// Bundle types — named groups of address book addresses
export interface Bundle {
  id: string;
  name: string;
  addresses: string[];
}

export interface BundlesResponse {
  data: Bundle[];
}

export interface BundleResponse {
  data: Bundle;
}

// Chain types — /chains and /chains/{chainKey}/protocols are free
export interface Chain {
  chainId: number;
  key: string;
  name: string;
  isPortfolioSupported: boolean;
  isTransactionsSupported: boolean;
  [key: string]: any;
}

export type ChainsResponse = Chain[];

export interface ChainProtocolsResponse {
  data: { uuid: string; name: string; key: string; [key: string]: any }[];
  pagination: { page: number; limit: number; hasMore: boolean };
}

// Contract protocol types — { protocol } when a chain is given, otherwise
// { protocols } with each entry tagged by chainKey
export interface ContractProtocol {
  name: string;
  key: string;
  chainKey?: string;
  [key: string]: any;
}

export type ContractProtocolResponse =
  | { protocol: ContractProtocol }
  | { protocols: ContractProtocol[] };

// Approval types — paginated by cursor, which is absent or null on the last page
export interface Approval {
  block: string;
  timestamp: string;
  hash: string;
  contract: string;
  from: string;
  to: string;
  amount: string;
  asset: any;
}

export interface ApprovalsResponse {
  cursor?: string | null;
  pageSize: number;
  items: Approval[];
}

// Virtual user types (Pro) — addressed as virtual:<id>
export interface VirtualUser {
  address: string;
  type: string;
  label: string;
}

export type VirtualUsersResponse = VirtualUser[];
