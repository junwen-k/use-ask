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

      this.addEventListener("change", listener);
      return () => this.removeEventListener("change", listener);
    });
  }

  get entries() {
    this.#subscribe();

    return super.entries;
  }
}
