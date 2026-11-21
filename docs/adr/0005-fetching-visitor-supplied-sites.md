# 0005. Visitor-supplied sites are fetched behind a connect-time address policy

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)
- **Spec:** `docs/specs/thirty-seconds.md`, sections 6 and 7.1

## Context

A visitor types any address and the server fetches it. That is a server-side request forgery surface: private networks, cloud metadata, and DNS rebinding.

## Decision

**Check at connect time, not before**
- The address policy runs inside the DNS `lookup` used by `net.connect`/`tls.connect`. It resolves every address and refuses the connection if any is non-public, and the socket then connects to one of exactly those checked addresses. DNS rebinding cannot swap in a private address after a pre-check.
- `net.connect` never calls `lookup` for an IP literal, so the policy would never run for one. Callers only pass hostnames, and `guardedFetch` refuses literals anyway.
- Redirects are followed manually, at most `LIMITS.maxRedirects` hops, and every hop goes through the same host rules. A redirect to a platform or login host means the site is not readable by a bot.
- Reads are capped in size and time. When the host resolves but https fails at connect, plain http is tried once.

**Blocked IPv4 ranges**

`0.0.0.0/8` (this network), `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (private), `100.64.0.0/10` (CGNAT), `127.0.0.0/8` (loopback), `169.254.0.0/16` (link-local, cloud metadata), `192.0.0.0/24` (IETF assignments), `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` (TEST-NET 1 to 3), `192.88.99.0/24` (6to4 relay anycast), `198.18.0.0/15` (benchmarking), `224.0.0.0/4` (multicast), `240.0.0.0/4` (reserved, includes broadcast).

**Blocked IPv6**
- `::` and `::1`.
- IPv4-mapped `::ffff:a.b.c.d`, IPv4-translated `::ffff:0:a.b.c.d`, and deprecated IPv4-compatible `::a.b.c.d`: the embedded IPv4 address is checked.
- NAT64 `64:ff9b::/96`: the embedded IPv4 address is checked. Local-use NAT64 `64:ff9b:1::/48` can map to anything internal, so it is blocked.
- 6to4 `2002::/16` embeds an IPv4 address in bits 16 to 47; that address is checked.
- Teredo `2001:0::/32` hides its IPv4 address, and `2001:db8::/32` is documentation: both blocked. ORCHID and other IETF assignments in `2001::/23` are not public hosts.
- Everything outside `2000::/3` (unique-local, link-local, site-local, multicast), since only `2000::/3` holds global unicast.

**Host rules on the typed address**
- The URL parser canonicalizes numeric forms (`0x7f.1`, `2130706433`) to dotted quads, so they are caught as IP literals. After the parser a real hostname is ASCII letters, digits, dots and hyphens; IDNs arrive as punycode.
- Platform hosts, where the visitor does not own the page, are refused. Google and Amazon count in any country and any subdomain (`google.co.uk`, `maps.google.com.au`), but only when the suffix looks like a country domain, so `amazon.acme.com` stays a company site.
- Input with a dot before the first colon is a host with a port (`acme.com:8080`); without one it is a scheme (`javascript:`, `mailto:`, `data:`) and refused.
- The same host rules run on the input and on every redirect hop.

## Consequences

- The policy lives in one place (`ssrf.ts`), and both the fetch path and its tests go through it.
- Any new outbound fetch of visitor input must use `guardedFetch`, never plain `fetch`.

## Where

- `src/lib/thirty/ssrf.ts` (`createGuardedLookup`, IPv4/IPv6 checks)
- `src/lib/thirty/fetchSite.ts` (`guardedFetch`, `fetchPage`, `readSite`)
- `src/lib/thirty/url.ts` (`normalizeInput`, `checkHost`, `PLATFORM_HOSTS`)
- `src/lib/thirty/__tests__/ssrf.test.ts`, `fetchSite.test.ts`, `url.test.ts`
