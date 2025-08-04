import type { Call, CallStore } from '@ui-call/core';
import { createSignal } from 'solid-js';

export function createCallStoreSignal<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  const [signal, setSignal] = createSignal<Array<Call<TPayload, TData, TReason>>>(store.stack);

  const listener = () => setSignal([...store.stack]);

  store.addEventListener('add', listener);
  store.addEventListener('update', listener);
  store.addEventListener('resolve', listener);
  store.addEventListener('reject', listener);
  store.addEventListener('settled', listener);

  return signal;
}
