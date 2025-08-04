import { SingletonCallStore } from '@ui-call/core';

import { useSingletonCallStoreSignal } from './use-singleton-call-store-signal';

export function createSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof SingletonCallStore<TPayload, TData, TReason>>
) {
  const store = new SingletonCallStore<TPayload, TData, TReason>(...args);

  return [store, () => useSingletonCallStoreSignal<TPayload, TData, TReason>(store)] as const;
}
