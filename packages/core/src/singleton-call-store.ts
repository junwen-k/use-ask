import { CallStore, type CallStoreOptions } from './call-store';

export class SingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown> {
  #callStore: CallStore<TPayload, TData, TReason>;
  #current: Promise<TData> | null = null;

  constructor() {
    this.#callStore = new CallStore<TPayload, TData, TReason>();
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
}
