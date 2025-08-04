import { beforeEach, describe, expect, it } from 'vitest';

import { SingletonCallStore } from './singleton-call-store';

let store: SingletonCallStore;

beforeEach(() => {
  store = new SingletonCallStore();
});

describe('SingletonCallStore', () => {
  describe('Initialization', () => {
    it('should create a new store', () => {
      expect(store).toBeInstanceOf(SingletonCallStore);
      expect(store.current).toBeNull();
    });
  });

  describe('Create', () => {
    it('should be able to add a call', () => {
      const promise = store.call('payload');

      expect(promise).toBeDefined();
      expect(promise).toBeInstanceOf(Promise);
      expect(store.current).toBe(promise);
    });

    it('should update existing call instead of creating new one', () => {
      const promise1 = store.call('payload1');
      const promise2 = store.call('payload2');

      expect(promise2).toBe(promise1);
      expect(store.current).toBe(promise1);
    });
  });

  describe('Update', () => {
    it('should be able to update current call', () => {
      const promise = store.call('payload');
      const result = store.update('updated');

      expect(result).toBeDefined();
      expect(store.current).toBe(promise);
    });

    it('should handle updating when no current call exists', () => {
      const result = store.update('payload');

      expect(result).toBeUndefined();
      expect(store.current).toBeNull();
    });
  });

  describe('Resolve', () => {
    it('should resolve the current call', async () => {
      const promise = store.call('payload');
      store.resolve('data');

      const result = await promise;
      expect(result).toBe('data');
      expect(store.current).toBe(promise);
    });

    it('should do nothing when no current call exists', () => {
      expect(() => store.resolve('data')).not.toThrow();
      expect(store.current).toBeNull();
    });
  });

  describe('Reject', () => {
    it('should reject the current call', async () => {
      const promise = store.call('payload');
      store.reject('error');

      await expect(promise).rejects.toBe('error');
      expect(store.current).toBe(promise);
    });

    it('should do nothing when no current call exists', () => {
      expect(() => store.reject('error')).not.toThrow();
      expect(store.current).toBeNull();
    });
  });

  describe('Events', () => {
    it('should forward event listeners to internal call store', () => {
      const listener = () => {};
      expect(() => {
        store.addEventListener('add', listener);
        store.removeEventListener('add', listener);
      }).not.toThrow();
    });
  });
});
