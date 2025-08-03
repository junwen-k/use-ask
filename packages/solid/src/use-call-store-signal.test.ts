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
    it('should reflect store changes in call stacks', () => {
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

      const callStack = store.get(signal()[0].id);
      expect(callStack).toBeDefined();

      callStack?.resolve('success');
      await expect(callStack?.promise).resolves.toBe('success');

      expect(signal()).toHaveLength(0);
    });

    it('should handle promise rejection', async () => {
      const [store, createStoreSignal] = createCallStore();

      const signal = createStoreSignal();

      store.call('test');
      expect(signal()).toHaveLength(1);

      const callStack = store.get(signal()[0].id);
      expect(callStack).toBeDefined();

      callStack?.reject('error');
      await expect(callStack?.promise).rejects.toBe('error');

      expect(signal()).toHaveLength(0);
    });

    it('should handle safe promise resolution', async () => {
      const [store, createStoreSignal] = createCallStore();

      const signal = createStoreSignal();

      store.callSafe('test');
      expect(signal()).toHaveLength(1);

      const callStack = store.get(signal()[0].id);
      expect(callStack).toBeDefined();

      callStack?.resolve('success');
      await expect(callStack?.promise).resolves.toEqual({
        ok: true,
        data: 'success',
      });

      expect(signal()).toHaveLength(0);
    });

    it('should handle safe promise rejection', async () => {
      const [store, createStoreSignal] = createCallStore();

      const signal = createStoreSignal();

      store.callSafe('test');
      expect(signal()).toHaveLength(1);

      const callStack = store.get(signal()[0].id);
      expect(callStack).toBeDefined();

      callStack?.reject();
      await expect(callStack?.promise).resolves.toEqual({
        ok: false,
        reason: undefined,
      });
    });

    it('should update call stacks when store is cleared', () => {
      const [store, createStoreSignal] = createCallStore();

      const signal = createStoreSignal();

      store.call('test1');
      store.call('test2');
      expect(signal()).toHaveLength(2);

      store.clear();
      expect(signal()).toHaveLength(0);
    });

    it('should cleanup event listeners when hook unmounts', () => {
      const [store, createStoreSignal] = createCallStore();
      const { cleanup } = renderHook(() => createStoreSignal());

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      cleanup();

      for (const event of ['add', 'update', 'settled', 'resolve', 'reject', 'delete', 'clear']) {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
      }
      removeEventListenerSpy.mockRestore();
    });
  });
});
