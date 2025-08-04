import { SingletonCallStore } from '@ui-call/core';

import { createSingletonCallStoreSignal } from './create-singleton-call-store-signal';

export function createSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof SingletonCallStore<TPayload, TData, TReason>>
) {
  const store = new SingletonCallStore<TPayload, TData, TReason>(...args);

  return [store, () => createSingletonCallStoreSignal<TPayload, TData, TReason>(store)] as const;
}
