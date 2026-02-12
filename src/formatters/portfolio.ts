import type {
  PortfolioResponse,
  NAVResponse,
  TokenOverviewResponse,
} from "../api/types.js";

function formatUsd(value: number): string {
  return (
    "$" +
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function formatPortfolioResponse(data: PortfolioResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ["# Portfolio Summary\n"];

  // Calculate total value
  let walletTotal = 0;
  let protocolTotal = 0;

  for (const assets of Object.values(data.wallets || {})) {
    assets.forEach((asset) => {
      if (asset.value) walletTotal += asset.value;
    });
  }

  const protocols = data.protocols || [];
  protocols.forEach((protocol) => {
    if (protocol.totalValue) protocolTotal += protocol.totalValue;
  });

  const totalValue = walletTotal + protocolTotal;
  lines.push(`**Total Portfolio Value:** ${formatUsd(totalValue)}`);
  lines.push(`- Wallet holdings: ${formatUsd(walletTotal)}`);
  lines.push(`- DeFi positions: ${formatUsd(protocolTotal)}\n`);

  // Wallet holdings by chain with asset details
  const chainEntries = Object.entries(data.wallets || {})
    .map(([chain, assets]) => {
      const chainValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
      return { chain, assets, chainValue };
    })
    .filter((c) => c.chainValue > 0)
    .sort((a, b) => b.chainValue - a.chainValue);

  if (chainEntries.length > 0) {
    lines.push("## Wallet Holdings\n");
    for (const { chain, assets, chainValue } of chainEntries) {
      lines.push(`### ${chain} — ${formatUsd(chainValue)}\n`);
      assets
        .filter((a) => a.value && a.value > 1)
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .forEach((asset) => {
          lines.push(
            `- ${asset.symbol}: ${asset.balance} (${formatUsd(asset.value || 0)})`,
          );
        });
      const dust = assets.filter((a) => !a.value || a.value <= 1);
      if (dust.length > 0) {
        lines.push(`- _${dust.length} other tokens under $1_`);
      }
      lines.push("");
    }
  }

  // DeFi protocols
  if (protocols.length > 0) {
    const activeProtocols = protocols
      .filter((p) => p.totalValue && p.totalValue > 0)
      .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));

    if (activeProtocols.length > 0) {
      lines.push("## DeFi Positions\n");
      activeProtocols.forEach((protocol) => {
        lines.push(
          `- **${protocol.protocol}** (${protocol.chain}): ${formatUsd(protocol.totalValue || 0)} — ${protocol.positions.length} position(s)`,
        );
      });
      lines.push("");
    }
  }

  if (data.timestamp) {
    lines.push(`_Updated: ${new Date(data.timestamp * 1000).toISOString()}_`);
  }

  return {
    markdown: lines.join("\n"),
    json: data,
  };
}

export function formatWalletResponse(data: PortfolioResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ["# Wallet Holdings\n"];

  let totalValue = 0;
  const chainEntries = Object.entries(data.wallets || {})
    .map(([chain, assets]) => {
      const chainValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);
      totalValue += chainValue;
      return { chain, assets, chainValue };
    })
    .filter((c) => c.chainValue > 0)
    .sort((a, b) => b.chainValue - a.chainValue);

  lines.push(`**Total Wallet Value:** ${formatUsd(totalValue)}\n`);

  for (const { chain, assets, chainValue } of chainEntries) {
    lines.push(`## ${chain} — ${formatUsd(chainValue)}\n`);
    assets
      .filter((a) => a.value && a.value > 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .forEach((asset) => {
        lines.push(
          `- ${asset.symbol}: ${asset.balance} (${formatUsd(asset.value || 0)})`,
        );
      });
    const dust = assets.filter((a) => !a.value || a.value <= 1);
    if (dust.length > 0) {
      lines.push(`- _${dust.length} other tokens under $1_`);
    }
    lines.push("");
  }

  if (data.timestamp) {
    lines.push(`_Updated: ${new Date(data.timestamp * 1000).toISOString()}_`);
  }

  return {
    markdown: lines.join("\n"),
    json: data,
  };
}

export function formatNAVResponse(data: NAVResponse): {
  markdown: string;
  json: any;
} {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    CAD: "$",
    AED: "د.إ",
    CHF: "CHF",
    SGD: "$",
  };

  const symbol =
    currencySymbols[data.currency.toUpperCase()] || data.currency.toUpperCase();

  const markdown = `# Net Asset Value

**NAV:** ${symbol}${data.nav.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
**Currency:** ${data.currency.toUpperCase()}`;

  return {
    markdown,
    json: data,
  };
}

export function formatTokenOverviewResponse(data: TokenOverviewResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ["# Token Distribution\n"];

  lines.push(
    `**Total Value:** $${data.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`,
  );

  if (data.tokens && data.tokens.length > 0) {
    lines.push("## Token Breakdown\n");
    data.tokens
      .sort((a, b) => b.value - a.value)
      .forEach((token, i) => {
        const chains = token.chains.join(", ");
        lines.push(
          `${i + 1}. **${token.symbol}**: $${token.value.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${token.percentage.toFixed(2)}%)`,
        );
        lines.push(`   - Balance: ${token.balance}`);
        lines.push(`   - Chains: ${chains}\n`);
      });
  }

  return {
    markdown: lines.join("\n"),
    json: data,
  };
}
