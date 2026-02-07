import type { HistoricalResponse, SubscribeSnapshotResponse } from '../api/types.js';

export function formatHistoricalResponse(data: HistoricalResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = [`# Historical Portfolio - ${data.date}\n`];

  const portfolio = data.portfolio;

  // Calculate total value
  let totalValue = 0;
  for (const [_, assets] of Object.entries(portfolio.wallets || {})) {
    assets.forEach((asset) => {
      if (asset.value) totalValue += asset.value;
    });
  }

  (portfolio.protocols || []).forEach((protocol) => {
    if (protocol.totalValue) totalValue += protocol.totalValue;
  });

  lines.push(`**Address:** \`${data.address}\``);
  lines.push(`**Date:** ${data.date}`);
  lines.push(`**Total Value:** $${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`);

  // Top assets at that time
  const allAssets: Array<{ symbol: string; chain: string; value: number }> = [];
  for (const [chain, assets] of Object.entries(portfolio.wallets || {})) {
    assets.forEach((asset) => {
      if (asset.value && asset.value > 0) {
        allAssets.push({ symbol: asset.symbol, chain, value: asset.value });
      }
    });
  }

  if (allAssets.length > 0) {
    lines.push('## Top Holdings at Date\n');
    allAssets
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .forEach((asset, i) => {
        lines.push(
          `${i + 1}. **${asset.symbol}** (${asset.chain}): $${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        );
      });
  }

  return {
    markdown: lines.join('\n'),
    json: data,
  };
}

export function formatSubscribeSnapshotResponse(data: SubscribeSnapshotResponse): {
  markdown: string;
  json: any;
} {
  const markdown = `# Snapshot Subscription ${data.subscribed ? '✓' : '✗'}

**Address:** \`${data.address}\`
**Frequency:** ${data.frequency}
**Status:** ${data.subscribed ? 'Active' : 'Inactive'}

Automatic portfolio snapshots will be taken ${data.frequency} and stored for historical analysis.`;

  return {
    markdown,
    json: data,
  };
}
