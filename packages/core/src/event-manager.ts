import type { Call } from './call-store';

/**
 * Represents the different types of events that can be dispatched.
 */
export type EventType =
  | AddEvent['type']
  | ResolveEvent['type']
  | RejectEvent['type']
  | UpdateEvent['type']
  | SettledEvent['type'];

/**
 * Maps an event type string to its respective event interface.
 */
type EventByType<T, TPayload, TData, TReason> = T extends 'add'
  ? AddEvent<TPayload, TData, TReason>
  : T extends 'resolve'
    ? ResolveEvent<TPayload, TData, TReason>
    : T extends 'reject'
      ? RejectEvent<TPayload, TData, TReason>
      : T extends 'update'
        ? UpdateEvent<TPayload, TData, TReason>
        : T extends 'settled'
          ? SettledEvent<TPayload, TData, TReason>
          : never;

/**
 * Base interface for all events.
 */
export interface BaseEvent {
  type: EventType;
}

export interface AddEvent<TPayload = unknown, TData = unknown, TReason = unknown>
  extends BaseEvent {
  type: 'add';
  call: Call<TPayload, TData, TReason>;
}

export interface UpdateEvent<TPayload = unknown, TData = unknown, TReason = unknown>
  extends BaseEvent {
  type: 'update';
  call: Call<TPayload, TData, TReason>;
}
export interface ResolveEvent<TPayload = unknown, TData = unknown, TReason = unknown>
  extends BaseEvent {
  type: 'resolve';
  call: Call<TPayload, TData, TReason>;
}

export interface RejectEvent<TPayload = unknown, TData = unknown, TReason = unknown>
  extends BaseEvent {
  type: 'reject';
  call: Call<TPayload, TData, TReason>;
}

export interface SettledEvent<TPayload = unknown, TData = unknown, TReason = unknown>
  extends BaseEvent {
  type: 'settled';
  call: Call<TPayload, TData, TReason>;
}

/**
 * Type representing all possible event types.
 */
export type Event<TPayload = unknown, TData = unknown, TReason = unknown> =
  | AddEvent<TPayload, TData, TReason>
  | ResolveEvent<TPayload, TData, TReason>
  | RejectEvent<TPayload, TData, TReason>
  | UpdateEvent<TPayload, TData, TReason>
  | SettledEvent<TPayload, TData, TReason>;

export type EventListener<T extends EventType, TPayload, TData, TReason> = (
  event: EventByType<T, TPayload, TData, TReason>
) => void;

/**
 * Manages registration and dispatching of event listeners.
 */
export class EventManager<TPayload = unknown, TData = unknown, TReason = unknown> {
  readonly #eventListeners: Map<
    EventType,
    Set<EventListener<EventType, TPayload, TData, TReason>>
  > = new Map();

  addEventListener<T extends EventType>(
    type: T,
    listener: EventListener<T, TPayload, TData, TReason>
  ) {
    let listeners = this.#eventListeners.get(type);

    if (!listeners) {
      listeners = new Set<EventListener<T, TPayload, TData, TReason>>();
      this.#eventListeners.set(type, listeners);
    }

    listeners.add(listener);
  }

  removeEventListener<T extends EventType>(
    type: T,
    listener?: EventListener<T, TPayload, TData, TReason>
  ) {
    const listeners = this.#eventListeners.get(type);
    if (!listeners) {
      return;
    }

    if (listener) {
      listeners.delete(listener);

      if (listeners.size === 0) {
        this.#eventListeners.delete(type);
      }
    } else {
      this.#eventListeners.delete(type);
    }
  }

  dispatchEvent<T extends EventType>(event: EventByType<T, TPayload, TData, TReason>) {
    const listeners = this.#eventListeners.get(event.type);
    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }

  removeAllEventListeners() {
    this.#eventListeners.clear();
  }
}
