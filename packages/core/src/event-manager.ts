/**
 * Represents the different types of events that can be dispatched.
 */
export type EventType = 'change' | 'add' | 'delete' | 'update' | 'clear';

/**
 * Maps an event type string to its respective event interface.
 */
type EventByType<T> = T extends 'change'
  ? ChangeEvent
  : T extends 'add'
    ? AddEvent
    : T extends 'delete'
      ? DeleteEvent
      : T extends 'update'
        ? UpdateEvent
        : T extends 'clear'
          ? ClearEvent
          : never;

/**
 * Base interface for all events.
 */
export interface BaseEvent {
  type: EventType;
}

/**
 * Event fired when a change occurs in the store.
 */
export interface ChangeEvent extends BaseEvent {
  type: 'change';
}

/**
 * Event fired when a new promise is added to the store.
 */
export interface AddEvent extends BaseEvent {
  type: 'add';
  id: number;
  payload: unknown;
}

/**
 * Event fired when a promise is deleted from the store.
 */
export interface DeleteEvent extends BaseEvent {
  type: 'delete';
  id: number;
  reason?: unknown;
}

/**
 * Event fired when a promise payload is updated.
 */
export interface UpdateEvent extends BaseEvent {
  type: 'update';
  id: number;
  payload: unknown;
}

/**
 * Event fired when all promises are cleared from the store.
 */
export interface ClearEvent extends BaseEvent {
  type: 'clear';
  reason?: unknown;
}

/**
 * Type representing all possible event types.
 */
export type Event =
  | ChangeEvent
  | AddEvent
  | DeleteEvent
  | UpdateEvent
  | ClearEvent;

export type EventListener<T extends EventType> = (
  event: EventByType<T>
) => void;

/**
 * Manages registration and dispatching of event listeners.
 */
export class EventManager {
  readonly #eventListeners: Map<EventType, Set<EventListener<EventType>>> =
    new Map();

  addEventListener<T extends EventType>(
    type: T,
    listener: EventListener<T>
  ): void {
    let listeners = this.#eventListeners.get(type);

    if (!listeners) {
      listeners = new Set<EventListener<T>>();
      this.#eventListeners.set(type, listeners);
    }

    listeners.add(listener);
  }

  removeEventListener<T extends EventType>(
    type: T,
    listener?: EventListener<T>
  ): void {
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

  dispatch<T extends EventType>(event: EventByType<T>): void {
    const listeners = this.#eventListeners.get(event.type);
    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }

  removeAllEventListeners(): void {
    this.#eventListeners.clear();
  }
}
