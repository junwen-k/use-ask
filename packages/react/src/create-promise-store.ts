import { PromiseStore } from "@use-ask/core";
import { usePromiseStore } from "./use-promise-store";

export function createPromiseStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
>() {
  const store = new PromiseStore<TPayload, TData, TReason>();

  return [store, () => usePromiseStore(store)] as const;
}
