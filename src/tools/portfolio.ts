import type { OctavAPIClient } from '../api/client.js';
import {
  portfolioArgsSchema,
  walletArgsSchema,
  navArgsSchema,
  tokenOverviewArgsSchema,
} from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';
import {
  formatPortfolioResponse,
  formatWalletResponse,
  formatNAVResponse,
  formatTokenOverviewResponse,
} from '../formatters/index.js';

export const getPortfolio = {
  definition: {
    name: 'octav_get_portfolio',
    title: 'Get Full Portfolio',
    description:
      'Get complete portfolio including wallet holdings and DeFi protocol positions across 20+ blockchains. Returns token balances, values, and protocol positions. Costs 1 credit per address.',
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
    const validated = validateInput(portfolioArgsSchema, args);
    const data = await apiClient.getPortfolio(validated.addresses);
    const formatted = formatPortfolioResponse(data);

    return {
      content: [
        { type: 'text', text: formatted.markdown },
        { type: 'text', text: JSON.stringify(formatted.json, null, 2) },
      ],
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
    const formatted = formatWalletResponse(data);

    return {
      content: [
        { type: 'text', text: formatted.markdown },
        { type: 'text', text: JSON.stringify(formatted.json, null, 2) },
      ],
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
    const formatted = formatNAVResponse(data);

    return {
      content: [
        { type: 'text', text: formatted.markdown },
        { type: 'text', text: JSON.stringify(formatted.json, null, 2) },
      ],
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
    const validated = validateInput(tokenOverviewArgsSchema, args);
    const data = await apiClient.getTokenOverview(validated.addresses);
    const formatted = formatTokenOverviewResponse(data);

    return {
      content: [
        { type: 'text', text: formatted.markdown },
        { type: 'text', text: JSON.stringify(formatted.json, null, 2) },
      ],
    };
  },
};
