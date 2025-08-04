import { describe, expect, it, vi } from 'vitest';

import { type AddEvent, EventManager } from './event-manager';

describe('EventManager', () => {
  it('should create a new event manager', () => {
    const manager = new EventManager();
    expect(manager).toBeInstanceOf(EventManager);
  });

  it('should add and remove event listeners', () => {
    const manager = new EventManager();
    const listener = vi.fn();

    manager.addEventListener('add', listener);

    const event: AddEvent = {
      type: 'add',
      call: {
        id: 1,
        payload: 'test',
        promise: new Promise(vi.fn),
        resolve: vi.fn(),
        reject: vi.fn(),
        pending: false,
      },
    };
    manager.dispatchEvent(event);

    expect(listener).toBeCalledWith(event);
    expect(listener).toBeCalledTimes(1);

    manager.removeEventListener('add', listener);

    manager.dispatchEvent(event);
    expect(listener).toBeCalledTimes(1);
  });

  it('should handle multiple listeners for the same event type', () => {
    const manager = new EventManager();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    manager.addEventListener('add', listener1);
    manager.addEventListener('add', listener2);

    const event: AddEvent = {
      type: 'add',
      call: {
        id: 1,
        payload: 'test',
        promise: new Promise(vi.fn),
        resolve: vi.fn(),
        reject: vi.fn(),
        pending: false,
      },
    };
    manager.dispatchEvent(event);

    expect(listener1).toBeCalledWith(event);
    expect(listener2).toBeCalledWith(event);
    expect(listener1).toBeCalledTimes(1);
    expect(listener2).toBeCalledTimes(1);
  });

  it('should remove all listeners when no specific listener is provided', () => {
    const manager = new EventManager();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    manager.addEventListener('add', listener1);
    manager.addEventListener('add', listener2);

    manager.removeEventListener('add');

    const event: AddEvent = {
      type: 'add',
      call: {
        id: 1,
        payload: 'test',
        promise: new Promise(vi.fn),
        resolve: vi.fn(),
        reject: vi.fn(),
        pending: false,
      },
    };
    manager.dispatchEvent(event);

    expect(listener1).not.toBeCalled();
    expect(listener2).not.toBeCalled();
  });

  it('should remove specific listener when provided', () => {
    const manager = new EventManager();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    manager.addEventListener('add', listener1);
    manager.addEventListener('add', listener2);

    manager.removeEventListener('add', listener1);

    const event: AddEvent = {
      type: 'add',
      call: {
        id: 1,
        payload: 'test',
        promise: new Promise(vi.fn),
        resolve: vi.fn(),
        reject: vi.fn(),
        pending: false,
      },
    };
    manager.dispatchEvent(event);

    expect(listener1).not.toBeCalled();
    expect(listener2).toBeCalled();
  });

  it('should remove all event listeners', () => {
    const manager = new EventManager();
    const addListener = vi.fn();

    manager.addEventListener('add', addListener);

    manager.removeAllEventListeners();

    const event: AddEvent = {
      type: 'add',
      call: {
        id: 1,
        payload: 'test',
        promise: new Promise(vi.fn),
        resolve: vi.fn(),
        reject: vi.fn(),
        pending: false,
      },
    };
    manager.dispatchEvent(event);

    expect(addListener).not.toBeCalled();
  });

  it('should handle removing non-existent listeners gracefully', () => {
    const manager = new EventManager();
    const listener = vi.fn();

    expect(() => {
      manager.removeEventListener('add', listener);
    }).not.toThrow();
  });

  it('should handle dispatching events with no listeners gracefully', () => {
    const manager = new EventManager();
    const event: AddEvent = {
      type: 'add',
      call: {
        id: 1,
        payload: 'test',
        promise: new Promise(vi.fn),
        resolve: vi.fn(),
        reject: vi.fn(),
        pending: false,
      },
    };

    expect(() => {
      manager.dispatchEvent(event);
    }).not.toThrow();
  });
});
