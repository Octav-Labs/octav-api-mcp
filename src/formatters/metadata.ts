import type { StatusResponse, CreditsResponse } from '../api/types.js';

export function formatStatusResponse(data: StatusResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ['# Sync Status\n'];

  lines.push(`**Address:** \`${data.address}\``);
  lines.push(`**Overall Sync:** ${data.synced ? '✓ Synced' : '⏳ Syncing'}`);
  if (data.lastSync) {
    lines.push(`**Last Sync:** ${data.lastSync ? new Date(data.lastSync * 1000).toISOString() : 'Unknown'}\n`);
  } else {
    lines.push('');
  }

  if (data.chains && Object.keys(data.chains).length > 0) {
    lines.push('## Chain Status\n');
    for (const [chain, status] of Object.entries(data.chains)) {
      const syncStatus = status.synced ? '✓' : '⏳';
      const blockInfo = status.lastBlock ? ` (block ${status.lastBlock})` : '';
      lines.push(`- **${chain}**: ${syncStatus}${blockInfo}`);
    }
  }

  return {
    markdown: lines.join('\n'),
    json: data,
  };
}

export function formatCreditsResponse(data: CreditsResponse): {
  markdown: string;
  json: any;
} {
  const markdown = `# API Credits

**Balance:** ${data.balance} credits
**Used:** ${data.used} credits
**Remaining:** ${data.remaining} credits

${data.remaining < 10 ? '\n⚠️ **Low credit balance!** Consider purchasing more credits at https://octav.fi' : ''}`;

  return {
    markdown,
    json: data,
  };
}
