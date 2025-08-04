import { describe, expect, it, vi } from 'vitest';

import { type AddEvent, EventManager } from './event-manager';

describe('EventManager', () => {
  describe('when creating a new event manager', () => {
    it('should initialize successfully', () => {
      const manager = new EventManager();
      expect(manager).toBeInstanceOf(EventManager);
    });
  });

  describe('when adding event listeners', () => {
    it('should register a listener for a specific event type', () => {
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

      expect(listener).toHaveBeenCalledWith(event);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple listeners for the same event type', () => {
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

      expect(listener1).toHaveBeenCalledWith(event);
      expect(listener2).toHaveBeenCalledWith(event);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('when removing event listeners', () => {
    it('should remove a specific listener when provided', () => {
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

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith(event);
    });

    it('should remove all listeners for an event type when no specific listener is provided', () => {
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

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should handle removing non-existent listeners gracefully', () => {
      const manager = new EventManager();
      const listener = vi.fn();

      expect(() => {
        manager.removeEventListener('add', listener);
      }).not.toThrow();
    });

    it('should handle removing listeners for non-existent event types gracefully', () => {
      const manager = new EventManager();
      const listener = vi.fn();

      expect(() => {
        manager.removeEventListener('nonexistent' as never, listener);
      }).not.toThrow();
    });
  });

  describe('when removing all event listeners', () => {
    it('should clear all registered listeners', () => {
      const manager = new EventManager();
      const addListener = vi.fn();
      const updateListener = vi.fn();

      manager.addEventListener('add', addListener);
      manager.addEventListener('update', updateListener);

      manager.removeAllEventListeners();

      const addEvent: AddEvent = {
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

      manager.dispatchEvent(addEvent);

      expect(addListener).not.toHaveBeenCalled();
      expect(updateListener).not.toHaveBeenCalled();
    });
  });

  describe('when dispatching events', () => {
    it('should call all registered listeners for the event type', () => {
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

      expect(listener1).toHaveBeenCalledWith(event);
      expect(listener2).toHaveBeenCalledWith(event);
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

  describe('event listener isolation', () => {
    it('should not call listeners for different event types', () => {
      const manager = new EventManager();
      const addListener = vi.fn();
      const updateListener = vi.fn();

      manager.addEventListener('add', addListener);
      manager.addEventListener('update', updateListener);

      const addEvent: AddEvent = {
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

      manager.dispatchEvent(addEvent);

      expect(addListener).toHaveBeenCalledWith(addEvent);
      expect(updateListener).not.toHaveBeenCalled();
    });
  });
});
