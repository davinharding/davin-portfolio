// Stopping a run in flight, shared by Cancel and the back-forward cache restore.
type Ref<T> = { current: T };

export type RunRefs = {
  abort: Ref<AbortController | null>;
  /** Read after every await in the run: once true, nothing the run does reaches the screen. */
  cancelled: Ref<boolean>;
  busy: Ref<boolean>;
};

/**
 * Aborts the request and marks the run as abandoned. The abort makes the stream
 * reader throw; without the mark, that would surface as "Lost the connection".
 */
export function abandonRun(refs: RunRefs): void {
  refs.cancelled.current = true;
  refs.abort.current?.abort();
  refs.busy.current = false;
}
