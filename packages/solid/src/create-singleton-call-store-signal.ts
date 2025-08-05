import type { Call, SingletonCallStore } from '@ui-call/core';
import { from } from 'solid-js';

export function createSingletonCallStoreSignal<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown,
>(store: SingletonCallStore<TPayload, TData, TReason>) {
  return from<Call<TPayload, TData, TReason> | null>((set) => {
    const listener = () => set(store.current);

    store.addEventListener('add', listener);
    store.addEventListener('update', listener);
    store.addEventListener('resolve', listener);
    store.addEventListener('reject', listener);
    store.addEventListener('settled', listener);

    return () => {
      store.removeEventListener('add', listener);
      store.removeEventListener('update', listener);
      store.removeEventListener('resolve', listener);
      store.removeEventListener('reject', listener);
      store.removeEventListener('settled', listener);
    };
  }, store.current);
}
