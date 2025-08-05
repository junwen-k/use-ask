import { CallStore, SingletonCallStore } from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-vue';
import { markRaw } from 'vue';

import TestCallStoreComponent from './fixtures/test-call-store.vue';
import TestSingletonCallStoreComponent from './fixtures/test-singleton-call-store.vue';

describe('useCallStore', () => {
  describe('reactivity', () => {
    it('should return initial state', async () => {
      const store = markRaw(new CallStore());
      const screen = render(TestCallStoreComponent, {
        props: { store },
      });

      await expect.element(screen.getByTestId('stack')).toHaveTextContent('0');
    });

    it('should update when store state changes', async () => {
      const store = markRaw(new CallStore());
      const screen = render(TestCallStoreComponent, {
        props: { store },
      });

      store.call('test-payload');

      await expect.element(screen.getByTestId('stack')).toHaveTextContent('1');
    });

    it('should update when store state changes multiple times', async () => {
      const store = markRaw(new CallStore());
      const screen = render(TestCallStoreComponent, {
        props: { store },
      });

      store.call('first-payload');
      await expect.element(screen.getByTestId('stack')).toHaveTextContent('1');

      store.call('second-payload');
      await expect.element(screen.getByTestId('stack')).toHaveTextContent('2');
    });

    it('should update when store state is modified', async () => {
      const store = markRaw(new CallStore());
      const screen = render(TestCallStoreComponent, {
        props: { store },
      });

      const promise = store.call('initial-payload');
      await expect.element(screen.getByTestId('stack')).toHaveTextContent('1');

      store.update(promise!, 'updated-payload');
      await expect.element(screen.getByTestId('stack')).toHaveTextContent('1');
    });

    it('should update when store state is resolved', async () => {
      const store = markRaw(new CallStore());
      const screen = render(TestCallStoreComponent, {
        props: { store },
      });

      const promise = store.call('test-payload');
      await expect.element(screen.getByTestId('stack')).toHaveTextContent('1');

      store.resolve(promise!, 'success');
      await promise!;
      await expect.element(screen.getByTestId('stack')).toHaveTextContent('0');
    });

    it('should update when store state is rejected', async () => {
      const store = markRaw(new CallStore());
      const screen = render(TestCallStoreComponent, {
        props: { store },
      });

      const promise = store.call('test-payload');
      await expect.element(screen.getByTestId('stack')).toHaveTextContent('1');

      store.reject(promise!, 'error');
      try {
        await promise!;
      } catch {
        // Expected to fail
      }
      await expect.element(screen.getByTestId('stack')).toHaveTextContent('0');
    });
  });

  describe('event listener management', () => {
    it('should subscribe to store events on mount', async () => {
      const store = markRaw(new CallStore());
      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');

      render(TestCallStoreComponent, {
        props: { store },
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from store events on unmount', async () => {
      const store = markRaw(new CallStore());
      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      const { unmount } = render(TestCallStoreComponent, {
        props: { store },
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('unmounting delay behavior', () => {
    it('should reflect store state during unmounting delay', async () => {
      const store = markRaw(new CallStore({ unmountingDelay: 50 }));
      const screen = render(TestCallStoreComponent, {
        props: { store },
      });

      const promise = store.call('test-payload');

      store.resolve(promise!, 'success');
      await promise!;

      await expect.element(screen.getByTestId('stack')).toHaveTextContent('1');

      await new Promise((resolve) => setTimeout(resolve, 60));

      await expect.element(screen.getByTestId('stack')).toHaveTextContent('0');
    });
  });
});

describe('useSingletonCallStore', () => {
  describe('reactivity', () => {
    it('should return initial state', async () => {
      const store = markRaw(new SingletonCallStore());
      const screen = render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      await expect.element(screen.getByTestId('current')).toHaveTextContent('null');
    });

    it('should update when store state changes', async () => {
      const store = markRaw(new SingletonCallStore());
      const screen = render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      store.call('test-payload');

      await expect.element(screen.getByTestId('current')).toHaveTextContent('test-payload');
    });

    it('should update when store state changes multiple times', async () => {
      const store = markRaw(new SingletonCallStore());
      const screen = render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      store.call('first-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('first-payload');

      store.call('second-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('second-payload');
    });

    it('should update when store state is modified', async () => {
      const store = markRaw(new SingletonCallStore());
      const screen = render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      store.call('initial-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('initial-payload');

      store.update('updated-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('updated-payload');
    });

    it('should update when store state is resolved', async () => {
      const store = markRaw(new SingletonCallStore());
      const screen = render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      store.call('test-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('test-payload');

      store.resolve('success');

      await expect.element(screen.getByTestId('current')).toHaveTextContent('null');
    });

    it('should update when store state is rejected', async () => {
      const store = markRaw(new SingletonCallStore());
      const screen = render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      const promise = store.call('test-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('test-payload');

      store.reject('error');
      try {
        await promise!;
      } catch {
        // Expected to fail
      }

      await expect.element(screen.getByTestId('current')).toHaveTextContent('null');
    });
  });

  describe('event listener management', () => {
    it('should subscribe to store events on mount', async () => {
      const store = markRaw(new SingletonCallStore());
      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');

      render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from store events on unmount', async () => {
      const store = markRaw(new SingletonCallStore());
      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      const { unmount } = render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('unmounting delay behavior', () => {
    it('should reflect store state during unmounting delay', async () => {
      const store = markRaw(new SingletonCallStore({ unmountingDelay: 50 }));
      const screen = render(TestSingletonCallStoreComponent, {
        props: { store },
      });

      store.call('test-payload');

      store.resolve('success');

      await expect.element(screen.getByTestId('current')).toHaveTextContent('test-payload');

      await new Promise((resolve) => setTimeout(resolve, 60));

      await expect.element(screen.getByTestId('current')).toHaveTextContent('null');
    });
  });
});
