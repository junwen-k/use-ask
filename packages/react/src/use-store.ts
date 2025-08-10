'use client';

import type { CallStore, SingletonCallStore } from '@ui-call/core';
import { useCallback, useSyncExternalStore } from 'react';

const EVENTS = ['add', 'update', 'settled', 'resolve', 'reject'] as const;

export function useCallStore<TPayload, TData, TReason>(store: CallStore<TPayload, TData, TReason>) {
  let version = 0;

  const snapshot = {
    stack: [...store.stack],
    version,
  };

  const subscribe = (onStoreChange: () => void) => {
    const listener = () => {
      version++;
      onStoreChange();
    };

    EVENTS.forEach((e) => {
      store.addEventListener(e, listener);
    });

    return () => {
      EVENTS.forEach((e) => {
        store.removeEventListener(e, listener);
      });
    };
  };

  const getStoreSnapshot = useCallback(() => {
    // Only update the snapshot if the version has changed.
    if (snapshot.version !== version) {
      snapshot.stack = [...store.stack];
      snapshot.version = version;
    }

    return snapshot.stack;
  }, [snapshot, version, store]);

  return useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
}

export function useSingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: SingletonCallStore<TPayload, TData, TReason>
) {
  const getStoreSnapshot = useCallback(() => store.current, [store]);

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
    getStoreSnapshot,
    getStoreSnapshot
  );
}
