import { describe, expect, it, vi } from 'vitest';
import {
  type AddEvent,
  type ChangeEvent,
  type DeleteEvent,
  EventManager,
} from './event-manager';

describe('EventManager', () => {
  it('should create a new event manager', () => {
    const manager = new EventManager();
    expect(manager).toBeInstanceOf(EventManager);
  });

  it('should add and remove event listeners', () => {
    const manager = new EventManager();
    const listener = vi.fn();

    manager.addEventListener('change', listener);

    const event: ChangeEvent = { type: 'change' };
    manager.dispatch(event);

    expect(listener).toHaveBeenCalledWith(event);
    expect(listener).toHaveBeenCalledTimes(1);

    manager.removeEventListener('change', listener);

    manager.dispatch(event);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple listeners for the same event type', () => {
    const manager = new EventManager();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    manager.addEventListener('change', listener1);
    manager.addEventListener('change', listener2);

    const event: ChangeEvent = { type: 'change' };
    manager.dispatch(event);

    expect(listener1).toHaveBeenCalledWith(event);
    expect(listener2).toHaveBeenCalledWith(event);
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should handle different event types', () => {
    const manager = new EventManager();
    const changeListener = vi.fn();
    const addListener = vi.fn();
    const deleteListener = vi.fn();

    manager.addEventListener('change', changeListener);
    manager.addEventListener('add', addListener);
    manager.addEventListener('delete', deleteListener);

    const changeEvent: ChangeEvent = { type: 'change' };
    const addEvent: AddEvent = { type: 'add', id: 1, payload: 'test' };
    const deleteEvent: DeleteEvent = {
      type: 'delete',
      id: 1,
      reason: 'cancelled',
    };

    manager.dispatch(changeEvent);
    manager.dispatch(addEvent);
    manager.dispatch(deleteEvent);

    expect(changeListener).toHaveBeenCalledWith(changeEvent);
    expect(addListener).toHaveBeenCalledWith(addEvent);
    expect(deleteListener).toHaveBeenCalledWith(deleteEvent);
  });

  it('should remove all listeners when no specific listener is provided', () => {
    const manager = new EventManager();
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    manager.addEventListener('change', listener1);
    manager.addEventListener('change', listener2);

    manager.removeEventListener('change');

    const event: ChangeEvent = { type: 'change' };
    manager.dispatch(event);

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).not.toHaveBeenCalled();
  });

  it('should remove all event listeners', () => {
    const manager = new EventManager();
    const changeListener = vi.fn();
    const addListener = vi.fn();

    manager.addEventListener('change', changeListener);
    manager.addEventListener('add', addListener);

    manager.removeAllEventListeners();

    const changeEvent: ChangeEvent = { type: 'change' };
    const addEvent: AddEvent = { type: 'add', id: 1, payload: 'test' };

    manager.dispatch(changeEvent);
    manager.dispatch(addEvent);

    expect(changeListener).not.toHaveBeenCalled();
    expect(addListener).not.toHaveBeenCalled();
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
    const event: ChangeEvent = { type: 'change' };

    expect(() => {
      manager.dispatch(event);
    }).not.toThrow();
  });
});
