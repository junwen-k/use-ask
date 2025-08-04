import { CallStore as CoreCallStore } from '@ui-call/core';
import { createSubscriber } from 'svelte/reactivity';

export class CallStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown,
> extends CoreCallStore<TPayload, TData, TReason> {
  #subscribe: () => void;

  constructor(...args: ConstructorParameters<typeof CoreCallStore<TPayload, TData, TReason>>) {
    super(...args);

    this.#subscribe = createSubscriber((update) => {
      const listener = () => update();

      this.addEventListener('add', listener);
      this.addEventListener('update', listener);
      this.addEventListener('settled', listener);
      this.addEventListener('resolve', listener);
      this.addEventListener('reject', listener);

      return () => {
        this.removeEventListener('add', listener);
        this.removeEventListener('update', listener);
        this.removeEventListener('settled', listener);
        this.removeEventListener('resolve', listener);
        this.removeEventListener('reject', listener);
      };
    });
  }

  get stack() {
    this.#subscribe();

    return super.stack;
  }
}
