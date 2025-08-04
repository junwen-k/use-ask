import type { SingletonCallStore } from '@ui-call/core';
import { onBeforeUnmount, readonly, shallowRef } from 'vue';

export function useSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: SingletonCallStore<TPayload, TData, TReason>
) {
  const current = shallowRef(store.current);

  const listener = () => {
    current.value = store.current;
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

  return readonly(current);
}
