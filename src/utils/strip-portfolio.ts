import type { PortfolioEntry } from '../api/types.js';

const ROOT_KEYS = new Set([
  'closedPnl',
  'dailyIncome',
  'dailyExpense',
  'fees',
  'feesFiat',
  'openPnl',
  'manualBalanceNetworth',
  'totalCostBasis',
]);

const NESTED_KEYS = new Set([
  'totalCostBasis',
  'totalClosedPnl',
  'totalOpenPnl',
]);

const ASSET_KEYS = new Set(['openPnl', 'totalCostBasis']);

function stripObject(obj: Record<string, any>, keysToRemove: Set<string>): void {
  for (const key of Object.keys(obj)) {
    if (keysToRemove.has(key) || key === 'uuid') {
      delete obj[key];
    }
  }
}

function stripAssets(assets: any[]): void {
  for (const asset of assets) {
    if (asset && typeof asset === 'object') {
      stripObject(asset, ASSET_KEYS);
      if ('uuid' in asset) delete asset.uuid;
    }
  }
}

function stripProtocolPosition(position: Record<string, any>): void {
  stripObject(position, NESTED_KEYS);
  if (Array.isArray(position.assets)) {
    stripAssets(position.assets);
  }
}

function stripChain(chain: Record<string, any>): void {
  stripObject(chain, NESTED_KEYS);
  if (chain.protocolPositions && typeof chain.protocolPositions === 'object') {
    for (const pos of Object.values(chain.protocolPositions)) {
      if (pos && typeof pos === 'object') {
        stripProtocolPosition(pos as Record<string, any>);
      }
    }
  }
}

function stripProtocol(protocol: Record<string, any>): void {
  stripObject(protocol, NESTED_KEYS);
  if (protocol.chains && typeof protocol.chains === 'object') {
    for (const chain of Object.values(protocol.chains)) {
      if (chain && typeof chain === 'object') {
        stripChain(chain as Record<string, any>);
      }
    }
  }
}

export function stripPortfolioFields(data: PortfolioEntry[]): PortfolioEntry[] {
  for (const entry of data) {
    stripObject(entry as unknown as Record<string, any>, ROOT_KEYS);
    if (entry.assetByProtocols && typeof entry.assetByProtocols === 'object') {
      for (const protocol of Object.values(entry.assetByProtocols)) {
        if (protocol && typeof protocol === 'object') {
          stripProtocol(protocol as Record<string, any>);
        }
      }
    }
  }
  return data;
}
