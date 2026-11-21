# 0006. Spend is reserved up front, settled after, and always errs high

- **Status:** Accepted
- **Date:** 2026-11-21 (recorded from code comments)
- **Spec:** `docs/specs/thirty-seconds.md`, section 10

## Context

Every run spends real money on model calls. The site is public and anonymous, so the monthly bill has to have a hard ceiling and no single visitor can be allowed to run it up.

## Decision

**Monthly ceiling**
- Each run reserves `RESERVE_MICROS` ($0.15) at start and settles to the actual spend at the end, which may be more or less. A reservation is never left open.
- A model call cut off by a stage limit or the deadline may still be billed, and its usage never comes back. The run then keeps at least the whole reservation.
- Estimates err high. Cache reads and writes are counted at the plain input rate, and unknown models are priced at the most expensive known rate.

**Who pays for a failure**
- Failures that are not the visitor's doing give the visitor their run back. DNS-level unreachable never counts against anyone.
- A search fallback that keeps timing out is cached as "not enough to go on" for the day, so the same slow search is not paid for again.

**Visitor identity**
- Visitors are identified by a salted hash of their IP. The raw IP is never stored or logged.
- Cache hits do not count against the visitor's daily limit.

## Consequences

- The monthly cap can stop runs a little early, never late.
- Changing prices or models means updating `PRICES`; forgetting to only overestimates.

## Where

- `src/lib/thirty/budget.ts`, `config.ts` (`PRICES`, `RESERVE_MICROS`), `anthropic.ts` (`toUsageRecord`)
- `src/lib/thirty/limits.ts`
- `src/lib/thirty/pipeline.ts` (refund rules, `spendUnknown`)
- `src/lib/thirty/__tests__/pipeline.test.ts`, `handler.test.ts`, `limits.test.ts`
