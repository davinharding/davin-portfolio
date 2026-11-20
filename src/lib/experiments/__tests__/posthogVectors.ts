// Answers from PostHog's own flags endpoint, captured by the agreement test in
// docs/specs/home-design-experiment.md (section 11.3). They pin assignVariant()
// to what PostHog computes. Written by scripts/home-design-agreement.mts.
export const POSTHOG_VECTORS: { flagKey: string; pairs: ReadonlyArray<readonly [id: string, variant: string]> } = {
  flagKey: "home-design-selftest",
  pairs: [
    ["a32dc6ef-6b3c-46b9-b9cc-5c3340d5d84d", "open-roles"],
    ["eba51bea-08de-42a3-b555-0d0d658e2b0a", "open-roles"],
    ["99c619c9-12a5-4821-aecf-70a187723fee", "drafting-table"],
    ["828e46f6-e10a-4572-8943-8a01e1c04f1f", "drafting-table"],
    ["05192ea9-c2f9-480b-83b3-fa2e91da7c29", "drafting-table"],
    ["15789cdc-1b9a-4c82-9469-43de87eca4f1", "open-roles"],
    ["1eb4601d-59b9-4f78-aeba-d38a552dda44", "drafting-table"],
    ["201adb21-c41f-4970-b75a-975310840137", "drafting-table"],
    ["db0a2999-06d5-4646-a718-bd349e656bb6", "open-roles"],
    ["e68fdcb1-2491-4918-9e36-c7adaa3bd325", "drafting-table"],
  ],
};
