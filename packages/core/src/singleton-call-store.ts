import { CallStore, type CallStoreOptions } from './call-store';

export class SingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown> {
  #callStore: CallStore<TPayload, TData, TReason>;
  #current: Promise<TData> | null = null;

  constructor(...args: ConstructorParameters<typeof CallStore<TPayload, TData, TReason>>) {
    this.#callStore = new CallStore<TPayload, TData, TReason>(...args);

    this.#callStore.addEventListener('resolve', (event) => {
      if (event.call.promise === this.#current) {
        this.#current = null;
      }
    });

    this.#callStore.addEventListener('reject', (event) => {
      if (event.call.promise === this.#current) {
        this.#current = null;
      }
    });
  }

  get current() {
    return this.#current;
  }

  call(payload: TPayload, options: CallStoreOptions = {}) {
    if (this.#current) {
      return this.update(payload);
    }

    this.#current = this.#callStore.call(payload, options);

    return this.#current;
  }

  update(payload: TPayload) {
    if (!this.#current) {
      return;
    }

    return this.#callStore.update(this.#current, payload);
  }

  resolve(data: TData) {
    if (!this.#current) {
      return;
    }

    this.#callStore.resolve(this.#current, data);
  }

  reject(reason: TReason) {
    if (!this.#current) {
      return;
    }

    this.#callStore.reject(this.#current, reason);
  }

  addEventListener(...args: Parameters<CallStore<TPayload, TData, TReason>['addEventListener']>) {
    this.#callStore.addEventListener(...args);
  }

  removeEventListener(
    ...args: Parameters<CallStore<TPayload, TData, TReason>['removeEventListener']>
  ) {
    this.#callStore.removeEventListener(...args);
  }
}
