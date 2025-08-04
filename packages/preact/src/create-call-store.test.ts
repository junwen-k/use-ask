import { act, renderHook } from '@testing-library/preact';
import { CallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';

import { createCallStore } from './create-call-store';

describe('createCallStore', () => {
  describe('when creating a call store', () => {
    it('should return a store instance and a hook function', () => {
      const [store, useCallStore] = createCallStore();

      expect(store).toBeInstanceOf(CallStore);
      expect(useCallStore).toBeInstanceOf(Function);
    });

    it('should accept constructor options', () => {
      const [store] = createCallStore({ unmountingDelay: 100 });

      expect(store).toBeInstanceOf(CallStore);
    });
  });

  describe('when using the hook', () => {
    it('should return an empty stack when no calls exist', () => {
      const [, useCallStore] = createCallStore();
      const { result } = renderHook(() => useCallStore());

      expect(result.current).toHaveLength(0);
    });

    it('should return the call stack when calls exist', () => {
      const [store, useCallStore] = createCallStore();
      const { result } = renderHook(() => useCallStore());

      act(() => {
        store.call('test-payload');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].payload).toBe('test-payload');
      expect(result.current[0].promise).toBeInstanceOf(Promise);
    });

    it('should update when new calls are added', () => {
      const [store, useCallStore] = createCallStore();
      const { result } = renderHook(() => useCallStore());

      act(() => {
        store.call('first-payload');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].payload).toBe('first-payload');

      act(() => {
        store.call('second-payload');
      });

      expect(result.current).toHaveLength(2);
      expect(result.current[0].payload).toBe('first-payload');
      expect(result.current[1].payload).toBe('second-payload');
    });

    it('should update when call payloads are updated', () => {
      const [store, useCallStore] = createCallStore();
      const { result } = renderHook(() => useCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('initial-payload');
      });

      act(() => {
        store.update(callPromise!, 'updated-payload');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].payload).toBe('updated-payload');
    });

    it('should remove calls when they are resolved', async () => {
      const [store, useCallStore] = createCallStore();
      const { result } = renderHook(() => useCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('test-payload');
      });

      expect(result.current).toHaveLength(1);

      await act(async () => {
        store.resolve(callPromise!, 'success');
        await callPromise!;
      });

      expect(result.current).toHaveLength(0);
    });

    it('should remove calls when they are rejected', async () => {
      const [store, useCallStore] = createCallStore();
      const { result } = renderHook(() => useCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('test-payload');
      });

      expect(result.current).toHaveLength(1);

      await act(async () => {
        store.reject(callPromise!, 'error');
        try {
          await callPromise!;
        } catch {
          // Expected to fail
        }
      });

      expect(result.current).toHaveLength(0);
    });

    it('should handle calls with unmounting delay', async () => {
      const [store, useCallStore] = createCallStore({ unmountingDelay: 50 });
      const { result } = renderHook(() => useCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('test-payload');
      });

      await act(async () => {
        store.resolve(callPromise!, 'success');
        await callPromise!;
      });

      // With unmounting delay, the call should still be in the stack
      expect(result.current).toHaveLength(1);
      expect(result.current[0].pending).toBe(false);

      // Wait for the unmounting delay to expire
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 60));
      });

      // Now the call should be removed from the stack
      expect(result.current).toHaveLength(0);
    });
  });

  describe('when the hook unmounts', () => {
    it('should cleanup event listeners', () => {
      const [store, useCallStore] = createCallStore();
      const { unmount } = renderHook(() => useCallStore());

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      unmount();

      const expectedEvents = ['add', 'update', 'settled', 'resolve', 'reject'];
      expectedEvents.forEach((event) => {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
      });

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('when multiple hooks use the same store', () => {
    it('should keep all hooks in sync', () => {
      const [store, useCallStore] = createCallStore();
      const { result: result1 } = renderHook(() => useCallStore());
      const { result: result2 } = renderHook(() => useCallStore());

      act(() => {
        store.call('test-payload');
      });

      expect(result1.current).toHaveLength(1);
      expect(result2.current).toHaveLength(1);
      expect(result1.current[0].payload).toBe('test-payload');
      expect(result2.current[0].payload).toBe('test-payload');
    });

    it('should update all hooks when store changes', () => {
      const [store, useCallStore] = createCallStore();
      const { result: result1 } = renderHook(() => useCallStore());
      const { result: result2 } = renderHook(() => useCallStore());

      act(() => {
        store.call('first-payload');
      });

      expect(result1.current).toHaveLength(1);
      expect(result2.current).toHaveLength(1);

      act(() => {
        store.call('second-payload');
      });

      expect(result1.current).toHaveLength(2);
      expect(result2.current).toHaveLength(2);
    });
  });
});
