import type { OctavAPIClient } from '../api/client.js';
import { historicalArgsSchema, subscribeSnapshotArgsSchema } from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';
import { stripPortfolioFields } from '../utils/strip-portfolio.js';

export const getHistorical = {
  definition: {
    name: 'octav_get_historical',
    title: 'Get Historical Portfolio',
    description:
      'Get portfolio snapshot for a specific date in the past. Shows holdings and values at that point in time. Costs 1 credit per address.',
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
          description: 'Date for historical snapshot (YYYY-MM-DD format)',
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
    const validated = validateInput(historicalArgsSchema, args);
    const data = await apiClient.getHistorical(validated.addresses, validated.date);
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
    };
  },
};

export const subscribeSnapshot = {
  definition: {
    name: 'octav_subscribe_snapshot',
    title: 'Subscribe to Snapshots',
    description:
      'Subscribe to automatic portfolio snapshots. Enables historical tracking. Costs 1200 credits. API expects addresses with optional descriptions.',
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
        description: {
          type: 'string',
          description: 'Optional description for the subscription',
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
    const validated = validateInput(subscribeSnapshotArgsSchema, args);
    const addressPayload = validated.addresses.map((addr: string) => ({
      address: addr,
      ...(validated.description ? { description: validated.description } : {}),
    }));
    const data = await apiClient.subscribeSnapshot(addressPayload);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};
