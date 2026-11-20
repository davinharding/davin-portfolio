import { describe, expect, it } from "vitest";
import { createGuardedLookup, isDisallowedAddress } from "../ssrf";

describe("isDisallowedAddress", () => {
  it.each([
    "0.0.0.0",
    "0.1.2.3",
    "10.0.0.1",
    "10.255.255.255",
    "100.64.0.1",
    "100.127.255.254",
    "127.0.0.1",
    "127.10.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "172.31.255.255",
    "192.0.0.8",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "198.51.100.7",
    "203.0.113.9",
    "224.0.0.1",
    "239.255.255.250",
    "240.0.0.1",
    "255.255.255.255",
  ])("blocks IPv4 %s", (ip) => {
    expect(isDisallowedAddress(ip)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "93.184.216.34", "172.15.255.255", "172.32.0.1", "100.63.255.255", "100.128.0.1", "192.169.0.1"])(
    "allows public IPv4 %s",
    (ip) => {
      expect(isDisallowedAddress(ip)).toBe(false);
    }
  );

  it.each([
    "::",
    "::1",
    "fe80::1",
    "fe80::1%eth0",
    "fc00::1",
    "fd12:3456:789a::1",
    "ff02::1",
    "fec0::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "::ffff:10.0.0.1",
    "::ffff:169.254.169.254",
    "::ffff:0:192.168.0.1",
    "::127.0.0.1",
    "64:ff9b::10.0.0.1",
    "64:ff9b::a9fe:a9fe",
    "64:ff9b:1::1",
    "2002:7f00:0001::1",
    "2002:c0a8:0101::",
    "2001:0:4136:e378:8000:63bf:3fff:fdd2",
    "2001:db8::1",
    "100::1",
    "not-an-ip",
    "",
  ])("blocks IPv6 or invalid %s", (ip) => {
    expect(isDisallowedAddress(ip)).toBe(true);
  });

  it.each(["2606:4700:4700::1111", "2001:4860:4860::8888", "::ffff:8.8.8.8", "64:ff9b::808:808", "2002:0808:0808::1"])(
    "allows public IPv6 %s",
    (ip) => {
      expect(isDisallowedAddress(ip)).toBe(false);
    }
  );
});

type Addr = { address: string; family: number };

function fakeResolver(table: Record<string, Addr[] | NodeJS.ErrnoException>) {
  return (
    hostname: string,
    _opts: unknown,
    cb: (err: NodeJS.ErrnoException | null, addresses: Addr[]) => void
  ) => {
    const entry = table[hostname];
    if (!entry) {
      const e: NodeJS.ErrnoException = new Error("nope");
      e.code = "ENOTFOUND";
      return cb(e, []);
    }
    if (entry instanceof Error) return cb(entry, []);
    cb(null, entry);
  };
}

function lookupAsync(lookup: ReturnType<typeof createGuardedLookup>, host: string, all = false) {
  return new Promise<{ err: NodeJS.ErrnoException | null; address: unknown; family?: number }>((resolve) => {
    lookup(host, { all }, (err, address, family) => resolve({ err, address, family }));
  });
}

describe("createGuardedLookup", () => {
  const lookup = createGuardedLookup(
    fakeResolver({
      "public.example": [{ address: "93.184.216.34", family: 4 }],
      "private.example": [{ address: "10.0.0.5", family: 4 }],
      "mixed.example": [
        { address: "93.184.216.34", family: 4 },
        { address: "127.0.0.1", family: 4 },
      ],
      "v6.example": [{ address: "::ffff:169.254.169.254", family: 6 }],
    })
  );

  it("returns a checked public address", async () => {
    const r = await lookupAsync(lookup, "public.example");
    expect(r.err).toBeNull();
    expect(r.address).toBe("93.184.216.34");
    expect(r.family).toBe(4);
  });

  it("returns all addresses when asked", async () => {
    const r = await lookupAsync(lookup, "public.example", true);
    expect(r.address).toEqual([{ address: "93.184.216.34", family: 4 }]);
  });

  it("rejects a name that resolves to a private address", async () => {
    const r = await lookupAsync(lookup, "private.example");
    expect(r.err?.code).toBe("ESSRF");
  });

  it("rejects when any one of several addresses is private (rebinding defence)", async () => {
    const r = await lookupAsync(lookup, "mixed.example", true);
    expect(r.err?.code).toBe("ESSRF");
  });

  it("rejects mapped IPv6 metadata addresses", async () => {
    const r = await lookupAsync(lookup, "v6.example");
    expect(r.err?.code).toBe("ESSRF");
  });

  it("passes DNS failures through", async () => {
    const r = await lookupAsync(lookup, "missing.example");
    expect(r.err?.code).toBe("ENOTFOUND");
  });
});
