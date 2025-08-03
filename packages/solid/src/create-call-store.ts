import { CallStore } from '@ui-call/core';

import { createCallStoreSignal } from './create-call-store-signal';

export function createCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof CallStore<TPayload, TData, TReason>>
) {
  const store = new CallStore<TPayload, TData, TReason>(...args);

  return [store, () => createCallStoreSignal<TPayload, TData, TReason>(store)] as const;
}
