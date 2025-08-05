import {
  CallStore as CoreCallStore,
  SingletonCallStore as CoreSingletonCallStore,
} from '@ui-call/core';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { CallStore, SingletonCallStore } from './call-store';
import TestCallStoreComponent from './fixtures/test-call-store.svelte';
import TestSingletonCallStoreComponent from './fixtures/test-singleton-call-store.svelte';

describe('CallStore', () => {
  describe('class', () => {
    it('should extend CoreCallStore', () => {
      const store = new CallStore();

      expect(store).toBeInstanceOf(CoreCallStore);
      expect(store).toBeInstanceOf(CallStore);
    });

    it('should accept constructor options', () => {
      const store = new CallStore({ unmountingDelay: 100 });

      expect(store).toBeInstanceOf(CallStore);
    });

    it('should create a new instance each time', () => {
      const store1 = new CallStore();
      const store2 = new CallStore();

      expect(store1).not.toBe(store2);
      expect(store1).toBeInstanceOf(CallStore);
      expect(store2).toBeInstanceOf(CallStore);
    });
  });

  describe('reactivity', () => {
    it('should return initial state', async () => {
      const store = new CallStore();
      const screen = render(TestCallStoreComponent, {
        store,
      });

      await expect.element(screen.container).toHaveTextContent('');
    });

    it('should update when store state changes', async () => {
      const store = new CallStore();
      const screen = render(TestCallStoreComponent, {
        store,
      });

      store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');
    });

    it('should update when store state changes multiple times', async () => {
      const store = new CallStore();
      const screen = render(TestCallStoreComponent, {
        store,
      });

      store.call('first-payload');
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('first-payload');

      store.call('second-payload');
      await expect.element(screen.container).toHaveTextContent('first-payload');
      await expect.element(screen.container).toHaveTextContent('second-payload');
    });

    it('should update when store state is modified', async () => {
      const store = new CallStore();
      const screen = render(TestCallStoreComponent, {
        store,
      });

      const promise = store.call('initial-payload');
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('initial-payload');

      store.update(promise, 'updated-payload');
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('updated-payload');
    });

    it('should update when store state is resolved', async () => {
      const store = new CallStore();
      const screen = render(TestCallStoreComponent, {
        store,
      });

      const promise = store.call('test-payload');
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      await screen.getByTestId('resolve').click();
      await expect(promise).resolves.toBe(true);
      await expect.element(screen.getByTestId('call')).not.toBeInTheDocument();
    });

    it('should update when store state is rejected', async () => {
      const store = new CallStore();
      const screen = render(TestCallStoreComponent, {
        store,
      });

      const promise = store.call('test-payload');
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      // We need to await both the click and the rejection in parallel
      // Otherwise the rejection might happen before we start listening for it.
      await Promise.all([
        expect(promise).rejects.toBe('error'),
        screen.getByTestId('reject').click(),
      ]);

      await expect.element(screen.getByTestId('call')).not.toBeInTheDocument();
    });
  });

  describe('event listener management', () => {
    it('should subscribe to store events on mount', () => {
      const store = new CallStore();
      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');

      render(TestCallStoreComponent, {
        store,
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from store events on cleanup', () => {
      const store = new CallStore();
      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      const { unmount } = render(TestCallStoreComponent, {
        store,
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
      const store = new CallStore({ unmountingDelay: 50 });
      const screen = render(TestCallStoreComponent, {
        store,
      });

      const promise = store.call('test-payload');

      await screen.getByTestId('resolve').click();
      await expect(promise).resolves.toBe(true);

      await expect.element(screen.getByTestId('call')).toBeInTheDocument();

      await new Promise((resolve) => setTimeout(resolve, 60));

      await expect.element(screen.getByTestId('call')).not.toBeInTheDocument();
    });
  });
});

describe('SingletonCallStore', () => {
  describe('class', () => {
    it('should extend CoreSingletonCallStore', () => {
      const store = new SingletonCallStore();

      expect(store).toBeInstanceOf(CoreSingletonCallStore);
      expect(store).toBeInstanceOf(SingletonCallStore);
    });

    it('should accept constructor options', () => {
      const store = new SingletonCallStore({ unmountingDelay: 100 });

      expect(store).toBeInstanceOf(SingletonCallStore);
    });

    it('should create a new instance each time', () => {
      const store1 = new SingletonCallStore();
      const store2 = new SingletonCallStore();

      expect(store1).not.toBe(store2);
      expect(store1).toBeInstanceOf(SingletonCallStore);
      expect(store2).toBeInstanceOf(SingletonCallStore);
    });
  });

  describe('reactivity', () => {
    it('should return initial state', async () => {
      const store = new SingletonCallStore();
      const screen = render(TestSingletonCallStoreComponent, {
        store,
      });

      await expect.element(screen.container).toHaveTextContent('null');
    });

    it('should update when store state changes', async () => {
      const store = new SingletonCallStore();
      const screen = render(TestSingletonCallStoreComponent, {
        store,
      });

      store.call('test-payload');

      await expect.element(screen.getByTestId('current')).toHaveTextContent('test-payload');
    });

    it('should update when store state changes multiple times', async () => {
      const store = new SingletonCallStore();
      const screen = render(TestSingletonCallStoreComponent, {
        store,
      });

      store.call('first-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('first-payload');

      store.call('second-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('second-payload');
    });

    it('should update when store state is modified', async () => {
      const store = new SingletonCallStore();
      const screen = render(TestSingletonCallStoreComponent, {
        store,
      });

      store.call('initial-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('initial-payload');

      store.update('updated-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('updated-payload');
    });

    it('should update when store state is resolved', async () => {
      const store = new SingletonCallStore();
      const screen = render(TestSingletonCallStoreComponent, {
        store,
      });

      store.call('test-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('test-payload');

      await screen.getByTestId('resolve').click();

      await expect.element(screen.getByTestId('current')).toHaveTextContent('null');
    });

    it('should update when store state is rejected', async () => {
      const store = new SingletonCallStore();
      const screen = render(TestSingletonCallStoreComponent, {
        store,
      });

      const promise = store.call('test-payload');
      await expect.element(screen.getByTestId('current')).toHaveTextContent('test-payload');

      // We need to await both the click and the rejection in parallel
      // Otherwise the rejection might happen before we start listening for it.
      await Promise.all([
        expect(promise).rejects.toBe('error'),
        screen.getByTestId('reject').click(),
      ]);

      await expect.element(screen.getByTestId('current')).toHaveTextContent('null');
    });
  });

  describe('event listener management', () => {
    it('should subscribe to store events on mount', () => {
      const store = new SingletonCallStore();
      const addEventListenerSpy = vi.spyOn(store, 'addEventListener');

      render(TestSingletonCallStoreComponent, {
        store,
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('add', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('update', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('settled', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('resolve', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('reject', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from store events on cleanup', () => {
      const store = new SingletonCallStore();
      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      const { unmount } = render(TestSingletonCallStoreComponent, {
        store,
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
      const store = new SingletonCallStore({ unmountingDelay: 50 });
      const screen = render(TestSingletonCallStoreComponent, {
        store,
      });

      store.call('test-payload');

      await screen.getByTestId('resolve').click();

      await expect.element(screen.getByTestId('current')).toHaveTextContent('test-payload');

      await new Promise((resolve) => setTimeout(resolve, 60));

      await expect.element(screen.getByTestId('current')).toHaveTextContent('null');
    });
  });
});
