import type { CallStore } from '@ui-call/core';
import { onBeforeUnmount, readonly, shallowRef } from 'vue';

export function useCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  const stack = shallowRef(store.stack);

  const listener = () => {
    stack.value = [...store.stack];
  };

  store.addEventListener('add', listener);
  store.addEventListener('update', listener);
  store.addEventListener('settled', listener);
  store.addEventListener('resolve', listener);
  store.addEventListener('reject', listener);

  onBeforeUnmount(() => {
    store.removeEventListener('add', listener);
    store.removeEventListener('update', listener);
    store.removeEventListener('settled', listener);
    store.removeEventListener('resolve', listener);
    store.removeEventListener('reject', listener);
  });

  return readonly(stack);
}
