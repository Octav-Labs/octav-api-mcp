import { z } from 'zod';

// Address validation - supports EVM (0x...) and Solana (base58) addresses
const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const addressSchema = z
  .string()
  .refine(
    (addr) => evmAddressRegex.test(addr) || solanaAddressRegex.test(addr),
    'Invalid address format. Must be EVM (0x...) or Solana (base58) address.'
  );

export const addressesSchema = z
  .array(addressSchema)
  .min(1, 'At least one address is required')
  .max(10, 'Maximum 10 addresses allowed');

// Portfolio tool schemas
export const portfolioArgsSchema = z.object({
  addresses: addressesSchema,
});

export const walletArgsSchema = z.object({
  addresses: addressesSchema,
});

export const navArgsSchema = z.object({
  addresses: addressesSchema,
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'CNY']).default('USD'),
});

export const tokenOverviewArgsSchema = z.object({
  addresses: addressesSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// Transaction tool schemas
export const transactionsArgsSchema = z.object({
  addresses: addressesSchema,
  chain: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  offset: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(250).default(50),
});

export const syncTransactionsArgsSchema = z.object({
  addresses: addressesSchema,
});

// Historical tool schemas
export const historicalArgsSchema = z.object({
  addresses: addressesSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const subscribeSnapshotArgsSchema = z.object({
  addresses: addressesSchema,
  description: z.string().optional(),
});

// Metadata tool schemas
export const statusArgsSchema = z.object({
  addresses: addressesSchema,
});

export const creditsArgsSchema = z.object({});

// Specialized tool schemas
export const airdropArgsSchema = z.object({
  address: addressSchema,
});

export const polymarketArgsSchema = z.object({
  address: addressSchema,
});

export const agentWalletArgsSchema = z.object({
  addresses: addressesSchema,
});

export const agentPortfolioArgsSchema = z.object({
  addresses: addressesSchema,
});
