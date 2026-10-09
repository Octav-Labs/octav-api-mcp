import type { OctavAPIClient } from '../api/client.js';
import {
  listAddressBookArgsSchema,
  addAddressBookEntriesArgsSchema,
  renameAddressBookEntryArgsSchema,
  removeAddressBookEntryArgsSchema,
} from '../utils/schemas.js';
import { validateInput, requireConfirmation } from '../utils/validation.js';

export const listAddressBook = {
  definition: {
    name: 'octav_list_address_book',
    title: 'List Address Book',
    description:
      'List every address saved in the account address book (the same list shown in Octav Pro), with its label, plan (FREE, LITE, PRO), plan expiry, and whether the plan is paid. Costs 1 credit.',
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
    validateInput(listAddressBookArgsSchema, args);
    const data = await apiClient.listAddressBook();

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const addAddressBookEntries = {
  definition: {
    name: 'octav_add_address_book_entries',
    title: 'Add Address Book Entries',
    description:
      'Save addresses (EVM, Solana, Starknet, or Tron) to the address book, each with an optional label. An address already in the book keeps its existing label; use octav_rename_address_book_entry to change it. Accounts without a paid plan can save up to 50 addresses. Returns the full address book. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        entries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'Wallet address. Must be unique within the request.',
              },
              label: {
                type: 'string',
                description: 'Optional name for the address, up to 255 characters.',
                maxLength: 255,
              },
            },
            required: ['address'],
          },
          description: 'Addresses to save. 1-100 per request.',
          minItems: 1,
          maxItems: 100,
        },
      },
      required: ['entries'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(addAddressBookEntriesArgsSchema, args);
    const data = await apiClient.addAddressBookEntries(validated.entries);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const renameAddressBookEntry = {
  definition: {
    name: 'octav_rename_address_book_entry',
    title: 'Rename Address Book Entry',
    description:
      'Change the label on an address already in the address book, replacing the current one. Pass an empty string to clear the label. Requires confirm: true. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Address of the entry to rename.',
        },
        label: {
          type: 'string',
          description: 'New label, up to 255 characters. Empty string clears it.',
          maxLength: 255,
        },
        confirm: {
          type: 'boolean',
          description: 'Must be true. Confirms replacing the current label.',
        },
      },
      required: ['address', 'label'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(renameAddressBookEntryArgsSchema, args);
    requireConfirmation(
      validated.confirm,
      `This replaces the current label of ${validated.address} in the address book on your Octav account`
    );
    const data = await apiClient.renameAddressBookEntry(validated.address, validated.label);

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};

export const removeAddressBookEntry = {
  definition: {
    name: 'octav_remove_address_book_entry',
    title: 'Remove Address Book Entry',
    description:
      'Remove an address from the address book. Entries on a paid plan or authorized by the wallet owner cannot be removed through the API; they must be removed in Octav Pro. Requires confirm: true. Costs 1 credit.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Address of the entry to remove.',
        },
        confirm: {
          type: 'boolean',
          description: 'Must be true. Confirms permanently removing the address.',
        },
      },
      required: ['address'],
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      openWorldHint: true,
    },
  },
  async execute(args: any, apiClient: OctavAPIClient) {
    const validated = validateInput(removeAddressBookEntryArgsSchema, args);
    requireConfirmation(
      validated.confirm,
      `This permanently removes ${validated.address} from the address book on your Octav account`
    );
    await apiClient.removeAddressBookEntry(validated.address);
    const data = {
      status: 'ok',
      message: 'Address removed from address book',
      address: validated.address,
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  },
};
