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

export type CallStack<TPayload = unknown, TData = unknown, TReason = unknown> =
  | CallStackUnsafe<TPayload, TData, TReason>
  | CallStackSafe<TPayload, TData, TReason>;

export interface CallStackBase<TPayload = unknown, TData = unknown, TReason = unknown> {
  id: number;
  payload: TPayload;
  resolve: (data?: TData) => void;
  reject: (reason?: TReason) => void;
  pending: boolean;
}

export interface CallStackUnsafe<TPayload = unknown, TData = unknown, TReason = unknown>
  extends CallStackBase<TPayload, TData, TReason> {
  promise: Promise<TData>;
  safe: false;
}

export interface CallStackSafe<TPayload = unknown, TData = unknown, TReason = unknown>
  extends CallStackBase<TPayload, TData, TReason> {
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
  #stack: Array<CallStack<TPayload, TData, TReason>> = [];
  #unmountingDelay: number;

  #eventManager: EventManager<TPayload, TData, TReason> = new EventManager<
    TPayload,
    TData,
    TReason
  >();
  #timeoutIds: Map<Promise<unknown>, ReturnType<typeof setTimeout>> = new Map();

  #nextId = 0;

  constructor(options: CallStoreOptions = {}) {
    this.#unmountingDelay = options?.unmountingDelay ?? 0;
  }

  get callStacks() {
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

  #addCallStack(
    payload: TPayload,
    safe: false,
    options: CallOptions
  ): CallStackUnsafe<TPayload, TData, TReason>;
  #addCallStack(
    payload: TPayload,
    safe: true,
    options: CallOptions
  ): CallStackSafe<TPayload, TData, TReason>;
  #addCallStack(
    payload: TPayload,
    safe: boolean,
    { unmountingDelay = this.#unmountingDelay }: CallOptions
  ) {
    const { promise, resolve: resolvePromise, reject: rejectPromise } = Promise.withResolvers();

    const handleSettlement = (type: 'resolve' | 'reject') => {
      const index = this.#stack.indexOf(callStack);

      this.#stack[index] = {
        ...callStack,
        pending: false,
      };

      this.#dispatchEvent({
        type,
        callStack,
      });

      if (unmountingDelay > 0) {
        const timeoutId = setTimeout(() => {
          this.#deleteCallStack(callStack.promise, 'settled');
        }, unmountingDelay);

        this.#timeoutIds.set(callStack.promise, timeoutId);
      } else {
        this.#deleteCallStack(callStack.promise, 'settled');
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

    const callStack = {
      id,
      payload,
      promise,
      resolve,
      reject,
      pending: true,
      safe,
    } as CallStack<TPayload, TData, TReason>;

    this.#stack.push(callStack);

    this.#dispatchEvent({
      type: 'add',
      callStack,
    });

    return callStack;
  }

  #deleteCallStack(promise: Promise<unknown>, eventType: Extract<EventType, 'delete' | 'settled'>) {
    const callStack = this.#getCallStack(promise);
    if (!callStack) {
      return;
    }

    const timeoutId = this.#timeoutIds.get(promise);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.#timeoutIds.delete(promise);
    }

    this.#stack.splice(this.#stack.indexOf(callStack), 1);

    this.#dispatchEvent({
      type: eventType,
      callStack,
    });

    return callStack;
  }

  #getCallStack(promise: Promise<unknown>) {
    return this.#stack.find((callStack) => callStack.promise === promise);
  }

  /**
   * Adds a pending call stack to the store, returning the promise directly.
   */
  call(payload: TPayload, options: CallStoreOptions = {}) {
    return this.#addCallStack(payload, false, options).promise;
  }

  /**
   * Adds a safe pending call stack to the store, returning the promise directly.
   */
  callSafe(payload: TPayload, options: CallStoreOptions = {}) {
    return this.#addCallStack(payload, true, options).promise;
  }

  /**
   * Updates a call stack in the store.
   */
  update(promise: Promise<unknown>, payload: TPayload) {
    const callStack = this.#getCallStack(promise);
    if (!callStack) {
      return;
    }

    const index = this.#stack.indexOf(callStack);

    const newCallStack = {
      ...callStack,
      payload,
    } as CallStack<TPayload, TData, TReason>;

    this.#stack[index] = newCallStack;

    this.#dispatchEvent({
      type: 'update',
      callStack: newCallStack,
    });

    return callStack;
  }

  resolve(promise: Promise<unknown>, data?: TData) {
    const callStack = this.#getCallStack(promise);
    if (!callStack) {
      return;
    }

    callStack.resolve(data);
  }

  reject(promise: Promise<unknown>, reason?: TReason) {
    const callStack = this.#getCallStack(promise);
    if (!callStack) {
      return;
    }

    callStack.reject(reason);
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
