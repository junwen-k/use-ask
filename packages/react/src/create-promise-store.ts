import { PromiseStore } from '@use-ask/core';
import { useCallback, useSyncExternalStore } from 'react';

export const createPromiseStore = <P, TData = unknown, TReason = unknown>() => {
  const store = new PromiseStore<P, TData, TReason>();

  return [
    store,
    () =>
      useSyncExternalStore(
        useCallback((listener) => {
          store.addEventListener('change', listener);

          return () => {
            store.removeEventListener('change', listener);
          };
        }, []),
        () => store.entries,
        () => store.entries
      ),
  ] as const;
};
