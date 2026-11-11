// Server-only. Address policy plus a DNS lookup that enforces it at connect
// time, so DNS rebinding cannot swap in a private address after a pre-check.
import dns from "node:dns";
import net from "node:net";

type V4Range = [base: number, prefix: number];

function v4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => ((acc << 8) | Number(part)) >>> 0, 0);
}

function v4Range(cidr: string): V4Range {
  const [base, prefix] = cidr.split("/");
  return [v4ToInt(base), Number(prefix)];
}

const BLOCKED_V4: V4Range[] = [
  "0.0.0.0/8", // "this network"
  "10.0.0.0/8", // private
  "100.64.0.0/10", // CGNAT
  "127.0.0.0/8", // loopback
  "169.254.0.0/16", // link-local, cloud metadata
  "172.16.0.0/12", // private
  "192.0.0.0/24", // IETF protocol assignments
  "192.0.2.0/24", // TEST-NET-1
  "192.88.99.0/24", // 6to4 relay anycast
  "192.168.0.0/16", // private
  "198.18.0.0/15", // benchmarking
  "198.51.100.0/24", // TEST-NET-2
  "203.0.113.0/24", // TEST-NET-3
  "224.0.0.0/4", // multicast
  "240.0.0.0/4", // reserved, includes 255.255.255.255 broadcast
].map(v4Range);

function inV4Range(ip: number, [base, prefix]: V4Range): boolean {
  if (prefix === 0) return true;
  const mask = (~0 << (32 - prefix)) >>> 0;
  return (ip & mask) === (base & mask);
}

export function isDisallowedIPv4(ip: string): boolean {
  if (net.isIPv4(ip) === false) return true;
  const n = v4ToInt(ip);
  return BLOCKED_V4.some((r) => inV4Range(n, r));
}

/** Expands an IPv6 address (with optional embedded IPv4 tail) to 8 hextets. */
function expandV6(ip: string): number[] | null {
  let addr = ip.toLowerCase();
  const zone = addr.indexOf("%");
  if (zone !== -1) addr = addr.slice(0, zone);
  const lastColon = addr.lastIndexOf(":");
  const maybeV4 = addr.slice(lastColon + 1);
  if (maybeV4.includes(".")) {
    if (!net.isIPv4(maybeV4)) return null;
    const n = v4ToInt(maybeV4);
    addr = `${addr.slice(0, lastColon + 1)}${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const parts = addr.split("::");
  if (parts.length > 2) return null;
  const head = parts[0] ? parts[0].split(":") : [];
  const rest = parts.length === 2 && parts[1] ? parts[1].split(":") : [];
  const missing = 8 - head.length - rest.length;
  if (parts.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array(parts.length === 2 ? missing : 0).fill("0"), ...rest];
  if (groups.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return null;
  return groups.map((g) => parseInt(g, 16));
}

function embeddedV4(hi: number, lo: number): string {
  return [hi >>> 8, hi & 0xff, lo >>> 8, lo & 0xff].join(".");
}

export function isDisallowedIPv6(ip: string): boolean {
  const h = expandV6(ip);
  if (!h) return true;
  const zeroPrefix = (n: number) => h.slice(0, n).every((x) => x === 0);

  // :: and ::1
  if (zeroPrefix(7) && (h[7] === 0 || h[7] === 1)) return true;
  // IPv4-mapped ::ffff:a.b.c.d and IPv4-translated ::ffff:0:a.b.c.d
  if (zeroPrefix(5) && h[5] === 0xffff) return isDisallowedIPv4(embeddedV4(h[6], h[7]));
  if (zeroPrefix(4) && h[4] === 0xffff && h[5] === 0) return isDisallowedIPv4(embeddedV4(h[6], h[7]));
  // Deprecated IPv4-compatible ::a.b.c.d
  if (zeroPrefix(6)) return isDisallowedIPv4(embeddedV4(h[6], h[7]));
  // NAT64 well-known prefix 64:ff9b::/96
  if (h[0] === 0x64 && h[1] === 0xff9b && h.slice(2, 6).every((x) => x === 0)) {
    return isDisallowedIPv4(embeddedV4(h[6], h[7]));
  }
  // Local-use NAT64 64:ff9b:1::/48 can map to anything internal.
  if (h[0] === 0x64 && h[1] === 0xff9b && h[2] === 1) return true;
  // 6to4 2002::/16 embeds an IPv4 address in bits 16..47.
  if (h[0] === 0x2002) return isDisallowedIPv4(embeddedV4(h[1], h[2]));
  // Teredo 2001:0::/32 obscures its IPv4 address; documentation 2001:db8::/32.
  if (h[0] === 0x2001 && (h[1] === 0 || h[1] === 0xdb8)) return true;
  // ORCHID and other IETF assignments in 2001::/23 are not public hosts.
  if (h[0] === 0x2001 && h[1] < 0x200) return true;
  // fc00::/7 unique-local, fe80::/10 link-local, fec0::/10 site-local, ff00::/8 multicast:
  // all outside 2000::/3, the only range that holds global unicast.
  if ((h[0] & 0xe000) !== 0x2000) return true;
  return false;
}

export function isDisallowedAddress(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isDisallowedIPv4(ip);
  if (family === 6) return isDisallowedIPv6(ip);
  return true;
}

export class BlockedAddressError extends Error {
  readonly code = "ESSRF";
  constructor(hostname: string) {
    super(`Refusing to connect: ${hostname} resolves to a non-public address`);
    this.name = "BlockedAddressError";
  }
}

type LookupAddress = { address: string; family: number };
type LookupAll = (
  hostname: string,
  options: { all: true; family?: number; hints?: number },
  callback: (err: NodeJS.ErrnoException | null, addresses: LookupAddress[]) => void
) => void;

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | LookupAddress[],
  family?: number
) => void;

/**
 * Builds a `lookup` for `net.connect`/`tls.connect` that resolves every
 * address and refuses the connection if any of them is non-public. The socket
 * then connects to one of exactly these checked addresses.
 */
export function createGuardedLookup(resolve: LookupAll = dns.lookup as unknown as LookupAll) {
  return function guardedLookup(
    hostname: string,
    options: { all?: boolean; family?: number | string; hints?: number } | LookupCallback,
    maybeCallback?: LookupCallback
  ): void {
    const callback = (typeof options === "function" ? options : maybeCallback) as LookupCallback;
    const opts = typeof options === "function" ? {} : options;
    const family =
      opts.family === "IPv4" ? 4 : opts.family === "IPv6" ? 6 : Number(opts.family) || undefined;
    resolve(hostname, { all: true, family, hints: opts.hints }, (err, addresses) => {
      if (err) return callback(err, opts.all ? [] : "", undefined);
      if (!addresses.length) {
        const e: NodeJS.ErrnoException = new Error(`No addresses for ${hostname}`);
        e.code = "ENOTFOUND";
        return callback(e, opts.all ? [] : "", undefined);
      }
      if (addresses.some((a) => isDisallowedAddress(a.address))) {
        return callback(new BlockedAddressError(hostname), opts.all ? [] : "", undefined);
      }
      if (opts.all) return callback(null, addresses);
      return callback(null, addresses[0].address, addresses[0].family);
    });
  };
}

export const guardedLookup = createGuardedLookup();
