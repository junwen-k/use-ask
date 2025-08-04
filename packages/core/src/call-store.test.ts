import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CallStore } from './call-store';

let store: CallStore;

beforeEach(() => {
  store = new CallStore();
});

describe('CallStore', () => {
  describe('Initialization', () => {
    it('should create a new store', () => {
      expect(store).toBeInstanceOf(CallStore);
    });
  });

  describe('Create', () => {
    it('should be able to add a call and resolve it', async () => {
      const promise = store.call('payload');

      expect(promise).toBeDefined();
      expect(promise).toBeInstanceOf(Promise);

      expect(store.stack).toHaveLength(1);
      expect(store.stack[0].promise).toBe(promise);

      store.resolve(promise, 'value');

      await expect(promise).resolves.toBe('value');
    });

    it('should be able to add a call and reject it', async () => {
      const promise = store.call('payload');

      store.reject(promise, 'reason');

      await expect(promise).rejects.toThrow('reason');
    });

    it('should be able to reject with an error', async () => {
      const promise = store.call('payload');

      store.reject(promise, new Error('reason'));

      await expect(promise).rejects.toThrow('reason');
    });

    it('should maintain the correct order of promise resolution', async () => {
      const promise1 = store.call('payload1');
      const promise2 = store.call('payload2');

      store.resolve(promise2, 'value2');
      store.resolve(promise1, 'value1');

      await expect(promise2).resolves.toBe('value2');
      await expect(promise1).resolves.toBe('value1');
    });

    it('should be able add unmounting delay to a call stack', async () => {
      const settledListener = vi.fn();

      store.addEventListener('settled', settledListener);

      const delay = 100;

      const promise = store.call('payload', {
        unmountingDelay: delay,
      });
      store.resolve(promise, 'value');

      await expect(promise).resolves.toBe('value');

      // The call's pending state should be false because it has been resolved.
      expect(store.stack[0].pending).toBe(false);

      expect(settledListener).not.toBeCalled();

      await new Promise((resolve) => setTimeout(resolve, delay));

      expect(settledListener).toBeCalledTimes(1);
      expect(settledListener).toBeCalledWith({
        type: 'settled',
        call: expect.objectContaining({
          promise,
          pending: false,
        }),
      });
    });
  });

  describe('Update', () => {
    it('should be able to update a call stack', () => {
      const promise = store.call('payload');

      store.update(promise, 'updated');

      expect(store.stack[0].payload).toBe('updated');
    });

    it('should handle updating a non-existent call stack gracefully', () => {
      store.update(Promise.resolve(), 'updated');

      expect(() => store.update(Promise.resolve(), 'updated')).not.toThrow();
    });

    it('should handle resolving a non-existing call stack gracefully', () => {
      store.resolve(Promise.resolve(), 'value');

      expect(() => store.resolve(Promise.resolve(), 'value')).not.toThrow();
    });

    it('should handle rejecting a non-existing call stack gracefully', () => {
      store.reject(Promise.resolve(), 'reason');

      expect(() => store.reject(Promise.resolve(), 'reason')).not.toThrow();
    });
  });

  describe('Event', () => {
    it('should dispatch add events when adding a call stack', () => {
      const addListener = vi.fn();

      store.addEventListener('add', addListener);

      const promise = store.call('payload');

      expect(addListener).toBeCalledTimes(1);
      expect(addListener).toBeCalledWith({
        type: 'add',
        call: expect.objectContaining({
          promise,
        }),
      });
    });

    it('should dispatch update events when updating a call stack', () => {
      const updateListener = vi.fn();

      store.addEventListener('update', updateListener);

      const promise = store.call('payload');
      store.update(promise, 'updated');

      expect(updateListener).toBeCalledTimes(1);
      expect(updateListener).toBeCalledWith({
        type: 'update',
        call: expect.objectContaining({
          promise,
          payload: 'updated',
        }),
      });
    });

    it('should dispatch resolve events when resolving a call stack', async () => {
      const resolveListener = vi.fn();

      store.addEventListener('resolve', resolveListener);

      const promise = store.call('payload');
      store.resolve(promise, 'value');

      await expect(promise).resolves.toBe('value');

      expect(resolveListener).toBeCalledTimes(1);
      expect(resolveListener).toBeCalledWith({
        type: 'resolve',
        call: expect.objectContaining({
          promise,
        }),
      });
    });

    it('should dispatch reject events when rejecting a call stack', async () => {
      const rejectListener = vi.fn();

      store.addEventListener('reject', rejectListener);

      const promise = store.call('payload');
      store.reject(promise, 'reason');

      await expect(promise).rejects.toThrow('reason');

      expect(rejectListener).toBeCalledTimes(1);
      expect(rejectListener).toBeCalledWith({
        type: 'reject',
        call: expect.objectContaining({
          promise,
        }),
      });
    });

    it('should be able to add and remove event listeners', () => {
      const addListener = vi.fn();

      store.addEventListener('add', addListener);
      store.call('payload');
      expect(addListener).toBeCalledTimes(1);

      store.removeEventListener('add', addListener);
      store.call('payload');
      expect(addListener).toBeCalledTimes(1);
    });

    it('should be able to remove all event listeners', () => {
      const addListener = vi.fn();
      const updateListener = vi.fn();

      store.addEventListener('add', addListener);
      store.addEventListener('update', updateListener);

      store.removeEventListener('add', addListener);
      store.removeEventListener('update', updateListener);

      store.call('payload');
      expect(addListener).not.toBeCalled();

      const promise = store.call('payload');
      store.update(promise, 'updated');
      expect(updateListener).not.toBeCalled();
    });
  });
});
