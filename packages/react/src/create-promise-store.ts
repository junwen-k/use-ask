'use client';

import { PromiseStore } from '@use-ask/core';
import { useSyncExternalStore } from 'react';

export type CreatePromiseStoreReturn<P, TData = unknown, TReason = unknown> = [
  PromiseStore<P, TData, TReason>,
  ReturnType<
    typeof useSyncExternalStore<PromiseStore<P, TData, TReason>['getSnapshot']>
  >,
];

export const createPromiseStore = <P, TData = unknown, TReason = unknown>(
  initialPayload?: P
): CreatePromiseStoreReturn<P, TData, TReason> => {
  const store = new PromiseStore<P, TData, TReason>(initialPayload);

  return [
    store,
    () =>
      useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        store.getSnapshot
      ),
  ];
};
