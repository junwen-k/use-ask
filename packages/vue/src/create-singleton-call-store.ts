import { SingletonCallStore } from '@ui-call/core';
import { markRaw } from 'vue';

import { useSingletonCallStore } from './use-singleton-call-store';

export function createSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof SingletonCallStore<TPayload, TData, TReason>>
) {
  const store = new SingletonCallStore<TPayload, TData, TReason>(...args);

  return [
    // `markRaw` prevents Vue from proxying the store, which would interfere
    // with private field access in the SingletonCallStore class.
    markRaw(store),
    () => useSingletonCallStore(store),
  ] as const;
}
