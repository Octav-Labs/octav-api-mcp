import type { OctavAPIClient } from '../api/client.js';
import { transactionsArgsSchema, syncTransactionsArgsSchema } from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';
import { formatTransactionsResponse, formatSyncResponse } from '../formatters/index.js';

export const getTransactions = {
  definition: {
    name: 'octav_get_transactions',
    title: 'Get Transaction History',
    description:
      'Query transaction history with filtering and pagination. Filter by chain, type, date range. Max 250 transactions per request. Costs 1 credit per address.',
    inputSchema: {
      type: 'object',
      properties: {
        addresses: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Array of wallet addresses (EVM: 0x... or Solana base58). Max 10 addresses.',
          minItems: 1,
          maxItems: 10,
        },
        chain: {
          type: 'string',
          description: 'Filter by specific chain (e.g., ethereum, solana, arbitrum)',
        },
        type: {
          type: 'string',
          description: 'Filter by transaction type (e.g., transfer, swap, stake)',
        },
        startDate: {
          type: 'string',
          description: 'Start date for filtering (YYYY-MM-DD)',
        },
        endDate: {
          type: 'string',
          description: 'End date for filtering (YYYY-MM-DD)',
        },
        offset: {
          type: 'number',
          description: 'Pagination offset (default: 0)',
          minimum: 0,
        },
        limit: {
          type: 'number',
          description: 'Number of transactions to return (default: 50, max: 250)',
          minimum: 1,
          maximum: 250,
          default: 50,
        },
      },
      required: ['addresses'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(transactionsArgsSchema, args);
    const data = await apiClient.getTransactions(validated.addresses, {
      chain: validated.chain,
      type: validated.type,
      startDate: validated.startDate,
      endDate: validated.endDate,
      offset: validated.offset,
      limit: validated.limit,
    });
    const formatted = formatTransactionsResponse(data);

    return {
      content: [
{ type: 'text', text: formatted.markdown }],
    };
  },
};

export const syncTransactions = {
  definition: {
    name: 'octav_sync_transactions',
    title: 'Sync Transactions',
    description:
      'Manually trigger transaction synchronization for addresses. Forces immediate indexing of latest transactions. Costs 1 credit per address.',
    inputSchema: {
      type: 'object',
      properties: {
        addresses: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Array of wallet addresses (EVM: 0x... or Solana base58). Max 10 addresses.',
          minItems: 1,
          maxItems: 10,
        },
      },
      required: ['addresses'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(syncTransactionsArgsSchema, args);
    const data = await apiClient.syncTransactions(validated.addresses);
    const formatted = formatSyncResponse(data);

    return {
      content: [
{ type: 'text', text: formatted.markdown }],
    };
  },
};
