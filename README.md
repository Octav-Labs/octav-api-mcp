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
- 🤖 **x402 Payment Protocol**: AI agent-friendly endpoints

## Installation

```bash
pnpm install
pnpm build
```

## Configuration

Create a `.env` file in the project root:

```bash
OCTAV_API_KEY=your-api-key-here
```

Get your API key from [octav.fi](https://octav.fi).

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "octav": {
      "command": "node",
      "args": ["/absolute/path/to/octav-api-mcp/build/index.js"],
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

### Portfolio & Holdings (4 tools)

#### 1. `octav_get_portfolio`
Get complete portfolio including wallet holdings and DeFi protocol positions.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

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

### Transactions (2 tools)

#### 5. `octav_get_transactions`
Query transaction history with filtering and pagination.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)
- `chain` (optional): Filter by specific chain
- `type` (optional): Filter by transaction type
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `offset` (optional): Pagination offset. Default: 0
- `limit` (optional): Number of results (1-250). Default: 50

**Cost:** 1 credit per address

#### 6. `octav_sync_transactions`
Manually trigger transaction synchronization.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** 1 credit per address

### Historical & Snapshots (2 tools)

#### 7. `octav_get_historical`
Get portfolio snapshot for a specific date in the past.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)
- `date` (required): Date for snapshot (YYYY-MM-DD)

**Cost:** 1 credit per address

#### 8. `octav_subscribe_snapshot`
Subscribe to automatic portfolio snapshots.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)
- `frequency` (required): Snapshot frequency (daily, weekly, monthly)

**Cost:** 1 credit per address

### Metadata (2 tools)

#### 9. `octav_get_status`
Check synchronization status across all chains.

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** FREE

#### 10. `octav_get_credits`
Check API credit balance and usage.

**Parameters:** None

**Cost:** FREE

### Specialized (4 tools)

#### 11. `octav_get_airdrop`
Check airdrop eligibility (Solana only).

**Parameters:**
- `address` (required): Solana wallet address

**Cost:** 1 credit

#### 12. `octav_get_polymarket`
Get Polymarket prediction market positions.

**Parameters:**
- `address` (required): Ethereum wallet address

**Cost:** 1 credit

#### 13. `octav_agent_wallet`
Get wallet holdings via x402 payment protocol (for AI agents).

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** Paid via HTTP 402 payment protocol

#### 14. `octav_agent_portfolio`
Get full portfolio via x402 payment protocol (for AI agents).

**Parameters:**
- `addresses` (required): Array of wallet addresses (max 10)

**Cost:** Paid via HTTP 402 payment protocol

## Address Formats

The server accepts two address formats:

- **EVM addresses**: `0x` followed by 40 hex characters (Ethereum, Polygon, Arbitrum, Base, etc.)
- **Solana addresses**: 32-44 character base58 strings

## Response Format

All tools return dual-format responses:

1. **Markdown Summary**: Human-readable overview with key metrics
2. **Full JSON**: Complete API response data for programmatic access

## API Costs & Rate Limits

- Most endpoints cost **1 credit per address**
- `octav_get_status` and `octav_get_credits` are **FREE**
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
