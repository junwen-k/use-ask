import { CallStore, SingletonCallStore } from '@ui-call/core';
import { markRaw } from 'vue';

export function createCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof CallStore<TPayload, TData, TReason>>
) {
  const store = new CallStore<TPayload, TData, TReason>(...args);
  // `markRaw` prevents Vue from proxying the store, which would interfere
  // with private field access in the CallStore class.
  return markRaw(store);
}

export function createSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  ...args: ConstructorParameters<typeof SingletonCallStore<TPayload, TData, TReason>>
) {
  const store = new SingletonCallStore<TPayload, TData, TReason>(...args);
  // `markRaw` prevents Vue from proxying the store, which would interfere
  // with private field access in the SingletonCallStore class.
  return markRaw(store);
}
