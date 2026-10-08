import type { OctavAPIClient } from '../api/client.js';
import {
  statusArgsSchema,
  creditsArgsSchema,
  chainsArgsSchema,
  chainProtocolsArgsSchema,
  contractProtocolArgsSchema,
} from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';

export const getStatus = {
  definition: {
    name: 'octav_get_status',
    title: 'Get Sync Status',
    description:
      'Check synchronization status of addresses across all chains. Shows which chains are synced and last sync time. FREE - no credits required.',
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
    const validated = validateInput(statusArgsSchema, args);
    const data = await apiClient.getStatus(validated.addresses);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const getCredits = {
  definition: {
    name: 'octav_get_credits',
    title: 'Get Credit Balance',
    description:
      'Check API credit balance, usage, and remaining credits. FREE - no credits required.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    validateInput(creditsArgsSchema, args);
    const data = await apiClient.getCredits();

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const getChains = {
  definition: {
    name: 'octav_get_chains',
    title: 'Get Supported Chains',
    description:
      'List every chain Octav supports, with its key (used by chain filters in other tools), name, chain id, and whether portfolio and transactions are supported. FREE - no credits required.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    validateInput(chainsArgsSchema, args);
    // Keep only what a model needs to pick chains; the rest of the response is image
    // and explorer URL templates, which make it almost five times larger
    const data = (await apiClient.getChains()).map(
      ({ key, name, chainId, isPortfolioSupported, isTransactionsSupported }) => ({
        key,
        name,
        chainId,
        isPortfolioSupported,
        isTransactionsSupported,
      })
    );

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const getChainProtocols = {
  definition: {
    name: 'octav_get_chain_protocols',
    title: 'Get Chain Protocols',
    description:
      'List the DeFi protocols Octav tracks on a chain, with their keys (used by the protocol filter on octav_get_transactions). Paginated; the response says whether more pages exist. FREE - no credits required.',
    inputSchema: {
      type: 'object',
      properties: {
        chain: {
          type: 'string',
          description: 'Chain key (e.g., ethereum, solana, arbitrum). See octav_get_chains.',
        },
        page: {
          type: 'number',
          description: 'Page number (default: 1)',
          minimum: 1,
          default: 1,
        },
        limit: {
          type: 'number',
          description: 'Protocols per page (default: 20, max: 100)',
          minimum: 1,
          maximum: 100,
          default: 20,
        },
      },
      required: ['chain'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(chainProtocolsArgsSchema, args);
    const data = await apiClient.getChainProtocols(
      validated.chain,
      validated.page,
      validated.limit
    );

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const getContractProtocol = {
  definition: {
    name: 'octav_get_contract_protocol',
    title: 'Get Contract Protocol',
    description:
      'Identify the DeFi protocol a contract address belongs to, such as a spender from octav_get_approvals or a transaction counterparty. With a chain it returns { protocol }; without one it returns { protocols } for every chain the address is known on. Costs 5 credits, refunded if no protocol is found.',
    inputSchema: {
      type: 'object',
      properties: {
        contract: {
          type: 'string',
          description: 'Contract address (EVM: 0x... or Solana base58)',
        },
        chain: {
          type: 'string',
          description: 'Chain key (e.g., ethereum, base). Omit to search every chain.',
        },
      },
      required: ['contract'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(contractProtocolArgsSchema, args);
    const data = await apiClient.getContractProtocol(validated.contract, validated.chain);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};
