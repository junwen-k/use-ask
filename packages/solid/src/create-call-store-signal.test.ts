import { renderHook } from '@solidjs/testing-library';
import { CallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';

import { createCallStore } from './create-call-store';

describe('createCallStore', () => {
  describe('Initialization', () => {
    it('should create a new store and create signal function', () => {
      const [store, createStoreSignal] = createCallStore();

      const signal = createStoreSignal();

      expect(store).toBeInstanceOf(CallStore);
      expect(signal).toBeInstanceOf(Function);
    });
  });

  describe('Store Operations', () => {
    it('should reflect store changes in stack', () => {
      const [store, createStoreSignal] = createCallStore();

      const signal = createStoreSignal();

      store.call('test');

      expect(signal()).toHaveLength(1);
      expect(signal()[0].payload).toBe('test');
    });

    it('should handle promise resolution', async () => {
      const [store, createStoreSignal] = createCallStore();

      const signal = createStoreSignal();

      store.call('test');
      expect(signal()).toHaveLength(1);

      const call = signal()[0];
      expect(call).toBeDefined();

      call?.resolve('success');
      await expect(call?.promise).resolves.toBe('success');

      expect(signal()).toHaveLength(0);
    });

    it('should handle promise rejection', async () => {
      const [store, createStoreSignal] = createCallStore();

      const signal = createStoreSignal();

      store.call('test');
      expect(signal()).toHaveLength(1);

      const call = signal()[0];
      expect(call).toBeDefined();

      call?.reject('error');
      await expect(call?.promise).rejects.toBe('error');

      expect(signal()).toHaveLength(0);
    });

    it('should cleanup event listeners when hook unmounts', () => {
      const [store, createStoreSignal] = createCallStore();
      const { cleanup } = renderHook(() => createStoreSignal());

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      cleanup();

      for (const event of ['add', 'update', 'settled', 'resolve', 'reject']) {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
      }
      removeEventListenerSpy.mockRestore();
    });
  });
});
