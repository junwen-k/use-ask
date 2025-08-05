import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SingletonCallStore } from './singleton-call-store';

describe('SingletonCallStore', () => {
  let store: SingletonCallStore;

  beforeEach(() => {
    store = new SingletonCallStore();
  });

  describe('when creating a new store', () => {
    it('should initialize with no current call', () => {
      expect(store.current).toBeNull();
    });
  });

  describe('when making the first call', () => {
    it('should return a promise and set it as current', () => {
      const promise = store.call('first-payload');

      expect(promise).toBeInstanceOf(Promise);
      expect(store.current).toBeDefined();
      expect(store.current?.promise).toBe(promise);
      expect(store.current?.payload).toBe('first-payload');
    });
  });

  describe('when making subsequent calls', () => {
    it('should return the same promise and update the payload', () => {
      const promise1 = store.call('first-payload');
      const promise2 = store.call('second-payload');

      expect(promise2).toBe(promise1);
      expect(store.current?.promise).toBe(promise1);
      expect(store.current?.payload).toBe('second-payload');
    });

    it('should maintain the same promise reference across multiple calls', () => {
      const promise1 = store.call('first-payload');
      const promise2 = store.call('second-payload');
      const promise3 = store.call('third-payload');

      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);
      expect(store.current?.promise).toBe(promise1);
      expect(store.current?.payload).toBe('third-payload');
    });
  });

  describe('when updating the current call', () => {
    it('should update the payload when a current call exists', () => {
      const promise = store.call('initial-payload');
      const result = store.update('updated-payload');

      expect(result).toBe(promise);
      expect(store.current?.promise).toBe(promise);
      expect(store.current?.payload).toBe('updated-payload');
    });

    it('should return undefined when no current call exists', () => {
      const result = store.update('payload');

      expect(result).toBeUndefined();
      expect(store.current).toBeNull();
    });

    it('should not create a new call when updating without an existing call', () => {
      store.update('payload');

      expect(store.current).toBeNull();
    });
  });

  describe('when resolving the current call', () => {
    it('should resolve the current promise with the provided data', async () => {
      const promise = store.call('test-payload');
      store.resolve('resolved-data');

      const result = await promise;
      expect(result).toBe('resolved-data');
      expect(store.current).toBeNull();
    });

    it('should do nothing when no current call exists', () => {
      expect(() => store.resolve('data')).not.toThrow();
      expect(store.current).toBeNull();
    });

    it('should clear the current call reference after resolution', async () => {
      const promise = store.call('test-payload');
      store.resolve('data');
      await promise;

      expect(store.current).toBeNull();
    });
  });

  describe('when rejecting the current call', () => {
    it('should reject the current promise with the provided reason', async () => {
      const promise = store.call('test-payload');
      store.reject('error-reason');

      await expect(promise).rejects.toBe('error-reason');
      expect(store.current).toBeNull();
    });

    it('should do nothing when no current call exists', () => {
      expect(() => store.reject('error')).not.toThrow();
      expect(store.current).toBeNull();
    });

    it('should clear the current call reference after rejection', async () => {
      const promise = store.call('test-payload');
      store.reject('error');

      try {
        await promise;
      } catch {
        // Expected to fail
      }

      expect(store.current).toBeNull();
    });
  });

  describe('when configured with options', () => {
    it('should pass options to the underlying CallStore', () => {
      const storeWithOptions = new SingletonCallStore({ unmountingDelay: 100 });

      expect(() => storeWithOptions.call('test-payload')).not.toThrow();
    });
  });

  describe('event system', () => {
    it('should forward add event listeners to the underlying CallStore', () => {
      const listener = vi.fn();

      expect(() => {
        store.addEventListener('add', listener);
      }).not.toThrow();
    });

    it('should forward remove event listeners to the underlying CallStore', () => {
      const listener = vi.fn();
      store.addEventListener('add', listener);

      expect(() => {
        store.removeEventListener('add', listener);
      }).not.toThrow();
    });

    it('should forward all event types to the underlying CallStore', () => {
      const addListener = vi.fn();
      const updateListener = vi.fn();
      const resolveListener = vi.fn();
      const rejectListener = vi.fn();

      expect(() => {
        store.addEventListener('add', addListener);
        store.addEventListener('update', updateListener);
        store.addEventListener('resolve', resolveListener);
        store.addEventListener('reject', rejectListener);
      }).not.toThrow();
    });
  });

  describe('singleton behavior', () => {
    it('should always return the same promise for multiple calls', () => {
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(store.call(`payload-${i}`));
      }

      const firstPromise = promises[0];
      promises.forEach((promise) => {
        expect(promise).toBe(firstPromise);
      });
    });

    it('should create new calls after resolution/rejection', async () => {
      const promise1 = store.call('first-payload');
      store.resolve('data1');
      await promise1;

      const promise2 = store.call('second-payload');
      expect(promise2).not.toBe(promise1);
      expect(store.current?.promise).toBe(promise2);
    });
  });
});
