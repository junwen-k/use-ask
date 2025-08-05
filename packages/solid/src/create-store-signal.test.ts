import { renderHook } from '@solidjs/testing-library';
import { CallStore, SingletonCallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';

import { createCallStoreSignal, createSingletonCallStoreSignal } from './create-store-signal';

describe('createCallStoreSignal', () => {
  describe('reactivity', () => {
    it('should return initial state', () => {
      const store = new CallStore();
      const { result } = renderHook(() => createCallStoreSignal(store));

      expect(result()).toEqual([]);
    });

    it('should update when store state changes', () => {
      const store = new CallStore();
      const { result } = renderHook(() => createCallStoreSignal(store));

      store.call('test-payload');

      expect(result()).toHaveLength(1);
    });

    it('should update when store state changes multiple times', () => {
      const store = new CallStore();
      const { result } = renderHook(() => createCallStoreSignal(store));

      store.call('first-payload');

      expect(result()).toHaveLength(1);

      store.call('second-payload');

      expect(result()).toHaveLength(2);
    });

    it('should update when store state is modified', () => {
      const store = new CallStore();
      const { result } = renderHook(() => createCallStoreSignal(store));

      const promise = store.call('initial-payload');

      expect(result()).toHaveLength(1);
      expect(result()[0].payload).toBe('initial-payload');

      store.update(promise!, 'updated-payload');

      expect(result()).toHaveLength(1);
      expect(result()[0].payload).toBe('updated-payload');
    });

    it('should update when store state is resolved', async () => {
      const store = new CallStore();
      const { result } = renderHook(() => createCallStoreSignal(store));

      const promise = store.call('test-payload');

      expect(result()).toHaveLength(1);

      store.resolve(promise!, 'success');
      await promise!;

      expect(result()).toHaveLength(0);
    });

    it('should update when store state is rejected', async () => {
      const store = new CallStore();
      const { result } = renderHook(() => createCallStoreSignal(store));

      const promise = store.call('test-payload');

      expect(result()).toHaveLength(1);

      store.reject(promise!, 'error');
      try {
        await promise!;
      } catch {
        // Expected to fail
      }

      expect(result()).toHaveLength(0);
    });
  });

  describe('event listener management', () => {
    it('should subscribe to store events on mount', () => {
      const store = new CallStore();
      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');

      renderHook(() => createCallStoreSignal(store));

      expect(addEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from store events on cleanup', () => {
      const store = new CallStore();
      const { cleanup } = renderHook(() => createCallStoreSignal(store));

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('multiple signals synchronization', () => {
    it('should keep multiple signals in sync with the same store', () => {
      const store = new CallStore();
      const { result: result1 } = renderHook(() => createCallStoreSignal(store));
      const { result: result2 } = renderHook(() => createCallStoreSignal(store));

      store.call('test-payload');

      expect(result1()).toHaveLength(1);
      expect(result2()).toHaveLength(1);
      expect(result1()).toEqual(result2());
    });

    it('should update all signals when store state changes', () => {
      const store = new CallStore();
      const { result: result1 } = renderHook(() => createCallStoreSignal(store));
      const { result: result2 } = renderHook(() => createCallStoreSignal(store));

      store.call('first-payload');

      expect(result1()).toHaveLength(1);
      expect(result2()).toHaveLength(1);

      store.call('second-payload');

      expect(result1()).toHaveLength(2);
      expect(result2()).toHaveLength(2);
      expect(result1()).toEqual(result2());
    });
  });

  describe('unmounting delay behavior', () => {
    it('should reflect store state during unmounting delay', async () => {
      const store = new CallStore({ unmountingDelay: 50 });
      const { result } = renderHook(() => createCallStoreSignal(store));

      const promise = store.call('test-payload');

      store.resolve(promise!, 'success');
      await promise!;

      expect(result()).toHaveLength(1);

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(result()).toHaveLength(0);
    });
  });
});

describe('createSingletonCallStoreSignal', () => {
  describe('reactivity', () => {
    it('should return initial state', () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => createSingletonCallStoreSignal(store));

      expect(result()).toBeNull();
    });

    it('should update when store state changes', () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => createSingletonCallStoreSignal(store));

      store.call('test-payload');

      expect(result()).toBeDefined();
    });

    it('should update when store state changes multiple times', () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => createSingletonCallStoreSignal(store));

      store.call('first-payload');

      expect(result()).toBeDefined();

      store.call('second-payload');

      expect(result()).toBeDefined();
      // The singleton behavior means the same promise is reused, but the object reference may change
      expect(result()).not.toBeNull();
    });

    it('should update when store state is modified', () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => createSingletonCallStoreSignal(store));

      store.call('initial-payload');

      expect(result()).toBeDefined();

      store.update('updated-payload');

      expect(result()).toBeDefined();
      expect(result()?.payload).toBe('updated-payload');
    });

    it('should update when store state is resolved', async () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => createSingletonCallStoreSignal(store));

      store.call('test-payload');

      expect(result()).toBeDefined();

      store.resolve('success');

      expect(result()).toBeNull();
    });

    it('should update when store state is rejected', async () => {
      const store = new SingletonCallStore();
      const { result } = renderHook(() => createSingletonCallStoreSignal(store));

      const promise = store.call('test-payload');

      expect(result()).toBeDefined();

      store.reject('error');
      try {
        await promise!;
      } catch {
        // Expected to fail
      }

      expect(result()).toBeNull();
    });
  });

  describe('event listener management', () => {
    it('should subscribe to store events on mount', () => {
      const store = new SingletonCallStore();
      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');

      renderHook(() => createSingletonCallStoreSignal(store));

      expect(addEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from store events on cleanup', () => {
      const store = new SingletonCallStore();
      const { cleanup } = renderHook(() => createSingletonCallStoreSignal(store));

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('multiple signals synchronization', () => {
    it('should keep multiple signals in sync with the same store', () => {
      const store = new SingletonCallStore();
      const { result: result1 } = renderHook(() => createSingletonCallStoreSignal(store));
      const { result: result2 } = renderHook(() => createSingletonCallStoreSignal(store));

      store.call('test-payload');

      expect(result1()).toBeDefined();
      expect(result2()).toBeDefined();
      expect(result1()).toBe(result2());
    });

    it('should update all signals when store state changes', () => {
      const store = new SingletonCallStore();
      const { result: result1 } = renderHook(() => createSingletonCallStoreSignal(store));
      const { result: result2 } = renderHook(() => createSingletonCallStoreSignal(store));

      store.call('first-payload');

      expect(result1()).toBeDefined();
      expect(result2()).toBeDefined();

      store.call('second-payload');

      expect(result1()).toBeDefined();
      expect(result2()).toBeDefined();
      expect(result1()).toBe(result2());
    });
  });

  describe('unmounting delay behavior', () => {
    it('should reflect store state during unmounting delay', async () => {
      const store = new SingletonCallStore({ unmountingDelay: 50 });
      const { result } = renderHook(() => createSingletonCallStoreSignal(store));

      store.call('test-payload');

      store.resolve('success');

      expect(result()).toBeDefined();

      await new Promise((resolve) => setTimeout(resolve, 60));

      expect(result()).toBeNull();
    });
  });
});
