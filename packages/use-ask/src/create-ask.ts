'use client'

import { useSyncExternalStore } from 'react'

import { AskStore } from './ask-store'

export type CreateAskStoreReturn<P, TData = unknown, TReason = unknown> = [
  AskStore<P, TData, TReason>,
  ReturnType<typeof useSyncExternalStore<AskStore<P, TData, TReason>['getSnapshot']>>,
]

export const createAsk = <P, TData = unknown, TReason = unknown>(): CreateAskStoreReturn<
  P,
  TData,
  TReason
> => {
  const store = new AskStore<P, TData, TReason>()

  return [store, () => useSyncExternalStore(store.subscribe, store.getSnapshot)]
}
