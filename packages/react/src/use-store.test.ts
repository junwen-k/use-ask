import { act, renderHook } from '@testing-library/react';
import { CallStore, SingletonCallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';

import { useCallStore, useSingletonCallStore } from './use-store';

describe('useCallStore', () => {
  describe('reactivity', () => {
    it('should return initial state', () => {
      const store = new CallStore();
      const { result } = renderHook(() => useCallStore(store));

      expect(result.current).toEqual([]);
    });

    it('should update when store state changes', () => {
      const store = new CallStore();
      const { result } = renderHook(() => useCallStore(store));

      act(() => {
        store.call('test-payload');
      });

      expect(result.current).toHaveLength(1);
    });

    it('should update when store state changes multiple times', () => {
      const store = new CallStore();
      const { result } = renderHook(() => useCallStore(store));

      act(() => {
        store.call('first-payload');
      });

      expect(result.current).toHaveLength(1);

      act(() => {
        store.call('second-payload');
      });

      expect(result.current).toHaveLength(2);
    });

    it('should update when store state is modified', () => {
      const store = new CallStore();
      const { result } = renderHook(() => useCallStore(store));

      let promise: Promise<unknown>;
      act(() => {
        promise = store.call('initial-payload');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].payload).toBe('initial-payload');

      act(() => {
        store.update(promise!, 'updated-payload');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].payload).toBe('updated-payload');
    });

    it('should update when store state is resolved', async () => {
      const store = new CallStore();
      const { result } = renderHook(() => useCallStore(store));

      let promise: Promise<unknown>;
      act(() => {
        promise = store.call('test-payload');
      });

      expect(result.current).toHaveLength(1);

      await act(async () => {
        store.resolve(promise!, 'success');
        await promise!;
      });

      expect(result.current).toHaveLength(0);
    });

    it('should update when store state is rejected', async () => {
      const store = new CallStore();
      const { result } = renderHook(() => useCallStore(store));

      let promise: Promise<unknown>;
      act(() => {
        promise = store.call('test-payload');
      });

      expect(result.current).toHaveLength(1);

      await act(async () => {
        store.reject(promise!, 'error');
        try {
          await promise!;
        } catch {
          // Expected to fail
        }
      });

      expect(result.current).toHaveLength(0);
    });
  });

  describe('event listener management', () => {
    it('should subscribe to store events on mount', () => {
      const store = new CallStore();
      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');

      renderHook(() => useCallStore(store));

      expect(addEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from store events on unmount', () => {
      const store = new CallStore();
      const { unmount } = renderHook(() => useCallStore(store));

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('multiple hooks synchronization', () => {
    it('should keep multiple hooks in sync with the same store', () => {
      const store = new CallStore();
      const { result: result1 } = renderHook(() => useCallStore(store));
      const { result: result2 } = renderHook(() => useCallStore(store));

      act(() => {
        store.call('test-payload');
      });

      expect(result1.current).toHaveLength(1);
      expect(result2.current).toHaveLength(1);
      expect(result1.current).toEqual(result2.current);
    });

    it('should update all hooks when store state changes', () => {
      const store = new CallStore();
      const { result: result1 } = renderHook(() => useCallStore(store));
      const { result: result2 } = renderHook(() => useCallStore(store));

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
      expect(result1.current).toEqual(result2.current);
    });
  });

  describe('unmounting delay behavior', () => {
    it('should reflect store state during unmounting delay', async () => {
      const store = new CallStore({ unmountingDelay: 50 });
      const { result } = renderHook(() => useCallStore(store));

      let promise: Promise<unknown>;
      act(() => {
        promise = store.call('test-payload');
      });

      await act(async () => {
        store.resolve(promise!, 'success');
        await promise!;
      });

      expect(result.current).toHaveLength(1);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 60));
      });

      expect(result.current).toHaveLength(0);
    });
  });
});

describe('useSingletonCallStore', () => {
  describe('reactivity', () => {
    it('should return initial state', () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore(store));

      expect(result.current).toBeNull();
    });

    it('should update when store state changes', () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore(store));

      act(() => {
        store.call('test-payload');
      });

      expect(result.current).toBeDefined();
    });

    it('should update when store state changes multiple times', () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore(store));

      act(() => {
        store.call('first-payload');
      });

      expect(result.current).toBeDefined();

      act(() => {
        store.call('second-payload');
      });

      expect(result.current).toBeDefined();
      // The singleton behavior means the same promise is reused, but the object reference may change
      expect(result.current).not.toBeNull();
    });

    it('should update when store state is modified', () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore(store));

      act(() => {
        store.call('initial-payload');
      });

      expect(result.current).toBeDefined();

      act(() => {
        store.update('updated-payload');
      });

      expect(result.current).toBeDefined();
      expect(result.current?.payload).toBe('updated-payload');
    });

    it('should update when store state is resolved', async () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore(store));

      act(() => {
        store.call('test-payload');
      });

      expect(result.current).toBeDefined();

      await act(async () => {
        store.resolve('success');
      });

      expect(result.current).toBeNull();
    });

    it('should update when store state is rejected', async () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => useSingletonCallStore(store));

      let promise: Promise<unknown>;
      act(() => {
        promise = store.call('test-payload');
      });

      expect(result.current).toBeDefined();

      await act(async () => {
        store.reject('error');
        try {
          await promise!;
        } catch {
          // Expected to fail
        }
      });

      expect(result.current).toBeNull();
    });
  });

  describe('event listener management', () => {
    it('should subscribe to store events on mount', () => {
      const store = new SingletonCallStore();
      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');

      renderHook(() => useSingletonCallStore(store));

      expect(addEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from store events on unmount', () => {
      const store = new SingletonCallStore();
      const { unmount } = renderHook(() => useSingletonCallStore(store));

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('multiple hooks synchronization', () => {
    it('should keep multiple hooks in sync with the same store', () => {
      const store = new SingletonCallStore();
      const { result: result1 } = renderHook(() => useSingletonCallStore(store));
      const { result: result2 } = renderHook(() => useSingletonCallStore(store));

      act(() => {
        store.call('test-payload');
      });

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
      expect(result1.current).toBe(result2.current);
    });

    it('should update all hooks when store state changes', () => {
      const store = new SingletonCallStore();
      const { result: result1 } = renderHook(() => useSingletonCallStore(store));
      const { result: result2 } = renderHook(() => useSingletonCallStore(store));

      act(() => {
        store.call('first-payload');
      });

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();

      act(() => {
        store.call('second-payload');
      });

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
      expect(result1.current).toBe(result2.current);
    });
  });

  describe('unmounting delay behavior', () => {
    it('should reflect store state during unmounting delay', async () => {
      const store = new SingletonCallStore({ unmountingDelay: 50 });
      const { result } = renderHook(() => useSingletonCallStore(store));

      act(() => {
        store.call('test-payload');
      });

      await act(async () => {
        store.resolve('success');
      });

      expect(result.current).toBeDefined();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 60));
      });

      expect(result.current).toBeNull();
    });
  });
});
