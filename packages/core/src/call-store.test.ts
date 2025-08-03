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
    it('should be able to add a call stack and resolve it', async () => {
      const callStack = store.call('payload');

      expect(callStack).toBeDefined();
      expect(callStack.id).toBeDefined();
      expect(callStack.payload).toBe('payload');
      expect(callStack.safe).toBe(false);
      expect(callStack.promise).toBeInstanceOf(Promise);
      expect(callStack.resolve).toBeDefined();
      expect(callStack.reject).toBeDefined();

      expect(store.callStacks).toHaveLength(1);
      expect(store.callStacks[0]).toBe(callStack);

      callStack.resolve('value');

      await expect(callStack.promise).resolves.toBe('value');
    });

    it('should be able to add a safe call stack and resolve it', async () => {
      const callStack = store.callSafe('payload');

      expect(callStack).toBeDefined();
      expect(callStack.id).toBeDefined();
      expect(callStack.payload).toBe('payload');
      expect(callStack.safe).toBe(true);
      expect(callStack.promise).toBeInstanceOf(Promise);
      expect(callStack.resolve).toBeDefined();
      expect(callStack.reject).toBeDefined();

      expect(store.callStacks).toHaveLength(1);
      expect(store.callStacks[0]).toBe(callStack);

      callStack.resolve('value');

      await expect(callStack.promise).resolves.toEqual({ ok: true, data: 'value' });
    });

    it('should be able to add a call stack and reject it', async () => {
      const callStack = store.call('payload');

      callStack.reject('reason');

      await expect(callStack.promise).rejects.toThrow('reason');
    });

    it('should be able to add a safe call stack and reject without throwing', async () => {
      const callStack = store.callSafe('payload');

      callStack.reject('reason');

      await expect(callStack.promise).resolves.toEqual({
        ok: false,
        reason: 'reason',
      });
    });

    it('should be able to reject with an error', async () => {
      const callStack = store.call('payload');

      callStack.reject(new Error('reason'));

      await expect(callStack.promise).rejects.toThrow('reason');
    });

    it('should maintain the correct order of promise resolution', async () => {
      const callStack1 = store.call('payload1');
      const callStack2 = store.call('payload2');

      callStack2.resolve('value2');
      callStack1.resolve('value1');

      await expect(callStack2.promise).resolves.toBe('value2');
      await expect(callStack1.promise).resolves.toBe('value1');
    });

    it('should be able add unmounting delay to a call stack', async () => {
      const settledListener = vi.fn();

      store.addEventListener('settled', settledListener);

      const callStack = store.call('payload', {
        unmountingDelay: 100,
      });
      callStack.resolve('value');

      await expect(callStack.promise).resolves.toBe('value');

      // The call stack's pending state should be false because it has been resolved.
      expect(store.get(callStack.id)?.pending).toBe(false);

      expect(settledListener).not.toBeCalled();

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(settledListener).toBeCalledTimes(1);
      expect(settledListener).toBeCalledWith({
        type: 'settled',
        callStack: {
          ...callStack,
          pending: false,
        },
      });
    });
  });

  describe('Read', () => {
    it('should be able to retrieve a call stack by id', () => {
      const callStack = store.call('payload');

      expect(store.get(callStack.id)).toBe(callStack);
    });

    it('should return undefined if the call stack is not found by id', () => {
      expect(store.get(0)).toBeUndefined();
    });

    it('should be able to retrieve all call stacks', () => {
      const callStack1 = store.call('payload1');
      const callStack2 = store.call('payload2');

      expect(store.getAll()).toEqual([callStack1, callStack2]);
    });

    it('should return an empty array if there are no call stacks', () => {
      expect(store.getAll()).toEqual([]);
    });
  });

  describe('Update', () => {
    it('should be able to update a call stack', () => {
      const callStack = store.call('payload');

      store.update(callStack.id, 'updated');

      const updatedCallStack = store.get(callStack.id);

      expect(updatedCallStack).toBeDefined();
      expect(updatedCallStack?.payload).toBe('updated');
    });

    it('should handle updating a non-existent call stack gracefully', () => {
      store.update(0, 'updated');

      expect(() => store.update(0, 'updated')).not.toThrow();
    });
  });

  describe('Delete', () => {
    it('should be able to delete a call stack by id', () => {
      const callStack = store.call('payload');

      store.delete(callStack.id);

      expect(store.callStacks).toHaveLength(0);
      expect(store.get(callStack.id)).toBeUndefined();
    });

    it('should handle deleting a non-existent call stack gracefully', () => {
      expect(() => store.delete(0)).not.toThrow();
    });

    it('should clear all call stacks', () => {
      const callStack1 = store.call('payload');
      const callStack2 = store.call('payload');

      expect(store.callStacks).toHaveLength(2);
      expect(store.get(callStack1.id)).toBeDefined();
      expect(store.get(callStack2.id)).toBeDefined();

      store.clear();

      expect(store.callStacks).toHaveLength(0);
      expect(store.get(callStack1.id)).toBeUndefined();
      expect(store.get(callStack2.id)).toBeUndefined();
    });
  });

  describe('Event', () => {
    it('should dispatch add events when adding a call stack', () => {
      const addListener = vi.fn();

      store.addEventListener('add', addListener);

      const callStack = store.call('payload');

      expect(addListener).toBeCalledTimes(1);
      expect(addListener).toBeCalledWith({
        type: 'add',
        callStack,
      });
    });

    it('should dispatch update events when updating a call stack', () => {
      const updateListener = vi.fn();

      store.addEventListener('update', updateListener);

      const callStack = store.call('payload');
      store.update(callStack.id, 'updated');

      expect(updateListener).toBeCalledTimes(1);
      expect(updateListener).toBeCalledWith({
        type: 'update',
        callStack: expect.objectContaining({
          id: callStack.id,
          payload: 'updated',
        }),
      });
    });

    it('should dispatch resolve events when resolving a call stack', async () => {
      const resolveListener = vi.fn();

      store.addEventListener('resolve', resolveListener);

      const callStack = store.call('payload');
      callStack.resolve('value');

      await expect(callStack.promise).resolves.toBe('value');

      expect(resolveListener).toBeCalledTimes(1);
      expect(resolveListener).toBeCalledWith({
        type: 'resolve',
        callStack,
      });
    });

    it('should dispatch reject events when rejecting a call stack', async () => {
      const rejectListener = vi.fn();

      store.addEventListener('reject', rejectListener);

      const callStack = store.call('payload');
      callStack.reject('reason');

      await expect(callStack.promise).rejects.toThrow('reason');

      expect(rejectListener).toBeCalledTimes(1);
      expect(rejectListener).toBeCalledWith({
        type: 'reject',
        callStack,
      });
    });

    it('should dispatch delete events when deleting a call stack', () => {
      const deleteListener = vi.fn();

      store.addEventListener('delete', deleteListener);

      const callStack = store.call('payload');
      store.delete(callStack.id);

      expect(deleteListener).toBeCalledTimes(1);
      expect(deleteListener).toBeCalledWith({
        type: 'delete',
        callStack,
      });
    });

    it('should dispatch clear events when clearing all call stacks', () => {
      const clearListener = vi.fn();

      store.addEventListener('clear', clearListener);

      const callStack1 = store.call('payload1');
      const callStack2 = store.call('payload2');
      store.clear();

      expect(clearListener).toBeCalledTimes(1);
      expect(clearListener).toBeCalledWith({
        type: 'clear',
        callStacks: [callStack1, callStack2],
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

      const callStack = store.call('payload');
      store.update(callStack.id, 'updated');
      expect(updateListener).not.toBeCalled();
    });
  });
});
