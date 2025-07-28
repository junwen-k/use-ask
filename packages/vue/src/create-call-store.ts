import { CallStore } from '@ui-call/core';
import { markRaw } from 'vue';

import { useCallStore } from './use-call-store';

export function createCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof CallStore<TPayload, TData, TReason>>
) {
  const store = new CallStore<TPayload, TData, TReason>(...args);

  return [
    // `markRaw` prevents Vue from proxying the store, which would interfere
    // with private field access in the CallStore class.
    markRaw(store),
    () => useCallStore(store),
  ] as const;
}
