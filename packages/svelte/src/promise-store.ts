import { PromiseStore as CorePromiseStore } from "@use-ask/core";
import { createSubscriber } from "svelte/reactivity";

export class PromiseStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
> extends CorePromiseStore<TPayload, TData, TReason> {
  #subscribe: () => void;

  constructor() {
    super();

    this.#subscribe = createSubscriber((update) => {
      const listener = () => update();

      this.addEventListener("add", listener);
      this.addEventListener("update", listener);
      this.addEventListener("settled", listener);
      this.addEventListener("resolve", listener);
      this.addEventListener("reject", listener);
      this.addEventListener("delete", listener);
      this.addEventListener("clear", listener);

      return () => {
        this.removeEventListener("add", listener);
        this.removeEventListener("update", listener);
        this.removeEventListener("settled", listener);
        this.removeEventListener("resolve", listener);
        this.removeEventListener("reject", listener);
        this.removeEventListener("delete", listener);
        this.removeEventListener("clear", listener);
      };
    });
  }

  get entries() {
    this.#subscribe();

    return super.entries;
  }
}
