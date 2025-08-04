import { act, renderHook } from '@testing-library/preact';
import { CallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';

import { createCallStore } from './create-call-store';

describe('createCallStore', () => {
  describe('Initialization', () => {
    it('should create a new store and use snapshot hook', () => {
      const [store, useCallStore] = createCallStore();

      expect(store).toBeInstanceOf(CallStore);
      expect(useCallStore).toBeInstanceOf(Function);
    });
  });

  describe('Store Operations', () => {
    it('should reflect store changes in stack', () => {
      const [store, useCallStore] = createCallStore();

      const { result } = renderHook(() => useCallStore());

      act(() => {
        store.call('test');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].payload).toBe('test');
    });

    it('should handle promise resolution', async () => {
      const [store, useCallStore] = createCallStore();

      const { result } = renderHook(() => useCallStore());

      act(() => {
        store.call('test');
      });
      expect(result.current).toHaveLength(1);

      const call = result.current[0];
      expect(call).toBeDefined();

      await act(async () => {
        call?.resolve('success');
        await expect(call?.promise).resolves.toBe('success');
      });

      expect(result.current).toHaveLength(0);
    });

    it('should handle promise rejection', async () => {
      const [store, useCallStore] = createCallStore();

      const { result } = renderHook(() => useCallStore());

      act(() => {
        store.call('test');
      });
      expect(result.current).toHaveLength(1);

      const call = result.current[0];
      expect(call).toBeDefined();

      await act(async () => {
        call?.reject('error');
        await expect(call?.promise).rejects.toBe('error');
      });

      expect(result.current).toHaveLength(0);
    });

    it('should handle safe promise resolution', async () => {
      const [store, useCallStore] = createCallStore();

      const { result } = renderHook(() => useCallStore());

      act(() => {
        store.callSafe('test');
      });
      expect(result.current).toHaveLength(1);

      const call = result.current[0];
      expect(call).toBeDefined();

      await act(async () => {
        call?.resolve('success');
        await expect(call?.promise).resolves.toEqual({
          ok: true,
          data: 'success',
        });
      });

      expect(result.current).toHaveLength(0);
    });

    it('should handle safe promise rejection', async () => {
      const [store, useCallStore] = createCallStore();

      const { result } = renderHook(() => useCallStore());

      act(() => {
        store.callSafe('test');
      });
      expect(result.current).toHaveLength(1);

      const call = result.current[0];
      expect(call).toBeDefined();

      await act(async () => {
        call?.reject();
        await expect(call?.promise).resolves.toEqual({
          ok: false,
          reason: undefined,
        });
      });
    });

    it('should cleanup event listeners when hook unmounts', () => {
      const [store, useCallStore] = createCallStore();
      const { unmount } = renderHook(() => useCallStore());

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      unmount();

      for (const event of ['add', 'update', 'settled', 'resolve', 'reject']) {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
      }
      removeEventListenerSpy.mockRestore();
    });
  });
});
