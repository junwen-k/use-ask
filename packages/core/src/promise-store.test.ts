import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PromiseStore } from './promise-store';

// We polyfill `Promise.withResolvers` because it is not available in Node environment.
import '@ungap/with-resolvers';

let store: PromiseStore;

beforeEach(() => {
  store = new PromiseStore();
});

describe('PromiseStore', () => {
  describe('Initialization', () => {
    it('should create a new store', () => {
      expect(store).toBeInstanceOf(PromiseStore);
    });
  });

  describe('Create', () => {
    it('should be able to add a promise entry and resolve it', async () => {
      const entry = store.add('payload');

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.payload).toBe('payload');
      expect(entry.safe).toBe(false);
      expect(entry.promise).toBeInstanceOf(Promise);
      expect(entry.resolve).toBeDefined();
      expect(entry.reject).toBeDefined();

      expect(store.entries).toHaveLength(1);
      expect(store.entries[0]).toBe(entry);

      entry.resolve('value');

      await expect(entry.promise).resolves.toBe('value');
    });

    it('should be able to add a safe promise entry and resolve it', async () => {
      const entry = store.addSafe('payload');

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.payload).toBe('payload');
      expect(entry.safe).toBe(true);
      expect(entry.promise).toBeInstanceOf(Promise);
      expect(entry.resolve).toBeDefined();
      expect(entry.reject).toBeDefined();

      expect(store.entries).toHaveLength(1);
      expect(store.entries[0]).toBe(entry);

      entry.resolve('value');

      await expect(entry.promise).resolves.toEqual({ ok: true, data: 'value' });
    });

    it('should be able to add a promise entry and reject it', async () => {
      const entry = store.add('payload');

      entry.reject('reason');

      await expect(entry.promise).rejects.toThrow('reason');
    });

    it('should be able to add a safe promise entry and reject without throwing', async () => {
      const entry = store.addSafe('payload');

      entry.reject('reason');

      await expect(entry.promise).resolves.toEqual({
        ok: false,
        reason: 'reason',
      });
    });

    it('should be able to reject with an error', async () => {
      const entry = store.add('payload');

      entry.reject(new Error('reason'));

      await expect(entry.promise).rejects.toThrow('reason');
    });

    it('should maintain the correct order of promise resolution', async () => {
      const entry1 = store.add('payload1');
      const entry2 = store.add('payload2');

      entry2.resolve('value2');
      entry1.resolve('value1');

      await expect(entry2.promise).resolves.toBe('value2');
      await expect(entry1.promise).resolves.toBe('value1');
    });
  });

  describe('Read', () => {
    it('should be able to retrieve a promise entry by id', () => {
      const entry = store.add('payload');

      expect(store.get(entry.id)).toBe(entry);
    });

    it('should return undefined if the promise entry is not found by id', () => {
      expect(store.get(0)).toBeUndefined();
    });

    it('should be able to retrieve all promise entries', () => {
      const entry1 = store.add('payload1');
      const entry2 = store.add('payload2');

      expect(store.getAll()).toEqual([entry1, entry2]);
    });

    it('should return an empty array if there are no promise entries', () => {
      expect(store.getAll()).toEqual([]);
    });
  });

  describe('Update', () => {
    it('should be able to update a promise entry', () => {
      const entry = store.add('payload');

      store.update(entry.id, 'updated');

      const updatedEntry = store.get(entry.id);

      expect(updatedEntry).toBeDefined();
      expect(updatedEntry?.payload).toBe('updated');
    });

    it('should handle updating a non-existent promise entry gracefully', () => {
      store.update(0, 'updated');

      expect(() => store.update(0, 'updated')).not.toThrow();
    });
  });

  describe('Delete', () => {
    it('should be able to delete a promise entry by id', () => {
      const entry = store.add('payload');

      store.delete(entry.id);

      expect(store.entries).toHaveLength(0);
      expect(store.get(entry.id)).toBeUndefined();
    });

    it('should handle deleting a non-existent promise entry gracefully', () => {
      expect(() => store.delete(0)).not.toThrow();
    });

    it('should clear all promise entries', () => {
      const entry1 = store.add('payload');
      const entry2 = store.add('payload');

      expect(store.entries).toHaveLength(2);
      expect(store.get(entry1.id)).toBeDefined();
      expect(store.get(entry2.id)).toBeDefined();

      store.clear();

      expect(store.entries).toHaveLength(0);
      expect(store.get(entry1.id)).toBeUndefined();
      expect(store.get(entry2.id)).toBeUndefined();
    });
  });

  describe('Event', () => {
    it('should dispatch change events when adding a promise entry', () => {
      const changeListener = vi.fn();

      store.addEventListener('change', changeListener);

      store.add('payload');

      expect(changeListener).toBeCalledTimes(1);
      expect(changeListener).toBeCalledWith({
        type: 'change',
        added: expect.arrayContaining([
          expect.objectContaining({
            payload: 'payload',
            safe: false,
          }),
        ]),
        changed: [],
        deleted: [],
      });

      const event = changeListener.mock.calls[0][0];
      expect(event.added[0].payload).toBe('payload');
    });

    it('should dispatch change events when updating a promise entry', () => {
      const changeListener = vi.fn();

      store.addEventListener('change', changeListener);

      const entry = store.add('payload');
      store.update(entry.id, 'updated');

      expect(changeListener).toBeCalledTimes(2);

      expect(changeListener).nthCalledWith(1, {
        type: 'change',
        added: expect.arrayContaining([
          expect.objectContaining({
            payload: 'payload',
          }),
        ]),
        changed: [],
        deleted: [],
      });

      expect(changeListener).nthCalledWith(2, {
        type: 'change',
        added: [],
        changed: expect.arrayContaining([
          expect.objectContaining({
            payload: 'updated',
          }),
        ]),
        deleted: [],
      });

      const addedEvent = changeListener.mock.calls[0][0];
      expect(addedEvent.added[0].payload).toBe('payload');

      const changedEvent = changeListener.mock.calls[1][0];
      expect(changedEvent.changed[0].payload).toBe('updated');
    });

    it('should dispatch change events when deleting a promise entry', () => {
      const changeListener = vi.fn();

      store.addEventListener('change', changeListener);

      const entry = store.add('payload');
      store.delete(entry.id);

      expect(changeListener).toBeCalledTimes(2);

      expect(changeListener).nthCalledWith(1, {
        type: 'change',
        added: expect.arrayContaining([
          expect.objectContaining({
            payload: 'payload',
          }),
        ]),
        changed: [],
        deleted: [],
      });

      expect(changeListener).nthCalledWith(2, {
        type: 'change',
        added: [],
        changed: [],
        deleted: expect.arrayContaining([
          expect.objectContaining({
            payload: 'payload',
          }),
        ]),
      });

      const deletedEvent = changeListener.mock.calls[1][0];
      expect(deletedEvent.deleted[0].id).toBe(entry.id);
    });

    it('should be able to add and remove event listeners', () => {
      const changeListener = vi.fn();

      store.addEventListener('change', changeListener);

      store.add('payload');

      expect(changeListener).toBeCalledTimes(1);

      store.removeEventListener('change', changeListener);

      store.add('payload');

      expect(changeListener).toBeCalledTimes(1);
    });
  });
});
