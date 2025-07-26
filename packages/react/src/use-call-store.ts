import type { CallStore } from "@ui-call/core";
import { useSyncExternalStore } from "react";

export function useCallStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
>(store: CallStore<TPayload, TData, TReason>) {
  return useSyncExternalStore(
    (listener) => {
      store.addEventListener("add", listener);
      store.addEventListener("update", listener);
      store.addEventListener("settled", listener);
      store.addEventListener("resolve", listener);
      store.addEventListener("reject", listener);
      store.addEventListener("delete", listener);
      store.addEventListener("clear", listener);

      return () => {
        store.removeEventListener("add", listener);
        store.removeEventListener("update", listener);
        store.removeEventListener("settled", listener);
        store.removeEventListener("resolve", listener);
        store.removeEventListener("reject", listener);
        store.removeEventListener("delete", listener);
        store.removeEventListener("clear", listener);
      };
    },
    () => store.entries,
    () => store.entries
  );
}
