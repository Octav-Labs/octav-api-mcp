import type { OctavAPIClient } from '../api/client.js';
import { historicalArgsSchema, subscribeSnapshotArgsSchema } from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';
import {
  formatHistoricalResponse,
  formatSubscribeSnapshotResponse,
} from '../formatters/index.js';

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
    const formatted = formatHistoricalResponse(data);

    return {
      content: [
{ type: 'text', text: formatted.markdown }],
    };
  },
};

export const subscribeSnapshot = {
  definition: {
    name: 'octav_subscribe_snapshot',
    title: 'Subscribe to Snapshots',
    description:
      'Subscribe to automatic portfolio snapshots at specified frequency (daily, weekly, or monthly). Enables historical tracking. Costs 1 credit per address.',
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
        frequency: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly'],
          description: 'Snapshot frequency: daily, weekly, or monthly',
        },
      },
      required: ['addresses', 'frequency'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(subscribeSnapshotArgsSchema, args);
    const data = await apiClient.subscribeSnapshot(validated.addresses, validated.frequency);
    const formatted = formatSubscribeSnapshotResponse(data);

    return {
      content: [
{ type: 'text', text: formatted.markdown }],
    };
  },
};
