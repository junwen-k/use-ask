import { type Event, EventManager, type EventType } from './event-manager';

export type Id = number;

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
  id: Id;
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
  #stack: Map<Id, CallStack<TPayload, TData, TReason>> = new Map();
  #snapshot: Array<CallStack<TPayload, TData, TReason>> | null = null;
  #unmountingDelay: number;

  #eventManager: EventManager<TPayload, TData, TReason> = new EventManager<
    TPayload,
    TData,
    TReason
  >();
  #changeVersion = 0;
  #timeoutIds: Map<Id, ReturnType<typeof setTimeout>> = new Map();

  #nextId = 0;

  constructor(options: CallStoreOptions = {}) {
    this.#unmountingDelay = options?.unmountingDelay ?? 0;
  }

  get callStacks() {
    return this.#memoizeSnapshot(() => Array.from(this.#stack.values()));
  }

  #memoizeSnapshot<T extends Array<CallStack<TPayload, TData, TReason>>>(snapshotFn: () => T) {
    const currentVersion = this.#getChangeVersion();

    if (this.#snapshot && this.#changeVersion === currentVersion) {
      return this.#snapshot;
    }

    const result = snapshotFn();

    this.#snapshot = result;

    return result;
  }

  #getChangeVersion() {
    return this.#changeVersion;
  }

  #generateId() {
    const id = this.#nextId;
    this.#nextId++;
    return id;
  }

  #invalidateSnapshot() {
    this.#snapshot = null;
    this.#changeVersion++;
  }

  #dispatchEvent(event: Event<TPayload, TData, TReason>) {
    this.#invalidateSnapshot();
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
      this.#stack.set(callStack.id, {
        ...callStack,
        pending: false,
      });

      this.#dispatchEvent({ type, callStack });

      if (unmountingDelay > 0) {
        const timeoutId = setTimeout(() => {
          this.#timeoutIds.delete(callStack.id);
          this.#deleteCallStack(callStack.id, 'settled');
        }, unmountingDelay);

        this.#timeoutIds.set(callStack.id, timeoutId);
      } else {
        this.#deleteCallStack(callStack.id, 'settled');
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

    this.#stack.set(callStack.id, callStack);

    this.#dispatchEvent({
      type: 'add',
      callStack,
    });

    return callStack;
  }

  #deleteCallStack(id: Id, eventType: Extract<EventType, 'delete' | 'settled'>) {
    const callStack = this.#stack.get(id);
    if (!callStack) {
      return;
    }

    const timeoutId = this.#timeoutIds.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.#timeoutIds.delete(id);
    }

    this.#stack.delete(id);

    this.#dispatchEvent({
      type: eventType,
      callStack,
    });

    return callStack;
  }

  /**
   * Adds a pending call stack to the store, returning the promise directly.
   */
  call(payload: TPayload, options: CallStoreOptions = {}) {
    return this.#addCallStack(payload, false, options);
  }

  /**
   * Adds a safe pending call stack to the store, returning the promise directly.
   */
  callSafe(payload: TPayload, options: CallStoreOptions = {}) {
    return this.#addCallStack(payload, true, options);
  }

  /**
   * Gets a call stack from the store.
   */
  get(id: Id) {
    return this.#stack.get(id);
  }

  /**
   * Gets all call stacks from the store.
   */
  getAll() {
    return this.callStacks;
  }

  /**
   * Updates a call stack in the store.
   */
  update(id: Id, payload: TPayload) {
    const callStack = this.#stack.get(id);
    if (!callStack) {
      return;
    }

    const newCallStack = {
      ...callStack,
      payload,
    } as CallStack<TPayload, TData, TReason>;

    this.#stack.set(id, newCallStack);

    this.#dispatchEvent({
      type: 'update',
      callStack: newCallStack,
    });

    return callStack;
  }

  /**
   * Deletes a call stack from the store.
   */
  delete(id: Id) {
    return this.#deleteCallStack(id, 'delete');
  }

  /**
   * Clears all promise stack from the store.
   */
  clear() {
    for (const timeoutId of this.#timeoutIds.values()) {
      clearTimeout(timeoutId);
    }
    this.#timeoutIds.clear();

    const deleted = Array.from(this.#stack.values());

    this.#stack.clear();

    this.#dispatchEvent({
      type: 'clear',
      callStacks: deleted,
    });
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
