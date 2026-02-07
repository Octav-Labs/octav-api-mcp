import type { TransactionsResponse, SyncResponse } from '../api/types.js';

export function formatTransactionsResponse(data: TransactionsResponse): {
  markdown: string;
  json: any;
} {
  const lines: string[] = ['# Transaction History\n'];

  lines.push(`**Total Transactions:** ${data.total}`);
  lines.push(`**Showing:** ${data.offset + 1}-${Math.min(data.offset + data.limit, data.total)}\n`);

  if (data.transactions && data.transactions.length > 0) {
    lines.push('## Recent Transactions\n');
    data.transactions.forEach((tx, i) => {
      const date = new Date(tx.timestamp * 1000).toISOString().split('T')[0];
      const time = new Date(tx.timestamp * 1000).toISOString().split('T')[1].split('.')[0];

      lines.push(`### ${i + 1}. ${tx.type || 'Transaction'} on ${tx.chain}`);
      lines.push(`- **Hash:** \`${tx.hash}\``);
      lines.push(`- **Date:** ${date} ${time}`);
      lines.push(`- **From:** \`${tx.from}\``);
      lines.push(`- **To:** \`${tx.to}\``);
      lines.push(`- **Value:** ${tx.value}`);
      lines.push(`- **Status:** ${tx.status}`);
      if (tx.gasUsed) lines.push(`- **Gas Used:** ${tx.gasUsed}`);
      lines.push('');
    });
  }

  // Pagination info
  const hasMore = data.offset + data.limit < data.total;
  if (hasMore) {
    const nextOffset = data.offset + data.limit;
    lines.push(`\n*To view more transactions, set offset to ${nextOffset}*`);
  }

  return {
    markdown: lines.join('\n'),
    json: data,
  };
}

export function formatSyncResponse(data: SyncResponse): {
  markdown: string;
  json: any;
} {
  const markdown = `# Transaction Sync ${data.status === 'success' ? '✓' : '✗'}

**Address:** \`${data.address}\`
**Status:** ${data.status}
**Message:** ${data.message}`;

  return {
    markdown,
    json: data,
  };
}
