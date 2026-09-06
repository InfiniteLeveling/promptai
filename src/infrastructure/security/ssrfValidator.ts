import { lookup } from 'dns/promises';
import { isIP } from 'net';

// Forbidden IPv4 and IPv6 CIDR ranges
const FORBIDDEN_IPV4_RANGES = [
  { prefix: '127.', desc: 'Loopback' },
  { prefix: '10.', desc: 'Private 10.0.0.0/8' },
  { prefix: '192.168.', desc: 'Private 192.168.0.0/16' },
  { prefix: '169.254.', desc: 'Link-Local & Cloud Metadata' },
  { prefix: '0.0.0.0', desc: 'Zero address' },
  { prefix: '255.255.255.255', desc: 'Broadcast' }
];

function isPrivate172(ip: string): boolean {
  if (!ip.startsWith('172.')) return false;
  const parts = ip.split('.');
  if (parts.length < 2) return false;
  const second = parseInt(parts[1], 10);
  return second >= 16 && second <= 31;
}

function isForbiddenIp(ip: string): { forbidden: boolean; reason?: string } {
  // Check IPv6 loopback and private
  if (ip === '::1' || ip === '::' || ip.startsWith('fe80:') || ip.startsWith('fc00:') || ip.startsWith('fd00:')) {
    return { forbidden: true, reason: 'IPv6 local or private address prohibited' };
  }

  // Check IPv4 mapped IPv6 (::ffff:127.0.0.1)
  if (ip.toLowerCase().startsWith('::ffff:')) {
    const v4 = ip.substring(7);
    return isForbiddenIp(v4);
  }

  for (const range of FORBIDDEN_IPV4_RANGES) {
    if (ip.startsWith(range.prefix)) {
      return { forbidden: true, reason: `Forbidden IP range: ${range.desc}` };
    }
  }

  if (isPrivate172(ip)) {
    return { forbidden: true, reason: 'Private 172.16.0.0/12 address prohibited' };
  }

  return { forbidden: false };
}

export class SSRFValidator {
  static async validateUrl(rawUrl: string): Promise<{ valid: boolean; reason?: string; resolvedIp?: string }> {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return { valid: false, reason: 'Invalid URL format' };
    }

    // Protocol check: strictly http or https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: `Forbidden protocol: ${parsed.protocol}. Only http and https are allowed.` };
    }

    const hostname = parsed.hostname;

    // Check if hostname is directly an IP literal
    if (isIP(hostname)) {
      const check = isForbiddenIp(hostname);
      if (check.forbidden) {
        return { valid: false, reason: check.reason, resolvedIp: hostname };
      }
      return { valid: true, resolvedIp: hostname };
    }

    // Check for common localhost aliases
    const lowerHost = hostname.toLowerCase();
    if (
      lowerHost === 'localhost' ||
      lowerHost.endsWith('.localhost') ||
      lowerHost.endsWith('.local') ||
      lowerHost.endsWith('.internal')
    ) {
      return { valid: false, reason: 'Localhost and internal domains prohibited' };
    }

    // DNS Resolution check
    try {
      const res = await lookup(hostname, { all: true });
      if (!res || res.length === 0) {
        return { valid: false, reason: `DNS resolution returned zero records for ${hostname}` };
      }

      for (const record of res) {
        const check = isForbiddenIp(record.address);
        if (check.forbidden) {
          return {
            valid: false,
            reason: `Hostname ${hostname} resolves to prohibited address ${record.address} (${check.reason})`,
            resolvedIp: record.address
          };
        }
      }

      return { valid: true, resolvedIp: res[0].address };
    } catch (err: any) {
      return { valid: false, reason: `DNS resolution failed: ${err?.message || 'Host not found'}` };
    }
  }
}
