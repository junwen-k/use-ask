import { PromiseStore as CorePromiseStore } from "@use-ask/core";
import { onBeforeUnmount, ref } from "vue";

export function usePromiseStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
>() {
  const store = new CorePromiseStore<TPayload, TData, TReason>();
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
    add: store.add.bind(store),
    addSafe: store.addSafe.bind(store),
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
