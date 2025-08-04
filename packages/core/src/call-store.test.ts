import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CallStore } from './call-store';

describe('CallStore', () => {
  let store: CallStore;

  beforeEach(() => {
    store = new CallStore();
  });

  describe('when creating a new store', () => {
    it('should initialize with an empty call stack', () => {
      expect(store.stack).toHaveLength(0);
    });
  });

  describe('when creating a call', () => {
    it('should return a promise that can be resolved', async () => {
      const promise = store.call('test-payload');

      expect(promise).toBeInstanceOf(Promise);

      store.resolve(promise, 'resolved-value');

      await expect(promise).resolves.toBe('resolved-value');
    });

    it('should return a promise that can be rejected', async () => {
      const promise = store.call('test-payload');

      store.reject(promise, 'error-message');

      await expect(promise).rejects.toBe('error-message');
    });

    it('should return a promise that can be rejected with an Error object', async () => {
      const promise = store.call('test-payload');
      const error = new Error('test error');

      store.reject(promise, error);

      await expect(promise).rejects.toThrow('test error');
    });

    it('should add the call to the stack when created', () => {
      const promise = store.call('test-payload');

      expect(store.stack).toHaveLength(1);
      expect(store.stack[0].promise).toBe(promise);
      expect(store.stack[0].payload).toBe('test-payload');
      expect(store.stack[0].pending).toBe(true);
    });

    it('should maintain call order in the stack', () => {
      const promise1 = store.call('first-payload');
      const promise2 = store.call('second-payload');

      expect(store.stack).toHaveLength(2);
      expect(store.stack[0].promise).toBe(promise1);
      expect(store.stack[1].promise).toBe(promise2);
    });

    it('should resolve calls in the correct order regardless of resolution order', async () => {
      const promise1 = store.call('first-payload');
      const promise2 = store.call('second-payload');

      // Resolve in reverse order
      store.resolve(promise2, 'second-value');
      store.resolve(promise1, 'first-value');

      await expect(promise1).resolves.toBe('first-value');
      await expect(promise2).resolves.toBe('second-value');
    });
  });

  describe('when creating a call with unmounting delay', () => {
    it('should delay the settled event by the specified time', async () => {
      const settledListener = vi.fn();
      store.addEventListener('settled', settledListener);

      const delay = 50;
      const promise = store.call('test-payload', { unmountingDelay: delay });

      store.resolve(promise, 'value');
      await expect(promise).resolves.toBe('value');

      // Should not be called immediately
      expect(settledListener).not.toHaveBeenCalled();

      // Wait for the delay
      await new Promise((resolve) => setTimeout(resolve, delay + 10));

      expect(settledListener).toHaveBeenCalledTimes(1);
      expect(settledListener).toHaveBeenCalledWith({
        type: 'settled',
        call: expect.objectContaining({
          promise,
          pending: false,
        }),
      });
    });

    it('should mark the call as not pending after resolution', async () => {
      const promise = store.call('test-payload', { unmountingDelay: 100 });

      store.resolve(promise, 'value');
      await expect(promise).resolves.toBe('value');

      expect(store.stack[0].pending).toBe(false);
    });
  });

  describe('when updating a call', () => {
    it('should update the payload of an existing call', () => {
      const promise = store.call('initial-payload');

      store.update(promise, 'updated-payload');

      expect(store.stack[0].payload).toBe('updated-payload');
    });

    it('should return the promise when updating an existing call', () => {
      const promise = store.call('initial-payload');

      const result = store.update(promise, 'updated-payload');

      expect(result).toBe(promise);
    });

    it('should handle updating a non-existent call gracefully', () => {
      const nonExistentPromise = Promise.resolve('value');

      expect(() => {
        store.update(nonExistentPromise, 'updated-payload');
      }).not.toThrow();
    });

    it('should not modify the stack when updating a non-existent call', () => {
      const initialLength = store.stack.length;
      const nonExistentPromise = Promise.resolve('value');

      store.update(nonExistentPromise, 'updated-payload');

      expect(store.stack.length).toBe(initialLength);
    });
  });

  describe('when resolving a call', () => {
    it('should handle resolving a non-existent call gracefully', () => {
      const nonExistentPromise = Promise.resolve('value');

      expect(() => {
        store.resolve(nonExistentPromise, 'data');
      }).not.toThrow();
    });

    it('should not modify the stack when resolving a non-existent call', () => {
      const initialLength = store.stack.length;
      const nonExistentPromise = Promise.resolve('value');

      store.resolve(nonExistentPromise, 'data');

      expect(store.stack.length).toBe(initialLength);
    });
  });

  describe('when rejecting a call', () => {
    it('should handle rejecting a non-existent call gracefully', () => {
      const nonExistentPromise = Promise.resolve('value');

      expect(() => {
        store.reject(nonExistentPromise, 'error');
      }).not.toThrow();
    });

    it('should not modify the stack when rejecting a non-existent call', () => {
      const initialLength = store.stack.length;
      const nonExistentPromise = Promise.resolve('value');

      store.reject(nonExistentPromise, 'error');

      expect(store.stack.length).toBe(initialLength);
    });
  });

  describe('event system', () => {
    describe('when adding a call', () => {
      it('should dispatch an add event', () => {
        const addListener = vi.fn();
        store.addEventListener('add', addListener);

        const promise = store.call('test-payload');

        expect(addListener).toHaveBeenCalledTimes(1);
        expect(addListener).toHaveBeenCalledWith({
          type: 'add',
          call: expect.objectContaining({
            promise,
            payload: 'test-payload',
            pending: true,
          }),
        });
      });
    });

    describe('when updating a call', () => {
      it('should dispatch an update event', () => {
        const updateListener = vi.fn();
        store.addEventListener('update', updateListener);

        const promise = store.call('initial-payload');
        store.update(promise, 'updated-payload');

        expect(updateListener).toHaveBeenCalledTimes(1);
        expect(updateListener).toHaveBeenCalledWith({
          type: 'update',
          call: expect.objectContaining({
            promise,
            payload: 'updated-payload',
          }),
        });
      });
    });

    describe('when resolving a call', () => {
      it('should dispatch a resolve event', async () => {
        const resolveListener = vi.fn();
        store.addEventListener('resolve', resolveListener);

        const promise = store.call('test-payload');
        store.resolve(promise, 'resolved-value');

        await expect(promise).resolves.toBe('resolved-value');

        expect(resolveListener).toHaveBeenCalledTimes(1);
        expect(resolveListener).toHaveBeenCalledWith({
          type: 'resolve',
          call: expect.objectContaining({
            promise,
          }),
        });
      });
    });

    describe('when rejecting a call', () => {
      it('should dispatch a reject event', async () => {
        const rejectListener = vi.fn();
        store.addEventListener('reject', rejectListener);

        const promise = store.call('test-payload');
        store.reject(promise, 'error-message');

        await expect(promise).rejects.toBe('error-message');

        expect(rejectListener).toHaveBeenCalledTimes(1);
        expect(rejectListener).toHaveBeenCalledWith({
          type: 'reject',
          call: expect.objectContaining({
            promise,
          }),
        });
      });
    });

    describe('event listener management', () => {
      it('should allow adding and removing specific event listeners', () => {
        const addListener = vi.fn();

        store.addEventListener('add', addListener);
        store.call('first-payload');
        expect(addListener).toHaveBeenCalledTimes(1);

        store.removeEventListener('add', addListener);
        store.call('second-payload');
        expect(addListener).toHaveBeenCalledTimes(1); // Should not be called again
      });

      it('should allow removing all listeners for a specific event type', () => {
        const addListener1 = vi.fn();
        const addListener2 = vi.fn();

        store.addEventListener('add', addListener1);
        store.addEventListener('add', addListener2);

        store.removeEventListener('add'); // Remove all add listeners

        store.call('test-payload');

        expect(addListener1).not.toHaveBeenCalled();
        expect(addListener2).not.toHaveBeenCalled();
      });
    });
  });

  describe('when configured with default unmounting delay', () => {
    it('should use the configured delay for all calls', async () => {
      const storeWithDelay = new CallStore({ unmountingDelay: 50 });
      const settledListener = vi.fn();
      storeWithDelay.addEventListener('settled', settledListener);

      const promise = storeWithDelay.call('test-payload');
      storeWithDelay.resolve(promise, 'value');
      await expect(promise).resolves.toBe('value');

      expect(settledListener).not.toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(settledListener).toHaveBeenCalledTimes(1);
    });

    it('should allow overriding the default delay per call', async () => {
      const storeWithDelay = new CallStore({ unmountingDelay: 100 });
      const settledListener = vi.fn();
      storeWithDelay.addEventListener('settled', settledListener);

      const promise = storeWithDelay.call('test-payload', { unmountingDelay: 50 });
      storeWithDelay.resolve(promise, 'value');
      await expect(promise).resolves.toBe('value');

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(settledListener).toHaveBeenCalledTimes(1);
    });
  });
});
