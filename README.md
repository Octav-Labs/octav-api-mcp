```bash
 ██████╗  ██████╗████████╗ █████╗ ██╗   ██╗
██╔═══██╗██╔════╝╚══██╔══╝██╔══██╗██║   ██║
██║   ██║██║        ██║   ███████║██║   ██║
██║   ██║██║        ██║   ██╔══██║╚██╗ ██╔╝
╚██████╔╝╚██████╗   ██║   ██║  ██║ ╚████╔╝
 ╚═════╝  ╚═════╝   ╚═╝   ╚═╝  ╚═╝  ╚═══╝
```
# Octav API MCP Server

MCP (Model Context Protocol) server for the [Octav](https://octav.fi) cryptocurrency portfolio tracking API. This server enables LLM agents to query portfolio data, transaction history, net worth, and historical snapshots across 20+ blockchains.

## Features

- 🔗 **20+ Blockchain Support**: Ethereum, Solana, Arbitrum, Base, Polygon, and more
- 💼 **Complete Portfolio Tracking**: Wallets + DeFi protocol positions
- 📊 **Transaction History**: Advanced filtering and pagination
- 💰 **Multi-Currency NAV**: USD, EUR, GBP, JPY, CNY, ETH, BTC
- 📸 **Historical Snapshots**: Track portfolio value over time
- 🎯 **Token Distribution**: Aggregated token holdings across chains
- 🎁 **Airdrop Tracking**: Solana airdrop eligibility
- 📈 **Polymarket Positions**: Prediction market tracking
- 🧱 **Portfolio at Block**: Portfolio valued at a specific historical block
- 🔐 **Token Approvals**: ERC-20 allowances granted to spender contracts
- 📒 **Address Book & Bundles**: Manage saved addresses and named groups of them
- 🤖 **x402 Payment Protocol**: AI agent-friendly endpoints

## Installation

### For End Users

The easiest way to use this MCP server is with npx (no installation required):

```bash
npx octav-api-mcp
```

Or install globally:

```bash
npm install -g octav-api-mcp
# or
pnpm add -g octav-api-mcp
```

### For Development

Clone the repository and build from source:

```bash
git clone https://github.com/Octav-Labs/octav-api-mcp.git
cd octav-api-mcp
pnpm install
pnpm build
```

## Configuration

Create a `.env` file in the project root:

```bash
OCTAV_API_KEY=your-api-key-here
```

Get your API key from [octav.fi](https://octav.fi/api).

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "octav": {
      "command": "npx",
      "args": ["-y", "octav-api-mcp"],
      "env": {
        "OCTAV_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

The `-y` flag automatically confirms package installation if not already cached.

**Alternative (if installed globally):**

```json
{
  "mcpServers": {
    "octav": {
      "command": "octav-api-mcp",
      "env": {
        "OCTAV_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### With MCP Inspector

For testing and debugging:

```bash
pnpm build
pnpm dlx @modelcontextprotocol/inspector node build/index.js
```

## Available Tools

All tools use the `octav_` prefix for namespace clarity.

### Portfolio & Holdings (5 tools)

#### 1. `octav_get_portfolio`
Get complete portfolio including wallet holdings and DeFi protocol positions.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)
- `waitForSync` (optional): Wait for a fresh sync when cached data is stale. Default: true
- `includeExplorerUrls` (optional): Include blockchain explorer URLs. Default: false

**Cost:** 1 credit per address

#### 2. `octav_get_wallet`
Get wallet holdings only (excludes DeFi protocols).

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** 1 credit per address

#### 3. `octav_get_nav`
Get total net worth (NAV) in specified currency.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)
- `currency` (optional): Currency code (usd, eur, gbp, jpy, cny, eth, btc). Default: usd

**Cost:** 1 credit per address

#### 4. `octav_get_token_overview`
Get aggregated token distribution across all chains.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** 1 credit per address

#### 5. `octav_get_portfolio_at_block`
Get a single EVM address's portfolio valued at a specific block. Requires the Portfolio at Block add-on.

**Parameters:**
- `address` (required): EVM wallet address
- `chain` (required): `ethereum`, `linea` or `monad`
- `block` (required): Block number

**Cost:** 1 credit (plus the add-on)

### Transactions (2 tools)

#### 6. `octav_get_transactions`
Query transaction history with filtering and pagination.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)
- `chain` (optional): Chain keys to filter by, comma-separated (e.g. `ethereum,arbitrum`)
- `type` (optional): Transaction types to filter by, comma-separated (e.g. `SWAP,DEPOSIT`)
- `protocol` (optional): Protocol keys to filter by, comma-separated
- `interactingAddresses` (optional): Array of counterparty addresses to filter by
- `search` (optional): Full-text search over token symbols, names and addresses
- `tokenId` (optional): NFT token ID
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `sort` (optional): `ASC` or `DESC` by timestamp. Default: `DESC`
- `hideSpam` (optional): Exclude spam transactions
- `hideDust` (optional): Exclude dust transactions
- `offset` (optional): Pagination offset. Default: 0
- `limit` (optional): Number of results (1-250). Default: 50

**Cost:** 1 credit per address

#### 7. `octav_sync_transactions`
Manually trigger transaction synchronization.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** 1 credit per address

### Historical & Snapshots (2 tools)

#### 8. `octav_get_historical`
Get portfolio snapshot for a specific date in the past.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)
- `date` (required): Date for snapshot (YYYY-MM-DD)

**Cost:** 1 credit per address

#### 9. `octav_subscribe_snapshot`
Subscribe to automatic portfolio snapshots.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)
- `frequency` (required): Snapshot frequency (daily, weekly, monthly)

**Cost:** 1 credit per address

### Metadata (5 tools)

#### 10. `octav_get_status`
Check synchronization status across all chains.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** FREE

#### 11. `octav_get_credits`
Check API credit balance and usage.

**Parameters:** None

**Cost:** FREE

#### 12. `octav_get_chains`
List every supported chain with its key, name, chain id, and whether portfolio and transactions are supported. Chain keys are what the `chain` parameters of other tools take.

**Parameters:** None

**Cost:** FREE

#### 13. `octav_get_chain_protocols`
List the protocols tracked on a chain, with the keys used by the `protocol` filter of `octav_get_transactions`.

**Parameters:**
- `chain` (required): Chain key
- `page` (optional): Page number. Default: 1
- `limit` (optional): Protocols per page (1-100). Default: 20

**Cost:** FREE

#### 14. `octav_get_contract_protocol`
Identify the DeFi protocol a contract address belongs to.

**Parameters:**
- `contract` (required): Contract address (EVM or Solana)
- `chain` (optional): Chain key. Omit to search every chain.

**Cost:** 5 credits, refunded if no protocol is found

### Specialized (5 tools)

#### 15. `octav_get_airdrop`
Check airdrop eligibility (Solana only).

**Parameters:**
- `address` (required): Solana wallet address

**Cost:** 1 credit

#### 16. `octav_get_polymarket`
Get Polymarket prediction market positions.

**Parameters:**
- `address` (required): Ethereum wallet address

**Cost:** 1 credit

#### 17. `octav_agent_wallet`
Get wallet holdings via x402 payment protocol (for AI agents).

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** Paid via HTTP 402 payment protocol

#### 18. `octav_agent_portfolio`
Get full portfolio via x402 payment protocol (for AI agents).

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** Paid via HTTP 402 payment protocol

#### 19. `octav_get_approvals`
Get the ERC-20 token approvals a wallet has granted on one chain. Paginated by cursor.

**Parameters:**
- `address` (required): EVM wallet address
- `chain` (required): `arbitrum`, `avalanche`, `base`, `binance`, `ethereum`, `fantom`, `gnosis`, `linea`, `optimism` or `polygon`
- `limit` (optional): Approvals per page (1-100). Default: 25
- `cursor` (optional): Cursor from the previous page

**Cost:** 1 credit

### Virtual Users (2 tools)

Virtual users are balance-tracking or CEX-linked accounts managed in [Octav Pro](https://pro.octav.fi), addressed as `virtual:<id>`. They require Pro.

#### 20. `octav_list_virtual_users`
List the account's virtual users with their `virtual:<id>` addresses.

**Parameters:** None

**Cost:** 1 credit

#### 21. `octav_get_virtual_users_portfolio`
Get portfolios for virtual users.

**Parameters:**
- `addresses` (required): Array of `virtual:<id>` addresses (max 10)
- `aggregated` (optional): Return one combined portfolio. Default: false
- `waitForSync` (optional): Wait for a fresh sync when cached data is stale. Default: true
- `includeExplorerUrls` (optional): Include blockchain explorer URLs. Default: false

**Cost:** 1 credit per address

### Address Book (4 tools)

The address book is the list of addresses saved to your account, the same list you see in [Octav Pro](https://pro.octav.fi). Entries are keyed by address.

Tools that delete or overwrite account data refuse to run unless called with `confirm: true`, like `--yes` in the [Octav CLI](https://github.com/Octav-Labs/octav-cli). Without it they return an error describing what would change.

#### 22. `octav_list_address_book`
List every saved address with its label, plan, plan expiry, and paid status.

**Parameters:** None

**Cost:** 1 credit

#### 23. `octav_add_address_book_entries`
Save addresses to the address book. An address already in the book keeps its existing label.

**Parameters:**
- `entries` (required): Array of 1-100 `{ address, label? }` objects. Labels are up to 255 characters.

**Cost:** 1 credit

#### 24. `octav_rename_address_book_entry`
Change the label on a saved address.

**Parameters:**
- `address` (required): Address of the entry
- `label` (required): New label, up to 255 characters. An empty string clears it.
- `confirm` (required): Must be `true`, since this replaces the current label

**Cost:** 1 credit

#### 25. `octav_remove_address_book_entry`
Remove an address from the address book. Entries on a paid plan or authorized by the wallet owner must be removed in Octav Pro instead.

**Parameters:**
- `address` (required): Address of the entry
- `confirm` (required): Must be `true`

**Cost:** 1 credit

### Bundles (7 tools)

Bundles are named groups of address book addresses, the same bundles you see in Octav Pro. Every address in a bundle must already be in the address book. By default an account can have 5 bundles of up to 10 addresses each.

#### 26. `octav_list_bundles`
List every bundle with its id, name, and addresses.

**Parameters:** None

**Cost:** 1 credit

#### 27. `octav_get_bundle`
Get one bundle by id.

**Parameters:**
- `bundleId` (required): Bundle id

**Cost:** 1 credit

#### 28. `octav_create_bundle`
Create a bundle. Names must be unique, and no two bundles may hold exactly the same addresses.

**Parameters:**
- `name` (required): Bundle name, 1-255 characters
- `addresses` (required): Array of addresses already in the address book

**Cost:** 1 credit

#### 29. `octav_rename_bundle`
Rename a bundle.

**Parameters:**
- `bundleId` (required): Bundle id
- `name` (required): New name, 1-255 characters
- `confirm` (required): Must be `true`, since this replaces the current name

**Cost:** 1 credit

#### 30. `octav_delete_bundle`
Delete a bundle. Its addresses stay in the address book.

**Parameters:**
- `bundleId` (required): Bundle id
- `confirm` (required): Must be `true`

**Cost:** 1 credit

#### 31. `octav_add_bundle_address`
Add an address from the address book to a bundle.

**Parameters:**
- `bundleId` (required): Bundle id
- `address` (required): Address to add

**Cost:** 1 credit

#### 32. `octav_remove_bundle_address`
Remove an address from a bundle. It stays in the address book. To remove a bundle's last address, delete the bundle instead.

**Parameters:**
- `bundleId` (required): Bundle id
- `address` (required): Address to remove
- `confirm` (required): Must be `true`

**Cost:** 1 credit

## Address Formats

The server accepts two address formats:

- **EVM addresses**: `0x` followed by 40 hex characters (Ethereum, Polygon, Arbitrum, Base, etc.)
- **Solana addresses**: 32-44 character base58 strings

The address book and bundle tools also accept Starknet and Tron addresses.

## Response Format

All tools return the Octav API response as JSON.

## API Costs & Rate Limits

- Most endpoints cost **1 credit per address**
- `octav_get_status`, `octav_get_credits`, `octav_get_chains` and `octav_get_chain_protocols` are **FREE**
- `octav_get_contract_protocol` costs **5 credits**, refunded if no protocol is found
- Transaction queries have a **max limit of 250** per request
- Max **10 addresses** per request
- Purchase credits at [octav.fi](https://octav.fi)

## Error Handling

The server provides clear error messages for:

- **Validation errors**: Invalid address formats, parameter constraints
- **Authentication errors**: Invalid API key
- **Insufficient credits**: Low balance with purchase link
- **Rate limiting**: Retry suggestions
- **Network errors**: Connection issues

## Development

### Build

```bash
pnpm build
```

### Watch Mode

```bash
pnpm dev
```

### Testing

```bash
pnpm test
```

## Example Usage

Once configured with Claude Desktop, you can ask questions like:

- "What's in my Ethereum wallet 0x..."
- "Show me my complete crypto portfolio for addresses X, Y, Z"
- "What was my net worth on 2024-01-01?"
- "Get my transaction history for the last month"
- "Am I eligible for any Solana airdrops?"
- "What are my Polymarket positions?"
- "Which contracts can spend my tokens on Ethereum?"
- "What was 0x... worth at Ethereum block 19000000?"
- "Save 0x... to my address book as Treasury and add it to my Client A bundle"

## Supported Chains

Ethereum, Solana, Arbitrum, Base, Polygon, Optimism, BNB Chain, Avalanche, Fantom, Cronos, Gnosis, Celo, Moonbeam, Moonriver, Harmony, Aurora, Metis, Boba, Fuse, Evmos, Kava, and more.

## License

MIT

## Links

- [Octav Website](https://octav.fi)
- [Octav API Documentation](https://docs.octav.fi)
- [Model Context Protocol](https://modelcontextprotocol.io)

## Support

For API issues or questions, visit [octav.fi](https://octav.fi) or check the [API documentation](https://docs.octav.fi).
