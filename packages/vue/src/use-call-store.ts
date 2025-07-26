import { CallStore as CoreCallStore } from "@ui-call/core";
import { onBeforeUnmount, ref } from "vue";

export function useCallStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
>() {
  const store = new CoreCallStore<TPayload, TData, TReason>();
  const entries = ref(store.entries);

  const listener = () => {
    entries.value = store.entries;
  };

  store.addEventListener("add", listener);
  store.addEventListener("update", listener);
  store.addEventListener("settled", listener);
  store.addEventListener("resolve", listener);
  store.addEventListener("reject", listener);
  store.addEventListener("delete", listener);
  store.addEventListener("clear", listener);

  onBeforeUnmount(() => {
    store.removeEventListener("add", listener);
    store.removeEventListener("update", listener);
    store.removeEventListener("settled", listener);
    store.removeEventListener("resolve", listener);
    store.removeEventListener("reject", listener);
    store.removeEventListener("delete", listener);
    store.removeEventListener("clear", listener);
  });

  return {
    call: store.call.bind(store),
    callSafe: store.callSafe.bind(store),
    get: store.get.bind(store),
    getAll: store.getAll.bind(store),
    update: store.update.bind(store),
    delete: store.delete.bind(store),
    clear: store.clear.bind(store),
    get entries() {
      return entries.value;
    },
  };
}
