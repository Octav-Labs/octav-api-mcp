import type {
  PortfolioResponse,
  NAVResponse,
  TokenOverviewResponse,
} from '../api/types.js';

export function formatPortfolioResponse(data: PortfolioResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ['# Portfolio Summary\n'];

  // Calculate total value
  let totalValue = 0;
  const walletsByChain: Array<{ chain: string; value: number; assets: number }> = [];

  for (const [chain, assets] of Object.entries(data.wallets || {})) {
    let chainValue = 0;
    assets.forEach((asset) => {
      if (asset.value) chainValue += asset.value;
    });
    walletsByChain.push({ chain, value: chainValue, assets: assets.length });
    totalValue += chainValue;
  }

  // Add protocol values
  const protocols = data.protocols || [];
  protocols.forEach((protocol) => {
    if (protocol.totalValue) totalValue += protocol.totalValue;
  });

  lines.push(`**Total Portfolio Value:** $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`);

  // Wallet holdings by chain
  if (walletsByChain.length > 0) {
    lines.push('## Wallet Holdings\n');
    walletsByChain
      .sort((a, b) => b.value - a.value)
      .forEach(({ chain, value, assets }) => {
        lines.push(
          `- **${chain}**: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${assets} assets)`
        );
      });
    lines.push('');
  }

  // Top 5 assets by value
  const allAssets: Array<{ symbol: string; chain: string; value: number; balance: string }> = [];
  for (const [chain, assets] of Object.entries(data.wallets || {})) {
    assets.forEach((asset) => {
      if (asset.value && asset.value > 0) {
        allAssets.push({
          symbol: asset.symbol,
          chain,
          value: asset.value,
          balance: asset.balance,
        });
      }
    });
  }

  if (allAssets.length > 0) {
    lines.push('## Top Assets\n');
    allAssets
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .forEach((asset, i) => {
        lines.push(
          `${i + 1}. **${asset.symbol}** (${asset.chain}): $${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        );
      });
    lines.push('');
  }

  // DeFi protocols
  if (protocols.length > 0) {
    lines.push('## DeFi Protocol Positions\n');
    protocols
      .filter((p) => p.totalValue && p.totalValue > 0)
      .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
      .forEach((protocol) => {
        lines.push(
          `- **${protocol.protocol}** (${protocol.chain}): $${(protocol.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${protocol.positions.length} positions)`
        );
      });
    lines.push('');
  }

  if (data.timestamp) {
    lines.push(`*Data timestamp: ${new Date(data.timestamp * 1000).toISOString()}*`);
  }

  return {
    markdown: lines.join('\n'),
    json: data,
  };
}

export function formatWalletResponse(data: PortfolioResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ['# Wallet Holdings Summary\n'];

  let totalValue = 0;
  const walletsByChain: Array<{ chain: string; value: number; assets: number }> = [];

  for (const [chain, assets] of Object.entries(data.wallets || {})) {
    let chainValue = 0;
    assets.forEach((asset) => {
      if (asset.value) chainValue += asset.value;
    });
    walletsByChain.push({ chain, value: chainValue, assets: assets.length });
    totalValue += chainValue;
  }

  lines.push(`**Total Wallet Value:** $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`);

  lines.push('## Holdings by Chain\n');
  walletsByChain
    .sort((a, b) => b.value - a.value)
    .forEach(({ chain, value, assets }) => {
      lines.push(
        `- **${chain}**: $${value.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${assets} assets)`
      );
    });

  if (data.timestamp) {
    lines.push(`\n*Data timestamp: ${new Date(data.timestamp * 1000).toISOString()}*`);
  }

  return {
    markdown: lines.join('\n'),
    json: data,
  };
}

export function formatNAVResponse(data: NAVResponse): {
  markdown: string;
  json: any;
} {
  const currencySymbols: Record<string, string> = {
    usd: '$',
    eur: '€',
    gbp: '£',
    jpy: '¥',
    cny: '¥',
    eth: 'Ξ',
    btc: '₿',
  };

  const symbol = currencySymbols[data.currency.toLowerCase()] || data.currency.toUpperCase();

  const markdown = `# Net Asset Value

**Address:** \`${data.address}\`
**NAV:** ${symbol}${data.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
**Currency:** ${data.currency.toUpperCase()}

*Timestamp: ${data.timestamp ? new Date(data.timestamp * 1000).toISOString() : 'N/A'}*`;

  return {
    markdown,
    json: data,
  };
}

export function formatTokenOverviewResponse(data: TokenOverviewResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ['# Token Distribution\n'];

  lines.push(`**Total Value:** $${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`);

  if (data.tokens && data.tokens.length > 0) {
    lines.push('## Token Breakdown\n');
    data.tokens
      .sort((a, b) => b.value - a.value)
      .forEach((token, i) => {
        const chains = token.chains.join(', ');
        lines.push(
          `${i + 1}. **${token.symbol}**: $${token.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${token.percentage.toFixed(2)}%)`
        );
        lines.push(`   - Balance: ${token.balance}`);
        lines.push(`   - Chains: ${chains}\n`);
      });
  }

  return {
    markdown: lines.join('\n'),
    json: data,
  };
}
