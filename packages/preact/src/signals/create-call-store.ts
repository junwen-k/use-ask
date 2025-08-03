import { CallStore } from '@ui-call/core';

import { useCallStoreSignal } from './use-call-store-signal';

export function createCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof CallStore<TPayload, TData, TReason>>
) {
  const store = new CallStore<TPayload, TData, TReason>(...args);

  return [store, () => useCallStoreSignal<TPayload, TData, TReason>(store)] as const;
}
