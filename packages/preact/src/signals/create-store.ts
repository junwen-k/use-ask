import { CallStore, SingletonCallStore } from '@ui-call/core';

export function createCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof CallStore<TPayload, TData, TReason>>
) {
  return new CallStore<TPayload, TData, TReason>(...args);
}

export function createSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof SingletonCallStore<TPayload, TData, TReason>>
) {
  return new SingletonCallStore<TPayload, TData, TReason>(...args);
}
