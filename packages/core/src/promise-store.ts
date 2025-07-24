import { type Event, EventManager } from "./event-manager";

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

export type PromiseEntry<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
> =
  | PromiseEntryUnsafe<TPayload, TData, TReason>
  | PromiseEntrySafe<TPayload, TData, TReason>;

export interface PromiseEntryBase<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
> {
  id: Id;
  payload: TPayload;
  resolve: (data?: TData) => void;
  reject: (reason?: TReason) => void;
}

export interface PromiseEntryUnsafe<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
> extends PromiseEntryBase<TPayload, TData, TReason> {
  promise: Promise<TData>;
  safe: false;
}

export interface PromiseEntrySafe<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
> extends PromiseEntryBase<TPayload, TData, TReason> {
  promise: Promise<SafeResult<TData, TReason>>;
  safe: true;
}

export class PromiseStore<
  TPayload = unknown,
  TData = unknown,
  TReason = unknown
> {
  #stack: Map<Id, PromiseEntry<TPayload, TData, TReason>> = new Map();
  #snapshot: PromiseEntry<TPayload, TData, TReason>[] | null = null;

  #eventManager: EventManager<TPayload, TData, TReason> = new EventManager<
    TPayload,
    TData,
    TReason
  >();
  #changeVersion = 0;

  #nextId = 0;

  get entries() {
    return this.memoizeSnapshot(() => Array.from(this.#stack.values()));
  }

  memoizeSnapshot<T extends PromiseEntry<TPayload, TData, TReason>[]>(
    snapshotFn: () => T
  ) {
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

  #addPromise(
    payload: TPayload,
    safe: false
  ): PromiseEntryUnsafe<TPayload, TData, TReason>;
  #addPromise(
    payload: TPayload,
    safe: true
  ): PromiseEntrySafe<TPayload, TData, TReason>;
  #addPromise(payload: TPayload, safe: boolean) {
    const {
      promise,
      resolve: resolvePromise,
      reject: rejectPromise,
    } = Promise.withResolvers();

    const resolve = (data?: TData) => {
      if (safe) {
        resolvePromise({ ok: true, data });
      } else {
        resolvePromise(data);
      }
      this.#dispatchEvent({
        type: "resolve",
        entry,
      });
    };

    const reject = (reason?: TReason) => {
      if (safe) {
        resolvePromise({ ok: false, reason });
      } else {
        rejectPromise(reason);
      }
      this.#dispatchEvent({
        type: "reject",
        entry,
      });
    };

    const id = this.#generateId();

    const entry = {
      id,
      payload,
      promise,
      resolve,
      reject,
      pending: Boolean(resolvePromise) && Boolean(rejectPromise),
      safe,
    } as PromiseEntry<TPayload, TData, TReason>;

    this.#stack.set(entry.id, entry);

    this.#dispatchEvent({
      type: "add",
      entry,
    });

    return entry;
  }

  /**
   * Adds a pending promise entry to the store, returning the promise directly.
   */
  add(payload: TPayload) {
    return this.#addPromise(payload, false);
  }

  /**
   * Adds a safe pending promise entry to the store, returning the promise directly.
   */
  addSafe(payload: TPayload) {
    return this.#addPromise(payload, true);
  }

  /**
   * Gets a promise entry from the store.
   */
  get(id: Id) {
    return this.#stack.get(id);
  }

  /**
   * Gets all promise entries from the store.
   */
  getAll() {
    return this.entries;
  }

  /**
   * Updates a promise entry in the store.
   */
  update(id: Id, payload: TPayload) {
    const entry = this.#stack.get(id);
    if (!entry) {
      return;
    }

    const newEntry = {
      ...entry,
      payload,
    } as PromiseEntry<TPayload, TData, TReason>;

    this.#stack.set(id, newEntry);

    this.#dispatchEvent({
      type: "update",
      entry: newEntry,
    });

    return entry;
  }

  /**
   * Deletes a promise entry from the store.
   */
  delete(id: Id) {
    const entry = this.#stack.get(id);
    if (!entry) {
      return;
    }

    this.#stack.delete(id);

    this.#dispatchEvent({
      type: "delete",
      entry,
    });

    return entry;
  }

  /**
   * Clears all promise stack from the store.
   */
  clear() {
    const deleted = Array.from(this.#stack.values());

    this.#stack.clear();

    this.#dispatchEvent({
      type: "clear",
      entries: deleted,
    });
  }

  /**
   * Adds an event listener to the store.
   */
  addEventListener(
    ...args: Parameters<
      EventManager<TPayload, TData, TReason>["addEventListener"]
    >
  ) {
    this.#eventManager.addEventListener(...args);
  }

  /**
   * Removes an event listener from the store.
   */
  removeEventListener(
    ...args: Parameters<
      EventManager<TPayload, TData, TReason>["removeEventListener"]
    >
  ) {
    this.#eventManager.removeEventListener(...args);
  }
}
