import type { OctavAPIClient } from '../api/client.js';
import {
  airdropArgsSchema,
  polymarketArgsSchema,
  agentWalletArgsSchema,
  agentPortfolioArgsSchema,
  approvalsArgsSchema,
} from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';
import { stripPortfolioFields } from '../utils/strip-portfolio.js';

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
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
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
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
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
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
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
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
    };
  },
};

export const getApprovals = {
  definition: {
    name: 'octav_get_approvals',
    title: 'Get Token Approvals',
    description:
      'Get the ERC-20 token approvals (allowances) a wallet has granted to spender contracts on one chain. Paginated: pass the returned cursor to get the next page; there are no more pages when it is absent or null. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'EVM wallet address (0x...)',
        },
        chain: {
          type: 'string',
          description:
            'Chain key: arbitrum, avalanche, base, binance, ethereum, fantom, gnosis, linea, optimism or polygon',
        },
        limit: {
          type: 'number',
          description: 'Approvals per page (default: 25, max: 100)',
          minimum: 1,
          maximum: 100,
          default: 25,
        },
        cursor: {
          type: 'string',
          description: 'Cursor from a previous response, to fetch the next page',
        },
      },
      required: ['address', 'chain'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(approvalsArgsSchema, args);
    const data = await apiClient.getApprovals(
      validated.address,
      validated.chain,
      validated.limit,
      validated.cursor
    );

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};
