import type { OctavAPIClient } from '../api/client.js';
import {
  portfolioArgsSchema,
  portfolioAtBlockArgsSchema,
  walletArgsSchema,
  navArgsSchema,
  tokenOverviewArgsSchema,
} from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';
import { stripPortfolioFields } from '../utils/strip-portfolio.js';

export const getPortfolio = {
  definition: {
    name: 'octav_get_portfolio',
    title: 'Get Full Portfolio',
    description:
      'Get complete portfolio including wallet holdings and DeFi protocol positions across 20+ blockchains. Returns token balances, values, and protocol positions. Waits for a fresh sync by default. Costs 1 credit per address.',
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
        waitForSync: {
          type: 'boolean',
          description:
            'Wait for a fresh sync when cached data is stale (default: true). Set false to return cached data immediately.',
          default: true,
        },
        includeExplorerUrls: {
          type: 'boolean',
          description: 'Include blockchain explorer URLs for assets and transactions (default: false)',
          default: false,
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
    const validated = validateInput(portfolioArgsSchema, args);
    const data = await apiClient.getPortfolio(validated.addresses, {
      waitForSync: validated.waitForSync,
      includeExplorerUrls: validated.includeExplorerUrls,
    });
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
    };
  },
};

export const getPortfolioAtBlock = {
  definition: {
    name: 'octav_get_portfolio_at_block',
    title: 'Get Portfolio at Block',
    description:
      "Get a single EVM address's portfolio valued at a specific block on ethereum, linea or monad, with every balance and price as of that block. Requires the Portfolio at Block add-on. Costs 1 credit.",
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'EVM wallet address (0x...)',
        },
        chain: {
          type: 'string',
          description: 'Chain the block belongs to: ethereum, linea or monad',
        },
        block: {
          type: 'integer',
          description: 'Block number',
          minimum: 1,
        },
      },
      required: ['address', 'chain', 'block'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(portfolioAtBlockArgsSchema, args);
    const data = await apiClient.getPortfolioAtBlock(
      validated.address,
      validated.chain,
      validated.block
    );
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
    };
  },
};

export const getWallet = {
  definition: {
    name: 'octav_get_wallet',
    title: 'Get Wallet Holdings',
    description:
      'Get wallet holdings only (excludes DeFi protocols). Returns token balances and values across all chains. Costs 1 credit per address.',
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
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(walletArgsSchema, args);
    const data = await apiClient.getWallet(validated.addresses);
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
    };
  },
};

export const getNAV = {
  definition: {
    name: 'octav_get_nav',
    title: 'Get Net Asset Value',
    description:
      'Get total net worth (NAV) in specified currency. Supports USD, EUR, GBP, JPY, CNY, ETH, BTC. Costs 1 credit per address.',
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
        currency: {
          type: 'string',
          enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY'],
          description: 'Currency for NAV calculation. Defaults to USD.',
          default: 'USD',
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
    const validated = validateInput(navArgsSchema, args);
    const data = await apiClient.getNAV(validated.addresses, validated.currency);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const getTokenOverview = {
  definition: {
    name: 'octav_get_token_overview',
    title: 'Get Token Distribution',
    description:
      'Get aggregated token distribution across all chains. Shows which tokens you hold, their values, and percentage breakdown. Costs 1 credit per address.',
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
        date: {
          type: 'string',
          description: 'Date for token overview snapshot (YYYY-MM-DD format)',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
      },
      required: ['addresses', 'date'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(tokenOverviewArgsSchema, args);
    const data = await apiClient.getTokenOverview(validated.addresses, validated.date);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};
