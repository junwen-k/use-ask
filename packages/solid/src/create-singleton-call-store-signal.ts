import type { Call, SingletonCallStore } from '@ui-call/core';
import { createSignal } from 'solid-js';

export function createSingletonCallStoreSignal<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown,
>(store: SingletonCallStore<TPayload, TData, TReason>) {
  const [signal, setSignal] = createSignal<Call<TPayload, TData, TReason> | undefined>(
    store.current
  );

  const listener = () => setSignal(store.current);

  store.addEventListener('add', listener);
  store.addEventListener('update', listener);
  store.addEventListener('resolve', listener);
  store.addEventListener('reject', listener);
  store.addEventListener('settled', listener);

  return signal;
}
