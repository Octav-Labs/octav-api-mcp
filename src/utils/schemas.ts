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

export const evmAddressSchema = z
  .string()
  .regex(evmAddressRegex, 'Invalid address format. Must be an EVM (0x...) address.');

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// Values that end up in the URL path (chain keys, bundle ids, saved addresses) are
// limited, like the octav CLI, to characters that can't escape a path segment
// (no '.' or '/').
const pathSegmentRegex = /^[A-Za-z0-9_:-]+$/;

const pathSegmentSchema = (kind: string) =>
  z.string().refine(
    (value) => pathSegmentRegex.test(value),
    (value) => ({
      message: `Invalid ${kind}: '${value}'. Only letters, digits, '-', '_' and ':' are allowed.`,
    })
  );

// Virtual users (Pro) are addressed as virtual:<id>
const virtualAddressSchema = z.string().refine(
  (value) => value.startsWith('virtual:') && pathSegmentRegex.test(value.slice('virtual:'.length)),
  (value) => ({
    message: `Invalid virtual user address: '${value}'. Must be virtual:<id> (see octav_list_virtual_users).`,
  })
);

// Portfolio tool schemas — like the CLI, wait for a fresh sync unless told otherwise
export const portfolioArgsSchema = z.object({
  addresses: addressesSchema,
  waitForSync: z.boolean().default(true),
  includeExplorerUrls: z.boolean().default(false),
});

export const portfolioAtBlockArgsSchema = z.object({
  address: evmAddressSchema,
  chain: z.string().min(1, 'Chain is required'),
  block: z.number().int().min(1, 'Block number must be at least 1'),
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
  protocol: z.string().optional(),
  interactingAddresses: z.array(addressSchema).optional(),
  search: z.string().optional(),
  tokenId: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  sort: z
    .preprocess((v) => (typeof v === 'string' ? v.toUpperCase() : v), z.enum(['ASC', 'DESC']))
    .optional(),
  hideSpam: z.boolean().optional(),
  hideDust: z.boolean().optional(),
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

export const chainsArgsSchema = z.object({});

export const chainProtocolsArgsSchema = z.object({
  chain: pathSegmentSchema('chain'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const contractProtocolArgsSchema = z.object({
  contract: addressSchema,
  chain: z.string().min(1).optional(),
});

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

export const approvalsArgsSchema = z.object({
  address: evmAddressSchema,
  chain: pathSegmentSchema('chain'),
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().min(1).optional(),
});

// Virtual user tool schemas
export const listVirtualUsersArgsSchema = z.object({});

export const virtualUsersPortfolioArgsSchema = z.object({
  addresses: z
    .array(virtualAddressSchema)
    .min(1, 'At least one address is required')
    .max(10, 'Maximum 10 addresses allowed'),
  aggregated: z.boolean().default(false),
  waitForSync: z.boolean().default(true),
  includeExplorerUrls: z.boolean().default(false),
});

// Address book and bundle schemas — these routes also accept Starknet and Tron
// addresses, so the API checks the format. Addresses and bundle ids end up in the
// URL path, so they are checked as path segments.
const savedAddressSchema = pathSegmentSchema('address');
const bundleIdSchema = pathSegmentSchema('bundle id');
const labelSchema = z.string().max(255, 'Label must be at most 255 characters');
const bundleNameSchema = z
  .string()
  .trim()
  .min(1, 'Bundle name is required')
  .max(255, 'Bundle name must be at most 255 characters');
const confirmSchema = z.boolean().optional();

function rejectDuplicates(addresses: string[], ctx: z.RefinementCtx) {
  const duplicate = addresses.find((address, i) => addresses.indexOf(address) !== i);
  if (duplicate !== undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Duplicate address: '${duplicate}'` });
  }
}

export const listAddressBookArgsSchema = z.object({});

export const addAddressBookEntriesArgsSchema = z.object({
  entries: z
    .array(z.object({ address: savedAddressSchema, label: labelSchema.optional() }))
    .min(1, 'At least one entry is required')
    .max(100, 'Maximum 100 entries per request')
    .superRefine((entries, ctx) => rejectDuplicates(entries.map((e) => e.address), ctx)),
});

export const renameAddressBookEntryArgsSchema = z.object({
  address: savedAddressSchema,
  label: labelSchema,
  confirm: confirmSchema,
});

export const removeAddressBookEntryArgsSchema = z.object({
  address: savedAddressSchema,
  confirm: confirmSchema,
});

export const listBundlesArgsSchema = z.object({});

export const getBundleArgsSchema = z.object({
  bundleId: bundleIdSchema,
});

export const createBundleArgsSchema = z.object({
  name: bundleNameSchema,
  addresses: z
    .array(savedAddressSchema)
    .min(1, 'At least one address is required')
    .max(100, 'Maximum 100 addresses per request')
    .superRefine(rejectDuplicates),
});

export const renameBundleArgsSchema = z.object({
  bundleId: bundleIdSchema,
  name: bundleNameSchema,
  confirm: confirmSchema,
});

export const deleteBundleArgsSchema = z.object({
  bundleId: bundleIdSchema,
  confirm: confirmSchema,
});

export const addBundleAddressArgsSchema = z.object({
  bundleId: bundleIdSchema,
  address: savedAddressSchema,
});

export const removeBundleAddressArgsSchema = z.object({
  bundleId: bundleIdSchema,
  address: savedAddressSchema,
  confirm: confirmSchema,
});
