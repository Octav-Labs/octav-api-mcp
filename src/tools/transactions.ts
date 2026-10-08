import type { OctavAPIClient } from '../api/client.js';
import { transactionsArgsSchema, syncTransactionsArgsSchema } from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';

export const getTransactions = {
  definition: {
    name: 'octav_get_transactions',
    title: 'Get Transaction History',
    description:
      'Query transaction history with filtering and pagination. Filter by chain, type, protocol, counterparty, text search, NFT token ID, and date range, and hide spam or dust. Max 250 transactions per request. Costs 1 credit per address.',
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
          description:
            'Filter by chain keys, comma-separated (e.g., ethereum,arbitrum,base). See octav_get_chains.',
        },
        type: {
          type: 'string',
          description: 'Filter by transaction types, comma-separated (e.g., SWAP,DEPOSIT)',
        },
        protocol: {
          type: 'string',
          description:
            'Filter by protocol keys, comma-separated. See octav_get_chain_protocols.',
        },
        interactingAddresses: {
          type: 'array',
          items: { type: 'string' },
          description: 'Only transactions with these counterparty addresses',
        },
        search: {
          type: 'string',
          description: 'Full-text search over token symbols, names and addresses',
        },
        tokenId: {
          type: 'string',
          description: 'Filter by NFT token ID',
        },
        startDate: {
          type: 'string',
          description: 'Start date for filtering (YYYY-MM-DD)',
        },
        endDate: {
          type: 'string',
          description: 'End date for filtering (YYYY-MM-DD)',
        },
        sort: {
          type: 'string',
          enum: ['ASC', 'DESC'],
          description: 'Sort by timestamp (default: DESC, newest first)',
        },
        hideSpam: {
          type: 'boolean',
          description: 'Exclude spam transactions',
        },
        hideDust: {
          type: 'boolean',
          description: 'Exclude dust transactions',
        },
        offset: {
          type: 'number',
          description: 'Pagination offset (default: 0)',
          minimum: 0,
          default: 0,
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
      protocol: validated.protocol,
      interactingAddresses: validated.interactingAddresses,
      search: validated.search,
      tokenId: validated.tokenId,
      startDate: validated.startDate,
      endDate: validated.endDate,
      sort: validated.sort,
      hideSpam: validated.hideSpam,
      hideDust: validated.hideDust,
      offset: validated.offset ?? 0,
      limit: validated.limit ?? 50,
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
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

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};
