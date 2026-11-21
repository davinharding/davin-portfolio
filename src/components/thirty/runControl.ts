type Ref<T> = { current: T };

export type RunRefs = {
  abort: Ref<AbortController | null>;
  cancelled: Ref<boolean>;
  busy: Ref<boolean>;
};

export function abandonRun(refs: RunRefs): void {
  refs.cancelled.current = true;
  refs.abort.current?.abort();
  refs.busy.current = false;
}
