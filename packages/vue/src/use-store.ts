import type { CallStore, SingletonCallStore } from '@ui-call/core';
import { onBeforeUnmount, readonly, shallowRef } from 'vue';

const EVENTS = ['add', 'update', 'settled', 'resolve', 'reject'] as const;

export function useCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  const stack = shallowRef(store.stack);

  const listener = () => {
    stack.value = [...store.stack];
  };

  EVENTS.forEach((event) => {
    store.addEventListener(event, listener);
  });

  onBeforeUnmount(() => {
    EVENTS.forEach((event) => {
      store.removeEventListener(event, listener);
    });
  });

  return readonly(stack);
}

export function useSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: SingletonCallStore<TPayload, TData, TReason>
) {
  const current = shallowRef(store.current);

  const listener = () => {
    current.value = store.current;
  };

  EVENTS.forEach((event) => {
    store.addEventListener(event, listener);
  });

  onBeforeUnmount(() => {
    EVENTS.forEach((event) => {
      store.removeEventListener(event, listener);
    });
  });

  return readonly(current);
}
