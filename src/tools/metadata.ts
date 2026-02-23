import type { OctavAPIClient } from '../api/client.js';
import { statusArgsSchema, creditsArgsSchema } from '../utils/schemas.js';
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
