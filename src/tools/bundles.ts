import type { OctavAPIClient } from '../api/client.js';
import {
  listBundlesArgsSchema,
  getBundleArgsSchema,
  createBundleArgsSchema,
  renameBundleArgsSchema,
  deleteBundleArgsSchema,
  addBundleAddressArgsSchema,
  removeBundleAddressArgsSchema,
} from '../utils/schemas.js';
import { validateInput, requireConfirmation } from '../utils/validation.js';

export const listBundles = {
  definition: {
    name: 'octav_list_bundles',
    title: 'List Bundles',
    description:
      'List every bundle (a named group of address book addresses, as in Octav Pro) with its id, name, and addresses. Pass a bundle\'s addresses to octav_get_portfolio to see its holdings. Costs 1 credit.',
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
    validateInput(listBundlesArgsSchema, args);
    const data = await apiClient.listBundles();

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const getBundle = {
  definition: {
    name: 'octav_get_bundle',
    title: 'Get Bundle',
    description:
      'Get one bundle by id, with its name and addresses. Use octav_list_bundles to find bundle ids. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        bundleId: {
          type: 'string',
          description: 'Bundle id.',
        },
      },
      required: ['bundleId'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(getBundleArgsSchema, args);
    const data = await apiClient.getBundle(validated.bundleId);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const createBundle = {
  definition: {
    name: 'octav_create_bundle',
    title: 'Create Bundle',
    description:
      'Create a named bundle from addresses that are already in the address book (save them first with octav_add_address_book_entries). Names must be unique (case-sensitive), a bundle cannot be empty, and no two bundles may hold exactly the same addresses. Default limits are 5 bundles and 10 addresses per bundle. Bundles created through the API are private. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Bundle name, 1-255 characters.',
          minLength: 1,
          maxLength: 255,
        },
        addresses: {
          type: 'array',
          items: { type: 'string' },
          description: 'Addresses to include. Each must already be in the address book.',
          minItems: 1,
          maxItems: 100,
        },
      },
      required: ['name', 'addresses'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(createBundleArgsSchema, args);
    const data = await apiClient.createBundle(validated.name, validated.addresses);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const renameBundle = {
  definition: {
    name: 'octav_rename_bundle',
    title: 'Rename Bundle',
    description:
      'Rename a bundle, replacing its current name. Names must be unique (case-sensitive). Requires confirm: true. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        bundleId: {
          type: 'string',
          description: 'Bundle id.',
        },
        name: {
          type: 'string',
          description: 'New bundle name, 1-255 characters.',
          minLength: 1,
          maxLength: 255,
        },
        confirm: {
          type: 'boolean',
          description: 'Must be true. Confirms replacing the current name.',
        },
      },
      required: ['bundleId', 'name'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(renameBundleArgsSchema, args);
    requireConfirmation(
      validated.confirm,
      `This replaces the name of bundle ${validated.bundleId} on your Octav account`
    );
    const data = await apiClient.renameBundle(validated.bundleId, validated.name);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const deleteBundle = {
  definition: {
    name: 'octav_delete_bundle',
    title: 'Delete Bundle',
    description:
      'Delete a bundle. Its addresses stay in the address book. Requires confirm: true. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        bundleId: {
          type: 'string',
          description: 'Bundle id.',
        },
        confirm: {
          type: 'boolean',
          description: 'Must be true. Confirms permanently deleting the bundle.',
        },
      },
      required: ['bundleId'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(deleteBundleArgsSchema, args);
    requireConfirmation(
      validated.confirm,
      `This permanently deletes bundle ${validated.bundleId} from your Octav account (its addresses stay in the address book)`
    );
    await apiClient.deleteBundle(validated.bundleId);
    const data = { status: 'ok', message: 'Bundle deleted', id: validated.bundleId };

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const addBundleAddress = {
  definition: {
    name: 'octav_add_bundle_address',
    title: 'Add Address to Bundle',
    description:
      'Add one address to a bundle. The address must already be in the address book. Returns the updated bundle. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        bundleId: {
          type: 'string',
          description: 'Bundle id.',
        },
        address: {
          type: 'string',
          description: 'Address to add. Must already be in the address book.',
        },
      },
      required: ['bundleId', 'address'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(addBundleAddressArgsSchema, args);
    const data = await apiClient.addBundleAddress(validated.bundleId, validated.address);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const removeBundleAddress = {
  definition: {
    name: 'octav_remove_bundle_address',
    title: 'Remove Address from Bundle',
    description:
      'Remove one address from a bundle; it stays in the address book. A bundle cannot be emptied, so to remove its last address delete the bundle instead. Requires confirm: true. Returns the updated bundle. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        bundleId: {
          type: 'string',
          description: 'Bundle id.',
        },
        address: {
          type: 'string',
          description: 'Address to remove from the bundle.',
        },
        confirm: {
          type: 'boolean',
          description: 'Must be true. Confirms removing the address from the bundle.',
        },
      },
      required: ['bundleId', 'address'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(removeBundleAddressArgsSchema, args);
    requireConfirmation(
      validated.confirm,
      `This removes ${validated.address} from bundle ${validated.bundleId} on your Octav account (it stays in the address book)`
    );
    const data = await apiClient.removeBundleAddress(validated.bundleId, validated.address);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};
