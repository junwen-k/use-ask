import { CallStore } from '@ui-call/core';

import { useCallStore } from './use-call-store';

export function createCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof CallStore<TPayload, TData, TReason>>
) {
  const store = new CallStore<TPayload, TData, TReason>(...args);

  return [store, () => useCallStore(store)] as const;
}
