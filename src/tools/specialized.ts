import type { OctavAPIClient } from '../api/client.js';
import {
  airdropArgsSchema,
  polymarketArgsSchema,
  agentWalletArgsSchema,
  agentPortfolioArgsSchema,
} from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';
import {
  formatAirdropResponse,
  formatPolymarketResponse,
  formatPortfolioResponse,
} from '../formatters/index.js';

export const getAirdrop = {
  definition: {
    name: 'octav_get_airdrop',
    title: 'Get Airdrop Eligibility',
    description:
      'Check airdrop eligibility for Solana address. Shows eligible airdrops with claim links. Solana addresses only. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Solana wallet address (base58 format)',
        },
      },
      required: ['address'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(airdropArgsSchema, args);
    const data = await apiClient.getAirdrop(validated.address);
    const formatted = formatAirdropResponse(data);

    return {
      content: [
{ type: 'text', text: formatted.markdown }],
    };
  },
};

export const getPolymarket = {
  definition: {
    name: 'octav_get_polymarket',
    title: 'Get Polymarket Positions',
    description:
      'Get Polymarket prediction market positions for address. Shows active positions, values, and P&L. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Ethereum wallet address (0x...)',
        },
      },
      required: ['address'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(polymarketArgsSchema, args);
    const data = await apiClient.getPolymarket(validated.address);
    const formatted = formatPolymarketResponse(data);

    return {
      content: [
{ type: 'text', text: formatted.markdown }],
    };
  },
};

export const getAgentWallet = {
  definition: {
    name: 'octav_agent_wallet',
    title: 'Get Wallet (x402 Payment)',
    description:
      'Get wallet holdings using x402 payment protocol. For AI agents with automatic payment. Returns wallet balances and values. Costs paid via HTTP 402 payment protocol.',
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
    const validated = validateInput(agentWalletArgsSchema, args);
    const data = await apiClient.getAgentWallet(validated.addresses);
    const formatted = formatPortfolioResponse(data);

    return {
      content: [
{ type: 'text', text: formatted.markdown }],
    };
  },
};

export const getAgentPortfolio = {
  definition: {
    name: 'octav_agent_portfolio',
    title: 'Get Portfolio (x402 Payment)',
    description:
      'Get full portfolio using x402 payment protocol. For AI agents with automatic payment. Returns wallet + DeFi positions. Costs paid via HTTP 402 payment protocol.',
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
    const validated = validateInput(agentPortfolioArgsSchema, args);
    const data = await apiClient.getAgentPortfolio(validated.addresses);
    const formatted = formatPortfolioResponse(data);

    return {
      content: [
{ type: 'text', text: formatted.markdown }],
    };
  },
};
