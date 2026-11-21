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
  "0.0.0.0/8",
  "10.0.0.0/8",
  "100.64.0.0/10",
  "127.0.0.0/8",
  "169.254.0.0/16",
  "172.16.0.0/12",
  "192.0.0.0/24",
  "192.0.2.0/24",
  "192.88.99.0/24",
  "192.168.0.0/16",
  "198.18.0.0/15",
  "198.51.100.0/24",
  "203.0.113.0/24",
  "224.0.0.0/4",
  "240.0.0.0/4",
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

  if (zeroPrefix(7) && (h[7] === 0 || h[7] === 1)) return true;
  if (zeroPrefix(5) && h[5] === 0xffff) return isDisallowedIPv4(embeddedV4(h[6], h[7]));
  if (zeroPrefix(4) && h[4] === 0xffff && h[5] === 0) return isDisallowedIPv4(embeddedV4(h[6], h[7]));
  if (zeroPrefix(6)) return isDisallowedIPv4(embeddedV4(h[6], h[7]));
  if (h[0] === 0x64 && h[1] === 0xff9b && h.slice(2, 6).every((x) => x === 0)) {
    return isDisallowedIPv4(embeddedV4(h[6], h[7]));
  }
  if (h[0] === 0x64 && h[1] === 0xff9b && h[2] === 1) return true;
  if (h[0] === 0x2002) return isDisallowedIPv4(embeddedV4(h[1], h[2]));
  if (h[0] === 0x2001 && (h[1] === 0 || h[1] === 0xdb8)) return true;
  if (h[0] === 0x2001 && h[1] < 0x200) return true;
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
