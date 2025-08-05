import {
  CallStore as CoreCallStore,
  SingletonCallStore as CoreSingletonCallStore,
} from '@ui-call/core';
import { createSubscriber } from 'svelte/reactivity';

const EVENTS = ['add', 'update', 'settled', 'resolve', 'reject'] as const;

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

      EVENTS.forEach((event) => {
        this.addEventListener(event, listener);
      });

      return () => {
        EVENTS.forEach((event) => {
          this.removeEventListener(event, listener);
        });
      };
    });
  }

  get stack() {
    this.#subscribe();

    return super.stack;
  }
}

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

      EVENTS.forEach((event) => {
        this.addEventListener(event, listener);
      });

      return () => {
        EVENTS.forEach((event) => {
          this.removeEventListener(event, listener);
        });
      };
    });
  }

  get current() {
    this.#subscribe();

    return super.current;
  }
}
