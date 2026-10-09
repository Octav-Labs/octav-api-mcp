import type { OctavAPIClient } from '../api/client.js';
import * as portfolio from './portfolio.js';
import * as transactions from './transactions.js';
import * as historical from './historical.js';
import * as metadata from './metadata.js';
import * as specialized from './specialized.js';
import * as addressbook from './addressbook.js';
import * as bundles from './bundles.js';
import * as virtualUsers from './virtual-users.js';

interface Tool {
  definition: {
    name: string;
    title: string;
    description: string;
    inputSchema: any;
    annotations?: any;
  };
  execute: (args: any, apiClient: OctavAPIClient) => Promise<any>;
}

export class ToolRegistry {
  private tools: Map<string, Tool>;

  constructor() {
    this.tools = new Map();

    // Register portfolio tools
    this.register(portfolio.getPortfolio);
    this.register(portfolio.getWallet);
    this.register(portfolio.getNAV);
    this.register(portfolio.getTokenOverview);
    this.register(portfolio.getPortfolioAtBlock);

    // Register transaction tools
    this.register(transactions.getTransactions);
    this.register(transactions.syncTransactions);

    // Register historical tools
    this.register(historical.getHistorical);
    this.register(historical.subscribeSnapshot);

    // Register metadata tools
    this.register(metadata.getStatus);
    this.register(metadata.getCredits);
    this.register(metadata.getChains);
    this.register(metadata.getChainProtocols);
    this.register(metadata.getContractProtocol);

    // Register specialized tools
    this.register(specialized.getAirdrop);
    this.register(specialized.getPolymarket);
    this.register(specialized.getAgentWallet);
    this.register(specialized.getAgentPortfolio);
    this.register(specialized.getApprovals);

    // Register virtual user tools
    this.register(virtualUsers.listVirtualUsers);
    this.register(virtualUsers.getVirtualUsersPortfolio);

    // Register address book tools
    this.register(addressbook.listAddressBook);
    this.register(addressbook.addAddressBookEntries);
    this.register(addressbook.renameAddressBookEntry);
    this.register(addressbook.removeAddressBookEntry);

    // Register bundle tools
    this.register(bundles.listBundles);
    this.register(bundles.getBundle);
    this.register(bundles.createBundle);
    this.register(bundles.renameBundle);
    this.register(bundles.deleteBundle);
    this.register(bundles.addBundleAddress);
    this.register(bundles.removeBundleAddress);
  }

  private register(tool: Tool) {
    this.tools.set(tool.definition.name, tool);
  }

  getAllToolDefinitions() {
    return Array.from(this.tools.values()).map((tool) => tool.definition);
  }

  async executeTool(name: string, args: any, apiClient: OctavAPIClient) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }
    return await tool.execute(args, apiClient);
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }
}

export const toolRegistry = new ToolRegistry();
