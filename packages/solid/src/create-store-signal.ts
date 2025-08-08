import type { Call, CallStore, SingletonCallStore } from '@ui-call/core';
import { from } from 'solid-js';

const EVENTS = ['add', 'update', 'settled', 'resolve', 'reject'] as const;

export function createCallStoreSignal<TPayload = unknown, TData = unknown, TReason = unknown>(
  store: CallStore<TPayload, TData, TReason>
) {
  return from<Array<Call<TPayload, TData, TReason>>>((set) => {
    const listener = () => set([...store.stack]);

    EVENTS.forEach((event) => {
      store.addEventListener(event, listener);
    });

    return () => {
      EVENTS.forEach((event) => {
        store.removeEventListener(event, listener);
      });
    };
  }, store.stack);
}

export function createSingletonCallStoreSignal<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown,
>(store: SingletonCallStore<TPayload, TData, TReason>) {
  return from<Call<TPayload, TData, TReason> | null>((set) => {
    const listener = () => set(store.current);

    EVENTS.forEach((event) => {
      store.addEventListener(event, listener);
    });

    return () => {
      EVENTS.forEach((event) => {
        store.removeEventListener(event, listener);
      });
    };
  }, store.current);
}
