import { describe, expect, it, vi } from 'vitest';
import { type ChangeEvent, EventManager } from './event-manager';

describe('EventManager', () => {
  it('should create a new event manager', () => {
    const manager = new EventManager();
    expect(manager).toBeInstanceOf(EventManager);
  });

  it('should add and remove event listeners', () => {
    const manager = new EventManager();
    const listener = vi.fn();

    manager.addEventListener('change', listener);

    const event: ChangeEvent = {
      type: 'change',
      added: [],
      changed: [],
      deleted: [],
    };
    manager.dispatchEvent(event);

    expect(listener).toBeCalledWith(event);
    expect(listener).toBeCalledTimes(1);

    manager.removeEventListener('change', listener);

    manager.dispatchEvent(event);
    expect(listener).toBeCalledTimes(1);
  });

  it('should handle multiple listeners for the same event type', () => {
    const manager = new EventManager();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    manager.addEventListener('change', listener1);
    manager.addEventListener('change', listener2);

    const event: ChangeEvent = {
      type: 'change',
      added: [],
      changed: [],
      deleted: [],
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

    manager.addEventListener('change', listener1);
    manager.addEventListener('change', listener2);

    manager.removeEventListener('change');

    const event: ChangeEvent = {
      type: 'change',
      added: [],
      changed: [],
      deleted: [],
    };
    manager.dispatchEvent(event);

    expect(listener1).not.toBeCalled();
    expect(listener2).not.toBeCalled();
  });

  it('should remove specific listener when provided', () => {
    const manager = new EventManager();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    manager.addEventListener('change', listener1);
    manager.addEventListener('change', listener2);

    manager.removeEventListener('change', listener1);

    const event: ChangeEvent = {
      type: 'change',
      added: [],
      changed: [],
      deleted: [],
    };
    manager.dispatchEvent(event);

    expect(listener1).not.toBeCalled();
    expect(listener2).toBeCalled();
  });

  it('should remove all event listeners', () => {
    const manager = new EventManager();
    const changeListener = vi.fn();

    manager.addEventListener('change', changeListener);

    manager.removeAllEventListeners();

    const event: ChangeEvent = {
      type: 'change',
      added: [],
      changed: [],
      deleted: [],
    };
    manager.dispatchEvent(event);

    expect(changeListener).not.toBeCalled();
  });

  it('should handle removing non-existent listeners gracefully', () => {
    const manager = new EventManager();
    const listener = vi.fn();

    expect(() => {
      manager.removeEventListener('change', listener);
    }).not.toThrow();
  });

  it('should handle dispatching events with no listeners gracefully', () => {
    const manager = new EventManager();
    const event: ChangeEvent = {
      type: 'change',
      added: [],
      changed: [],
      deleted: [],
    };

    expect(() => {
      manager.dispatchEvent(event);
    }).not.toThrow();
  });
});
