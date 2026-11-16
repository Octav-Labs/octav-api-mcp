// Address helpers that match how the Octav API validates and deduplicates addresses, so the
// MCP rejects the same inputs the API would, with a clearer message.

const addressRegex = /^0x[a-fA-F0-9]{40}$/;

// Lowercase an EVM address, keeping the 0x prefix
export function normalizeEVMAddress(address: string): string {
  return `0x${address.toLowerCase().replace(/^0x/i, '')}`;
}

// An EVM address: 0x followed by 40 hex characters. The API checks the normalized (lowercase)
// address, so call this on normalizeEVMAddress(address).
export function isEVMAddress(address: string): boolean {
  if (!address || address.length !== 42) return false;
  return addressRegex.test(address);
}

// Data endpoints (nav, sync, subscribe, status, transactions) and virtual users treat two
// addresses as the same when they differ only in case, whatever the address type.
export const hasDuplicates = (arr: string[]) => arr.length !== new Set(arr.map((a) => a.toLowerCase())).size;

// The address book and bundles compare normalized addresses exactly, since only EVM addresses
// are case-insensitive.
export const hasDuplicateAddresses = (addresses: string[]): boolean => new Set(addresses).size !== addresses.length;

// EVM addresses are lowercased; others (Solana, Tron, Starknet) are kept as given.
export function normalizeAddress(address: string): string {
  const evm = normalizeEVMAddress(address);
  return isEVMAddress(evm) ? evm : address;
}
