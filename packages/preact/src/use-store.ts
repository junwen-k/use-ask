import type { CallStore, SingletonCallStore } from '@ui-call/core';
import { useEffect, useState } from 'preact/hooks';

const EVENTS = ['add', 'update', 'settled', 'resolve', 'reject'] as const;

export function useCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  const [stack, setStack] = useState(store.stack);

  useEffect(() => {
    const listener = () => {
      setStack([...store.stack]);
    };

    EVENTS.forEach((event) => {
      store.addEventListener(event, listener);
    });

    return () => {
      EVENTS.forEach((event) => {
        store.removeEventListener(event, listener);
      });
    };
  }, [store]);

  return stack;
}

export function useSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: SingletonCallStore<TPayload, TData, TReason>
) {
  const [current, setCurrent] = useState(store.current);

  useEffect(() => {
    const listener = () => {
      setCurrent(store.current);
    };

    EVENTS.forEach((event) => {
      store.addEventListener(event, listener);
    });

    return () => {
      EVENTS.forEach((event) => {
        store.removeEventListener(event, listener);
      });
    };
  }, [store]);

  return current;
}
