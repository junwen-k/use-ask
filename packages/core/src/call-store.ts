import { type Event, EventManager, type EventType } from './event-manager';

export interface Call<TPayload = unknown, TData = unknown, TReason = unknown> {
  id: number;
  payload: TPayload;
  resolve: (data?: TData) => void;
  reject: (reason?: TReason) => void;
  promise: Promise<TData>;
  pending: boolean;
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
  #timeoutIds: Map<Promise<TData>, ReturnType<typeof setTimeout>> = new Map();

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

  #addCall(payload: TPayload, { unmountingDelay = this.#unmountingDelay }: CallOptions) {
    const { promise, resolve: _resolve, reject: _reject } = Promise.withResolvers();

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
      _resolve(data);
      handleSettlement('resolve');
    };

    const reject = (reason?: TReason) => {
      _reject(reason);
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
    } as Call<TPayload, TData, TReason>;

    this.stack.push(call);

    this.#dispatchEvent({
      type: 'add',
      call,
    });

    return call;
  }

  #deleteCall(promise: Promise<TData>, eventType: Extract<EventType, 'delete' | 'settled'>) {
    const call = this.#getCall(promise)!;

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

  #getCall(promise: Promise<TData>) {
    return this.stack.find((call) => call.promise === promise);
  }

  call(payload: TPayload, options: CallStoreOptions = {}) {
    return this.#addCall(payload, options).promise;
  }

  update(promise: Promise<TData>, payload: TPayload) {
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

    return call.promise;
  }

  resolve(promise: Promise<TData>, data?: TData) {
    const call = this.#getCall(promise);
    if (!call) {
      return;
    }

    call.resolve(data);
  }

  reject(promise: Promise<TData>, reason?: TReason) {
    const call = this.#getCall(promise);
    if (!call) {
      return;
    }

    call.reject(reason);
  }

  addEventListener(
    ...args: Parameters<EventManager<TPayload, TData, TReason>['addEventListener']>
  ) {
    this.#eventManager.addEventListener(...args);
  }

  removeEventListener(
    ...args: Parameters<EventManager<TPayload, TData, TReason>['removeEventListener']>
  ) {
    this.#eventManager.removeEventListener(...args);
  }
}
