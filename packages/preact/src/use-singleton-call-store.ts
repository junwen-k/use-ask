import type { SingletonCallStore } from '@ui-call/core';
import { useEffect, useState } from 'preact/hooks';

export function useSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: SingletonCallStore<TPayload, TData, TReason>
) {
  const [current, setCurrent] = useState(store.current);

  useEffect(() => {
    const listener = () => {
      setCurrent(store.current);
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
  }, [store]);

  return current;
}
