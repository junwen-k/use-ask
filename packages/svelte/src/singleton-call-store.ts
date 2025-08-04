import { SingletonCallStore as CoreSingletonCallStore } from '@ui-call/core';
import { createSubscriber } from 'svelte/reactivity';

export class SingletonCallStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown,
> extends CoreSingletonCallStore<TPayload, TData, TReason> {
  #subscribe: () => void;

  constructor(
    ...args: ConstructorParameters<typeof CoreSingletonCallStore<TPayload, TData, TReason>>
  ) {
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

  get current() {
    this.#subscribe();

    return super.current;
  }
}
