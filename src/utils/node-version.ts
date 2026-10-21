// Oldest release per supported line that carries the October 2026 Node.js
// security fixes (eMudhra intermediate-CA blocklist, Brotli decoder RCE).
export const MIN_NODE_BY_MAJOR: Record<number, [number, number, number]> = {
  22: [22, 23, 4],
  24: [24, 22, 1],
  26: [26, 12, 1],
};

const SUPPORTED_MAJORS = Object.keys(MIN_NODE_BY_MAJOR).map(Number);
const NEWEST_MAJOR = Math.max(...SUPPORTED_MAJORS);

function parse(version: string): [number, number, number] | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isAtLeast(actual: [number, number, number], min: [number, number, number]): boolean {
  for (let i = 0; i < 3; i += 1) {
    if (actual[i] !== min[i]) {
      return actual[i] > min[i];
    }
  }
  return true;
}

/**
 * Returns a warning when the running Node.js lacks the TLS trust-store fix,
 * or null when it is safe. Never throws: an unparseable version is reported.
 */
export function getNodeVersionWarning(version: string = process.version): string | null {
  const parsed = parse(version);
  if (!parsed) {
    return `octav-api-mcp: could not parse Node.js version "${version}".`;
  }
  const [major] = parsed;
  if (major > NEWEST_MAJOR) {
    return null;
  }
  const min = MIN_NODE_BY_MAJOR[major];
  if (!min) {
    return (
      `octav-api-mcp: Node.js ${version} is end-of-life and does not receive security fixes. ` +
      `It still trusts the compromised eMudhra CA certificates, so api.octav.fi can be impersonated ` +
      `on a hostile network and your API key stolen. Upgrade to Node.js 24.22.1 or newer.`
    );
  }
  if (isAtLeast(parsed, min)) {
    return null;
  }
  const required = min.join('.');
  return (
    `octav-api-mcp: Node.js ${version} predates the October 2026 security release. ` +
    `Upgrade to ${required} or newer on this line (24.22.1 recommended) so TLS to api.octav.fi ` +
    `rejects the compromised eMudhra CA certificates.`
  );
}
