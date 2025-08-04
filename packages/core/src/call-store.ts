import { type Event, EventManager, type EventType } from './event-manager';

export type SafeResult<TData = unknown, TReason = unknown> =
  | SafeFullfilledResult<TData>
  | SafeRejectedResult<TReason>;

export interface SafeFullfilledResult<TData = unknown> {
  ok: true;
  data: TData;
}

export interface SafeRejectedResult<TReason = unknown> {
  ok: false;
  reason: TReason;
}

export type Call<TPayload = unknown, TData = unknown, TReason = unknown> =
  | CallUnsafe<TPayload, TData, TReason>
  | CallSafe<TPayload, TData, TReason>;

export interface CallBase<TPayload = unknown, TData = unknown, TReason = unknown> {
  id: number;
  payload: TPayload;
  resolve: (data?: TData) => void;
  reject: (reason?: TReason) => void;
  pending: boolean;
}

export interface CallUnsafe<TPayload = unknown, TData = unknown, TReason = unknown>
  extends CallBase<TPayload, TData, TReason> {
  promise: Promise<TData>;
  safe: false;
}

export interface CallSafe<TPayload = unknown, TData = unknown, TReason = unknown>
  extends CallBase<TPayload, TData, TReason> {
  promise: Promise<SafeResult<TData, TReason>>;
  safe: true;
}

export interface CallStoreOptions {
  unmountingDelay?: number;
}

export interface CallOptions {
  unmountingDelay?: number;
}

export class CallStore<TPayload = unknown, TData = unknown, TReason = unknown> {
  #stack: Array<Call<TPayload, TData, TReason>> = [];

  #eventManager: EventManager<TPayload, TData, TReason> = new EventManager<
    TPayload,
    TData,
    TReason
  >();

  #nextId = 0;
  #unmountingDelay: number;
  #timeoutIds: Map<Promise<unknown>, ReturnType<typeof setTimeout>> = new Map();

  constructor(options: CallStoreOptions = {}) {
    this.#unmountingDelay = options?.unmountingDelay ?? 0;
  }

  get stack() {
    return this.#stack;
  }

  #generateId() {
    const id = this.#nextId;
    this.#nextId++;
    return id;
  }

  #dispatchEvent(event: Event<TPayload, TData, TReason>) {
    this.#eventManager.dispatchEvent(event);
  }

  #addCall(
    payload: TPayload,
    safe: false,
    options: CallOptions
  ): CallUnsafe<TPayload, TData, TReason>;
  #addCall(payload: TPayload, safe: true, options: CallOptions): CallSafe<TPayload, TData, TReason>;
  #addCall(
    payload: TPayload,
    safe: boolean,
    { unmountingDelay = this.#unmountingDelay }: CallOptions
  ) {
    const { promise, resolve: resolvePromise, reject: rejectPromise } = Promise.withResolvers();

    const handleSettlement = (type: 'resolve' | 'reject') => {
      const index = this.stack.indexOf(call);

      this.stack[index] = {
        ...call,
        pending: false,
      };

      this.#dispatchEvent({
        type,
        call,
      });

      if (unmountingDelay > 0) {
        const timeoutId = setTimeout(() => {
          this.#deleteCall(call.promise, 'settled');
        }, unmountingDelay);

        this.#timeoutIds.set(call.promise, timeoutId);
      } else {
        this.#deleteCall(call.promise, 'settled');
      }
    };

    const resolve = (data?: TData) => {
      if (safe) {
        resolvePromise({ ok: true, data });
      } else {
        resolvePromise(data);
      }
      handleSettlement('resolve');
    };

    const reject = (reason?: TReason) => {
      if (safe) {
        resolvePromise({ ok: false, reason });
      } else {
        rejectPromise(reason);
      }
      handleSettlement('reject');
    };

    const id = this.#generateId();

    const call = {
      id,
      payload,
      promise,
      resolve,
      reject,
      pending: true,
      safe,
    } as Call<TPayload, TData, TReason>;

    this.stack.push(call);

    this.#dispatchEvent({
      type: 'add',
      call,
    });

    return call;
  }

  #deleteCall(promise: Promise<unknown>, eventType: Extract<EventType, 'delete' | 'settled'>) {
    const call = this.#getCall(promise);
    if (!call) {
      return;
    }

    const timeoutId = this.#timeoutIds.get(promise);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.#timeoutIds.delete(promise);
    }

    this.stack.splice(this.stack.indexOf(call), 1);

    this.#dispatchEvent({
      type: eventType,
      call,
    });

    return call;
  }

  #getCall(promise: Promise<unknown>) {
    return this.stack.find((call) => call.promise === promise);
  }

  /**
   * Adds a pending call stack to the store, returning the promise directly.
   */
  call(payload: TPayload, options: CallStoreOptions = {}) {
    return this.#addCall(payload, false, options).promise;
  }

  /**
   * Adds a safe pending call stack to the store, returning the promise directly.
   */
  callSafe(payload: TPayload, options: CallStoreOptions = {}) {
    return this.#addCall(payload, true, options).promise;
  }

  /**
   * Updates a call stack in the store.
   */
  update(promise: Promise<unknown>, payload: TPayload) {
    const call = this.#getCall(promise);
    if (!call) {
      return;
    }

    const index = this.stack.indexOf(call);

    const newCall = {
      ...call,
      payload,
    } as Call<TPayload, TData, TReason>;

    this.stack[index] = newCall;

    this.#dispatchEvent({
      type: 'update',
      call: newCall,
    });

    return call;
  }

  resolve(promise: Promise<unknown>, data?: TData) {
    const call = this.#getCall(promise);
    if (!call) {
      return;
    }

    call.resolve(data);
  }

  reject(promise: Promise<unknown>, reason?: TReason) {
    const call = this.#getCall(promise);
    if (!call) {
      return;
    }

    call.reject(reason);
  }

  /**
   * Adds an event listener to the store.
   */
  addEventListener(
    ...args: Parameters<EventManager<TPayload, TData, TReason>['addEventListener']>
  ) {
    this.#eventManager.addEventListener(...args);
  }

  /**
   * Removes an event listener from the store.
   */
  removeEventListener(
    ...args: Parameters<EventManager<TPayload, TData, TReason>['removeEventListener']>
  ) {
    this.#eventManager.removeEventListener(...args);
  }
}
