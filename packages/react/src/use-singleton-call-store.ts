import type { SingletonCallStore } from '@ui-call/core';
import { useSyncExternalStore } from 'react';

const EVENTS = ['add', 'update', 'settled', 'resolve', 'reject'] as const;

export function useSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: SingletonCallStore<TPayload, TData, TReason>
) {
  return useSyncExternalStore(
    (listener) => {
      EVENTS.forEach((event) => {
        store.addEventListener(event, listener);
      });
      return () => {
        EVENTS.forEach((event) => {
          store.removeEventListener(event, listener);
        });
      };
    },
    () => store.current,
    () => store.current
  );
}
