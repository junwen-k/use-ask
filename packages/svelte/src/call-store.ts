import { CallStore as CoreCallStore } from '@ui-call/core';
import { createSubscriber } from 'svelte/reactivity';

export class CallStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown,
> extends CoreCallStore<TPayload, TData, TReason> {
  #subscribe: () => void;

  constructor(...args: ConstructorParameters<typeof CoreCallStore>) {
    super(...args);

    this.#subscribe = createSubscriber((update) => {
      const listener = () => update();

      this.addEventListener('add', listener);
      this.addEventListener('update', listener);
      this.addEventListener('settled', listener);
      this.addEventListener('resolve', listener);
      this.addEventListener('reject', listener);
      this.addEventListener('delete', listener);
      this.addEventListener('clear', listener);

      return () => {
        this.removeEventListener('add', listener);
        this.removeEventListener('update', listener);
        this.removeEventListener('settled', listener);
        this.removeEventListener('resolve', listener);
        this.removeEventListener('reject', listener);
        this.removeEventListener('delete', listener);
        this.removeEventListener('clear', listener);
      };
    });
  }

  get callStacks() {
    this.#subscribe();

    return super.callStacks;
  }
}
