import type { AirdropResponse, PolymarketResponse } from '../api/types.js';

export function formatAirdropResponse(data: AirdropResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ['# Airdrop Eligibility\n'];

  lines.push(`**Address:** \`${data.address}\`\n`);

  if (data.airdrops && data.airdrops.length > 0) {
    const eligible = data.airdrops.filter((a) => a.eligible);
    const notEligible = data.airdrops.filter((a) => !a.eligible);

    if (eligible.length > 0) {
      lines.push('## ✓ Eligible Airdrops\n');
      eligible.forEach((airdrop) => {
        lines.push(`### ${airdrop.project}`);
        if (airdrop.amount) lines.push(`- **Amount:** ${airdrop.amount}`);
        if (airdrop.claimUrl) lines.push(`- **Claim:** ${airdrop.claimUrl}`);
        lines.push('');
      });
    }

    if (notEligible.length > 0) {
      lines.push('## ✗ Not Eligible\n');
      notEligible.forEach((airdrop) => {
        lines.push(`- ${airdrop.project}`);
      });
    }
  } else {
    lines.push('*No airdrop information available for this address.*');
  }

  return {
    markdown: lines.join('\n'),
    json: data,
  };
}

export function formatPolymarketResponse(data: PolymarketResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ['# Polymarket Positions\n'];

  lines.push(`**Address:** \`${data.address}\``);
  lines.push(`**Total Value:** $${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  lines.push(`**Total P&L:** ${data.totalPnL >= 0 ? '+' : ''}$${data.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n`);

  if (data.positions && data.positions.length > 0) {
    lines.push('## Active Positions\n');
    data.positions.forEach((pos, i) => {
      const pnlPrefix = pos.pnl >= 0 ? '+' : '';
      lines.push(`### ${i + 1}. ${pos.question}`);
      lines.push(`- **Outcome:** ${pos.outcome}`);
      lines.push(`- **Shares:** ${pos.shares}`);
      lines.push(`- **Avg Price:** $${pos.avgPrice.toFixed(4)}`);
      lines.push(`- **Current Price:** $${pos.currentPrice.toFixed(4)}`);
      lines.push(`- **Value:** $${pos.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      lines.push(`- **P&L:** ${pnlPrefix}$${pos.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      lines.push('');
    });
  } else {
    lines.push('*No active Polymarket positions found.*');
  }

  return {
    markdown: lines.join('\n'),
    json: data,
  };
}
