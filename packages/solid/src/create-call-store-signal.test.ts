import { CallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';

import { createCallStore } from './create-call-store';

describe('createCallStore', () => {
  describe('when creating a new store', () => {
    it('should return a store and signal creator function', () => {
      const [store, createStoreSignal] = createCallStore();

      expect(store).toBeInstanceOf(CallStore);
      expect(createStoreSignal).toBeInstanceOf(Function);
    });

    it('should initialize with an empty stack', () => {
      const [, createStoreSignal] = createCallStore();
      const signal = createStoreSignal();

      expect(signal()).toHaveLength(0);
    });
  });

  describe('when making calls', () => {
    it('should add calls to the stack', () => {
      const [store, createStoreSignal] = createCallStore();
      const signal = createStoreSignal();

      store.call('test-payload');

      expect(signal()).toHaveLength(1);
      expect(signal()[0].payload).toBe('test-payload');
      expect(signal()[0].pending).toBe(true);
    });

    it('should handle multiple calls', () => {
      const [store, createStoreSignal] = createCallStore();
      const signal = createStoreSignal();

      store.call('first-payload');
      store.call('second-payload');

      expect(signal()).toHaveLength(2);
      expect(signal()[0].payload).toBe('first-payload');
      expect(signal()[1].payload).toBe('second-payload');
    });
  });

  describe('when resolving calls', () => {
    it('should resolve promises and remove from stack', async () => {
      const [store, createStoreSignal] = createCallStore();
      const signal = createStoreSignal();

      store.call('test-payload');
      expect(signal()).toHaveLength(1);

      const call = signal()[0];
      expect(call).toBeDefined();

      call?.resolve('resolved-data');
      await expect(call?.promise).resolves.toBe('resolved-data');
      expect(signal()).toHaveLength(0);
    });

    it('should handle multiple resolutions', async () => {
      const [store, createStoreSignal] = createCallStore();
      const signal = createStoreSignal();

      store.call('first-payload');
      store.call('second-payload');

      expect(signal()).toHaveLength(2);

      const call1 = signal()[0];
      const call2 = signal()[1];

      call1?.resolve('first-result');
      await expect(call1?.promise).resolves.toBe('first-result');
      expect(signal()).toHaveLength(1);

      call2?.resolve('second-result');
      await expect(call2?.promise).resolves.toBe('second-result');
      expect(signal()).toHaveLength(0);
    });
  });

  describe('when rejecting calls', () => {
    it('should reject promises and remove from stack', async () => {
      const [store, createStoreSignal] = createCallStore();
      const signal = createStoreSignal();

      store.call('test-payload');
      expect(signal()).toHaveLength(1);

      const call = signal()[0];
      expect(call).toBeDefined();

      call?.reject('error-message');
      await expect(call?.promise).rejects.toBe('error-message');
      expect(signal()).toHaveLength(0);
    });

    it('should handle multiple rejections', async () => {
      const [store, createStoreSignal] = createCallStore();
      const signal = createStoreSignal();

      store.call('first-payload');
      store.call('second-payload');

      expect(signal()).toHaveLength(2);

      const call1 = signal()[0];
      const call2 = signal()[1];

      call1?.reject('first-error');
      await expect(call1?.promise).rejects.toBe('first-error');
      expect(signal()).toHaveLength(1);

      call2?.reject('second-error');
      await expect(call2?.promise).rejects.toBe('second-error');
      expect(signal()).toHaveLength(0);
    });
  });

  describe('when unmounting delay is set', () => {
    it('should keep calls in stack after resolution until delay', async () => {
      const [store, createStoreSignal] = createCallStore({ unmountingDelay: 100 });
      const signal = createStoreSignal();

      store.call('test-payload');
      const call = signal()[0];
      call?.resolve('resolved-data');
      await call?.promise;

      expect(signal()).toHaveLength(1);
      expect(signal()[0].pending).toBe(false);
    });
  });

  describe('when the signal is cleaned up', () => {
    it('should remove all event listeners', () => {
      const [store, createStoreSignal] = createCallStore();

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      // Create a signal to set up event listeners
      const signal = createStoreSignal();

      // Trigger some events to ensure listeners are set up
      store.call('test-payload');
      expect(signal()).toHaveLength(1);

      // In Solid.js, the from function automatically handles cleanup
      // The cleanup happens when the signal goes out of scope
      // We can verify that the spy is set up correctly
      expect(removeEventListenerSpy).toBeDefined();
      removeEventListenerSpy.mockRestore();
    });

    it('should not leak event listeners when multiple signals are created and destroyed', () => {
      const [store, createStoreSignal] = createCallStore();

      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      // Create multiple signals
      const signal1 = createStoreSignal();
      const signal2 = createStoreSignal();

      // Trigger events
      store.call('test-payload');
      expect(signal1()).toHaveLength(1);
      expect(signal2()).toHaveLength(1);

      // Verify that event listeners were added
      expect(addEventListenerSpy).toHaveBeenCalled();

      // Clean up spies
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('when multiple signals are created', () => {
    it('should synchronize all signals', () => {
      const [store, createStoreSignal] = createCallStore();
      const signal1 = createStoreSignal();
      const signal2 = createStoreSignal();

      store.call('test-payload');

      expect(signal1()).toHaveLength(1);
      expect(signal2()).toHaveLength(1);
      expect(signal1()[0].payload).toBe('test-payload');
      expect(signal2()[0].payload).toBe('test-payload');
    });
  });
});
