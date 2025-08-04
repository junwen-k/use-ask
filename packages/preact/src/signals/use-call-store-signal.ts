import { useSignal, useSignalEffect } from '@preact/signals';
import type { CallStore } from '@ui-call/core';

export function useCallStoreSignal<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  const signal = useSignal(store.callStacks);

  useSignalEffect(() => {
    const listener = () => {
      signal.value = [...store.callStacks];
    };

    store.addEventListener('add', listener);
    store.addEventListener('update', listener);
    store.addEventListener('settled', listener);
    store.addEventListener('resolve', listener);
    store.addEventListener('reject', listener);

    return () => {
      store.removeEventListener('add', listener);
      store.removeEventListener('update', listener);
      store.removeEventListener('settled', listener);
      store.removeEventListener('resolve', listener);
      store.removeEventListener('reject', listener);
    };
  });

  return signal;
}
