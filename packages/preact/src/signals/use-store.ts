import { useSignal, useSignalEffect } from '@preact/signals';
import type { CallStore, SingletonCallStore } from '@ui-call/core';

const EVENTS = ['add', 'update', 'settled', 'resolve', 'reject'] as const;

export function useCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  const stack = useSignal(store.stack);

  useSignalEffect(() => {
    const listener = () => {
      stack.value = [...store.stack];
    };

    EVENTS.forEach((event) => {
      store.addEventListener(event, listener);
    });

    return () => {
      EVENTS.forEach((event) => {
        store.removeEventListener(event, listener);
      });
    };
  });

  return stack;
}

export function useSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: SingletonCallStore<TPayload, TData, TReason>
) {
  const current = useSignal(store.current);

  useSignalEffect(() => {
    const listener = () => {
      current.value = store.current;
    };

    EVENTS.forEach((event) => {
      store.addEventListener(event, listener);
    });

    return () => {
      EVENTS.forEach((event) => {
        store.removeEventListener(event, listener);
      });
    };
  });

  return current;
}
