import type { CallStore } from '@ui-call/core';
import { useEffect, useState } from 'preact/hooks';

export function useCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  const [callStacks, setCallStacks] = useState(store.callStacks);

  useEffect(() => {
    const listener = () => {
      setCallStacks(store.callStacks);
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

  return callStacks;
}
