import { SingletonCallStore } from '@ui-call/core';
import { describe, expect, it } from 'vitest';

import { createSingletonCallStore } from './create-singleton-call-store';

describe('createSingletonCallStore', () => {
  describe('when creating a new store', () => {
    it('should return a store and signal creator function', () => {
      const [store, createStoreSignal] = createSingletonCallStore();

      expect(store).toBeInstanceOf(SingletonCallStore);
      expect(createStoreSignal).toBeInstanceOf(Function);
    });

    it('should initialize with no current call', () => {
      const [, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      expect(signal()).toBeUndefined();
    });
  });

  describe('when making calls', () => {
    it('should set the current call', () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      store.call('test-payload');

      expect(signal()).toBeDefined();
      expect(signal()?.payload).toBe('test-payload');
      expect(signal()?.pending).toBe(true);
    });

    it('should update the current call when a new call is made', () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      const promise1 = store.call('first-payload');
      expect(signal()?.payload).toBe('first-payload');

      const promise2 = store.call('second-payload');
      expect(signal()?.payload).toBe('second-payload');
      expect(promise1).toBe(promise2);
    });
  });

  describe('when updating calls', () => {
    it('should update the current call payload', () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      store.call('initial-payload');
      store.update('updated-payload');

      expect(signal()?.payload).toBe('updated-payload');
    });
  });

  describe('when resolving calls', () => {
    it('should resolve promises and clear current call', async () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      store.call('test-payload');
      expect(signal()).toBeDefined();

      const call = signal();
      call?.resolve('resolved-data');
      await expect(call?.promise).resolves.toBe('resolved-data');
      expect(signal()).toBeUndefined();
    });

    it('should allow new calls after resolution', async () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      store.call('first-payload');
      const call1 = signal();
      call1?.resolve('first-result');
      await call1?.promise;

      expect(signal()).toBeUndefined();

      store.call('second-payload');
      expect(signal()?.payload).toBe('second-payload');
    });
  });

  describe('when rejecting calls', () => {
    it('should reject promises and clear current call', async () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      store.call('test-payload');
      expect(signal()).toBeDefined();

      const call = signal();
      call?.reject('error-message');
      await expect(call?.promise).rejects.toBe('error-message');
      expect(signal()).toBeUndefined();
    });

    it('should allow new calls after rejection', async () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      store.call('first-payload');
      const call1 = signal();
      call1?.reject('first-error');
      await expect(call1?.promise).rejects.toBe('first-error');

      expect(signal()).toBeUndefined();

      store.call('second-payload');
      expect(signal()?.payload).toBe('second-payload');
    });
  });

  describe('when unmounting delay is set', () => {
    it('should keep current call after resolution until delay', async () => {
      const [store, createStoreSignal] = createSingletonCallStore({ unmountingDelay: 100 });
      const signal = createStoreSignal();

      store.call('test-payload');
      const call = signal();
      call?.resolve('resolved-data');
      await call?.promise;

      expect(signal()).toBeDefined();
      expect(signal()?.pending).toBe(false);
    });
  });

  describe('when multiple signals are created', () => {
    it('should synchronize all signals', () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal1 = createStoreSignal();
      const signal2 = createStoreSignal();

      store.call('test-payload');

      expect(signal1()).toBeDefined();
      expect(signal2()).toBeDefined();
      expect(signal1()?.payload).toBe('test-payload');
      expect(signal2()?.payload).toBe('test-payload');
    });
  });

  describe('singleton behavior', () => {
    it('should always return the same promise for multiple calls', () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      const promise1 = store.call('first-payload');
      const promise2 = store.call('second-payload');
      const promise3 = store.call('third-payload');

      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);
      expect(signal()?.payload).toBe('third-payload');
    });

    it('should update payload when multiple calls are made', () => {
      const [store, createStoreSignal] = createSingletonCallStore();
      const signal = createStoreSignal();

      store.call('payload-1');
      expect(signal()?.payload).toBe('payload-1');

      store.call('payload-2');
      expect(signal()?.payload).toBe('payload-2');

      store.call('payload-3');
      expect(signal()?.payload).toBe('payload-3');

      store.call('payload-4');
      expect(signal()?.payload).toBe('payload-4');
    });
  });
});
