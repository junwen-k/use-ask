import { SingletonCallStore } from '@ui-call/core';

import { useSingletonCallStore } from './use-singleton-call-store';

export function createSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof SingletonCallStore<TPayload, TData, TReason>>
) {
  const store = new SingletonCallStore<TPayload, TData, TReason>(...args);

  return [store, () => useSingletonCallStore(store)] as const;
}
