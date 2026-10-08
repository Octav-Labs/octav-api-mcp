import type { OctavAPIClient } from '../api/client.js';
import {
  listVirtualUsersArgsSchema,
  virtualUsersPortfolioArgsSchema,
} from '../utils/schemas.js';
import { validateInput } from '../utils/validation.js';
import { stripPortfolioFields } from '../utils/strip-portfolio.js';

export const listVirtualUsers = {
  definition: {
    name: 'octav_list_virtual_users',
    title: 'List Virtual Users',
    description:
      'List the virtual users on the account (balance-tracking or CEX-linked accounts managed in Octav Pro), with their virtual:<id> address, type, and label. Requires Pro. Costs 1 credit.',
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
    validateInput(listVirtualUsersArgsSchema, args);
    const data = await apiClient.listVirtualUsers();

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const getVirtualUsersPortfolio = {
  definition: {
    name: 'octav_get_virtual_users_portfolio',
    title: 'Get Virtual Users Portfolio',
    description:
      'Get portfolios for virtual users, using the virtual:<id> addresses from octav_list_virtual_users. Same shape as octav_get_portfolio; set aggregated for one combined portfolio. Waits for a fresh sync by default. Requires Pro. Costs 1 credit per address.',
    inputSchema: {
      type: 'object',
      properties: {
        addresses: {
          type: 'array',
          items: { type: 'string' },
          description: 'Virtual user addresses (virtual:<id>). Max 10 addresses.',
          minItems: 1,
          maxItems: 10,
        },
        aggregated: {
          type: 'boolean',
          description: 'Return one portfolio aggregated across all the virtual users (default: false)',
          default: false,
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
    const validated = validateInput(virtualUsersPortfolioArgsSchema, args);
    const data = await apiClient.getVirtualUsersPortfolio(
      validated.addresses,
      validated.aggregated,
      {
        waitForSync: validated.waitForSync,
        includeExplorerUrls: validated.includeExplorerUrls,
      }
    );
    const stripped = stripPortfolioFields(data);

    return {
      content: [{ type: 'text', text: JSON.stringify(stripped, null, 2) }],
    };
  },
};
