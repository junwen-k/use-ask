import { CallStore } from "@ui-call/core";
import { useCallStore } from "./use-call-store";

export function createCallStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
>() {
  const store = new CallStore<TPayload, TData, TReason>();

  return [store, () => useCallStore(store)] as const;
}
