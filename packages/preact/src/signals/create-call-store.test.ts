import { act, renderHook } from '@testing-library/preact';
import { CallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';

import { createCallStore } from './create-call-store';

describe('createCallStore', () => {
  describe('Initialization', () => {
    it('should create a new store and use signal hook', () => {
      const [store, useCallStoreSignal] = createCallStore();

      expect(store).toBeInstanceOf(CallStore);
      expect(useCallStoreSignal).toBeInstanceOf(Function);
    });
  });

  describe('Store Operations', () => {
    it('should reflect store changes in call stacks', () => {
      const [store, useCallStoreSignal] = createCallStore();

      const { result } = renderHook(() => useCallStoreSignal());

      act(() => {
        store.call('test');
      });

      expect(result.current.value).toHaveLength(1);
      expect(result.current.value[0].payload).toBe('test');
    });

    it('should handle promise resolution', async () => {
      const [store, useCallStoreSignal] = createCallStore();

      const { result } = renderHook(() => useCallStoreSignal());

      act(() => {
        store.call('test');
      });
      expect(result.current.value).toHaveLength(1);

      const callStack = result.current.value[0];
      expect(callStack).toBeDefined();

      await act(async () => {
        callStack?.resolve('success');
        await expect(callStack?.promise).resolves.toBe('success');
      });

      expect(result.current.value).toHaveLength(0);
    });

    it('should handle promise rejection', async () => {
      const [store, useCallStoreSignal] = createCallStore();

      const { result } = renderHook(() => useCallStoreSignal());

      act(() => {
        store.call('test');
      });
      expect(result.current.value).toHaveLength(1);

      const callStack = result.current.value[0];
      expect(callStack).toBeDefined();

      await act(async () => {
        callStack?.reject('error');
        await expect(callStack?.promise).rejects.toBe('error');
      });

      expect(result.current.value).toHaveLength(0);
    });

    it('should handle safe promise resolution', async () => {
      const [store, useCallStoreSignal] = createCallStore();

      const { result } = renderHook(() => useCallStoreSignal());

      act(() => {
        store.callSafe('test');
      });
      expect(result.current.value).toHaveLength(1);

      const callStack = result.current.value[0];
      expect(callStack).toBeDefined();

      await act(async () => {
        callStack?.resolve('success');
        await expect(callStack?.promise).resolves.toEqual({
          ok: true,
          data: 'success',
        });
      });

      expect(result.current.value).toHaveLength(0);
    });

    it('should handle safe promise rejection', async () => {
      const [store, useCallStoreSignal] = createCallStore();

      const { result } = renderHook(() => useCallStoreSignal());

      act(() => {
        store.callSafe('test');
      });
      expect(result.current.value).toHaveLength(1);

      const callStack = result.current.value[0];
      expect(callStack).toBeDefined();

      await act(async () => {
        callStack?.reject();
        await expect(callStack?.promise).resolves.toEqual({
          ok: false,
          reason: undefined,
        });
      });
    });

    it('should cleanup event listeners when hook unmounts', () => {
      const [store, useCallStoreSignal] = createCallStore();
      const { unmount } = renderHook(() => useCallStoreSignal());

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      unmount();

      for (const event of ['add', 'update', 'settled', 'resolve', 'reject']) {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
      }
      removeEventListenerSpy.mockRestore();
    });
  });
});
