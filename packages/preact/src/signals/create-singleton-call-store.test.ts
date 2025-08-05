import { act, renderHook } from '@testing-library/preact';
import { SingletonCallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';

import { createSingletonCallStore } from './create-singleton-call-store';

describe('createSingletonCallStore (signals)', () => {
  describe('when creating a singleton call store', () => {
    it('should return a store instance and a hook function', () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();

      expect(store).toBeInstanceOf(SingletonCallStore);
      expect(useSingletonCallStore).toBeInstanceOf(Function);
    });

    it('should accept constructor options', () => {
      const [store] = createSingletonCallStore({ unmountingDelay: 100 });

      expect(store).toBeInstanceOf(SingletonCallStore);
    });
  });

  describe('when using the hook', () => {
    it('should return undefined when no current call exists', () => {
      const [, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      expect(result.current.value).toBeNull();
    });

    it('should return the current call when it exists', () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('test-payload');
      });

      expect(result.current.value).toBeDefined();
      expect(result.current.value?.promise).toBe(callPromise);
      expect(result.current.value?.payload).toBe('test-payload');
    });

    it('should update when the current call changes', () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      let firstPromise: Promise<unknown> | undefined;
      act(() => {
        firstPromise = store.call('first-payload');
      });

      expect(result.current.value?.promise).toBe(firstPromise);

      let secondPromise: Promise<unknown> | undefined;
      act(() => {
        secondPromise = store.call('second-payload');
      });

      expect(result.current.value?.promise).toBe(firstPromise);
      expect(secondPromise).toBe(firstPromise);
    });

    it('should update when the current call payload is updated', () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('initial-payload');
      });

      act(() => {
        store.update('updated-payload');
      });

      expect(result.current.value?.promise).toBe(callPromise);
      expect(result.current.value?.payload).toBe('updated-payload');
    });

    it('should return undefined when the current call is resolved', async () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('test-payload');
      });

      expect(result.current.value?.promise).toBe(callPromise);

      await act(async () => {
        store.resolve('success');
        await callPromise!;
      });

      expect(result.current.value).toBeNull();
    });

    it('should return undefined when the current call is rejected', async () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('test-payload');
      });

      expect(result.current.value?.promise).toBe(callPromise);

      await act(async () => {
        store.reject('error');
        try {
          await callPromise!;
        } catch {
          // Expected to fail
        }
      });

      expect(result.current.value).toBeNull();
    });

    it('should create a new call after resolution', async () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      let firstPromise: Promise<unknown> | undefined;
      act(() => {
        firstPromise = store.call('first-payload');
      });

      await act(async () => {
        store.resolve('success');
        await firstPromise!;
      });

      let secondPromise: Promise<unknown> | undefined;
      act(() => {
        secondPromise = store.call('second-payload');
      });

      expect(result.current.value?.promise).toBe(secondPromise);
      expect(secondPromise).not.toBe(firstPromise);
    });

    it('should create a new call after rejection', async () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      let firstPromise: Promise<unknown> | undefined;
      act(() => {
        firstPromise = store.call('first-payload');
      });

      await act(async () => {
        store.reject('error');
        try {
          await firstPromise!;
        } catch {
          // Expected to fail
        }
      });

      let secondPromise: Promise<unknown> | undefined;
      act(() => {
        secondPromise = store.call('second-payload');
      });

      expect(result.current.value?.promise).toBe(secondPromise);
      expect(secondPromise).not.toBe(firstPromise);
    });

    it('should handle calls with unmounting delay', async () => {
      const [store, useSingletonCallStore] = createSingletonCallStore({ unmountingDelay: 50 });
      const { result } = renderHook(() => useSingletonCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('test-payload');
      });

      await act(async () => {
        store.resolve('success');
        await callPromise!;
      });

      expect(result.current.value).toBeDefined();
      expect(result.current.value?.pending).toBe(false);
      expect(result.current.value?.promise).toBe(callPromise);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 60));
      });

      expect(result.current.value).toBeNull();
    });
  });

  describe('when the hook unmounts', () => {
    it('should cleanup event listeners', () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { unmount } = renderHook(() => useSingletonCallStore());

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
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result: result1 } = renderHook(() => useSingletonCallStore());
      const { result: result2 } = renderHook(() => useSingletonCallStore());

      let callPromise: Promise<unknown> | undefined;
      act(() => {
        callPromise = store.call('test-payload');
      });

      expect(result1.current.value?.promise).toBe(callPromise);
      expect(result2.current.value?.promise).toBe(callPromise);
    });

    it('should update all hooks when current call changes', () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result: result1 } = renderHook(() => useSingletonCallStore());
      const { result: result2 } = renderHook(() => useSingletonCallStore());

      let firstPromise: Promise<unknown> | undefined;
      act(() => {
        firstPromise = store.call('first-payload');
      });

      expect(result1.current.value?.promise).toBe(firstPromise);
      expect(result2.current.value?.promise).toBe(firstPromise);

      act(() => {
        store.call('second-payload');
      });

      expect(result1.current.value?.promise).toBe(firstPromise);
      expect(result2.current.value?.promise).toBe(firstPromise);
    });
  });

  describe('singleton behavior', () => {
    it('should always return the same promise for multiple calls', () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore());

      const promises: Array<Promise<unknown> | undefined> = [];
      act(() => {
        for (let i = 0; i < 5; i++) {
          promises.push(store.call(`payload-${i}`));
        }
      });

      const firstPromise = promises[0];
      promises.forEach((promise) => {
        expect(promise).toBe(firstPromise);
      });

      expect(result.current.value?.promise).toBe(firstPromise);
    });
  });
});
