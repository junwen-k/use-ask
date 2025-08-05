import { CallStore, type CallStoreOptions } from './call-store';

export class SingletonCallStore<TPayload = unknown, TData = unknown, TReason = unknown> {
  #callStore: CallStore<TPayload, TData, TReason>;

  constructor(...args: ConstructorParameters<typeof CallStore<TPayload, TData, TReason>>) {
    this.#callStore = new CallStore<TPayload, TData, TReason>(...args);
  }

  get current() {
    return this.#callStore.stack.at(-1) ?? null;
  }

  call(payload: TPayload, options: CallStoreOptions = {}) {
    if (this.current) {
      this.update(payload);
      return this.current.promise;
    }

    return this.#callStore.call(payload, options);
  }

  update(payload: TPayload) {
    if (!this.current) {
      return;
    }

    return this.#callStore.update(this.current.promise, payload);
  }

  resolve(data: TData) {
    if (!this.current) {
      return;
    }

    this.#callStore.resolve(this.current.promise, data);
  }

  reject(reason: TReason) {
    if (!this.current) {
      return;
    }

    this.#callStore.reject(this.current.promise, reason);
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
