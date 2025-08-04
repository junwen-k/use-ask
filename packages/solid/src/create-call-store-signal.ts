import type { CallStack, CallStore } from '@ui-call/core';
import { from } from 'solid-js';

export function createCallStoreSignal<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  return from<Array<CallStack<TPayload, TData, TReason>>>((set) => {
    const listener = () => set(store.callStacks);

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
  }, store.callStacks);
}
