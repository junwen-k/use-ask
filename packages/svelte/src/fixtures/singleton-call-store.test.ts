import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { SingletonCallStore } from '../singleton-call-store';
import Component from './singleton-call-store.svelte';

describe('SingletonCallStore', () => {
  describe('when creating a singleton call store', () => {
    it('should create a store instance', () => {
      const store = new SingletonCallStore();

      expect(store).toBeInstanceOf(SingletonCallStore);
    });

    it('should accept constructor options', () => {
      const store = new SingletonCallStore({ unmountingDelay: 100 });

      expect(store).toBeInstanceOf(SingletonCallStore);
    });
  });

  describe('when using the store', () => {
    it('should return undefined when no current call exists', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');
    });

    it('should return the current call when it exists', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');
      await expect.element(screen.getByTestId('pending')).toHaveTextContent('true');
    });

    it('should update when the current call changes', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      const firstPromise = store.call('first-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('first-payload');

      const secondPromise = store.call('second-payload');

      // In Svelte, the singleton behavior updates the payload but returns the same promise
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('second-payload');
      expect(secondPromise).toBe(firstPromise);
    });

    it('should update when the current call payload is updated', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      store.call('initial-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('initial-payload');

      store.update('updated-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('updated-payload');
    });

    it('should return undefined when the current call is resolved', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      await screen.getByTestId('resolve').click();
      await expect(promise).resolves.toBe(true);

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');
    });

    it('should return undefined when the current call is rejected', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      await screen.getByTestId('reject').click();
      await expect(promise).rejects.toThrow();

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');
    });

    it('should create a new call after resolution', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      const firstPromise = store.call('first-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('first-payload');

      await screen.getByTestId('resolve').click();
      await expect(firstPromise).resolves.toBe(true);

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');

      const secondPromise = store.call('second-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('second-payload');
      expect(secondPromise).not.toBe(firstPromise);
    });

    it('should create a new call after rejection', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      const firstPromise = store.call('first-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('first-payload');

      await screen.getByTestId('reject').click();
      await expect(firstPromise).rejects.toThrow();

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');

      const secondPromise = store.call('second-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('second-payload');
      expect(secondPromise).not.toBe(firstPromise);
    });

    it('should handle calls with unmounting delay', async () => {
      const store = new SingletonCallStore({ unmountingDelay: 50 });

      const screen = render(Component, {
        store,
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      await screen.getByTestId('resolve').click();
      await expect(promise).resolves.toBe(true);

      // With unmounting delay, the call should still be visible but not pending
      await expect.element(screen.getByTestId('call')).toBeInTheDocument();
      await expect.element(screen.getByTestId('pending')).toHaveTextContent('false');

      // Wait for the unmounting delay to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Now the call should be removed
      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');
    });
  });

  describe('when the component unmounts', () => {
    it('should cleanup event listeners', () => {
      const store = new SingletonCallStore();

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      const screen = render(Component, {
        store,
      });

      screen.unmount();

      const expectedEvents = ['add', 'update', 'settled', 'resolve', 'reject'];
      expectedEvents.forEach((event) => {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
      });

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('singleton behavior', () => {
    it('should always return the same promise for multiple calls', async () => {
      const store = new SingletonCallStore();

      const screen = render(Component, {
        store,
      });

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(store.call(`payload-${i}`));
      }

      const firstPromise = promises[0];
      promises.forEach((promise) => {
        expect(promise).toBe(firstPromise);
      });

      // Should show the last payload (singleton behavior updates the payload)
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('payload-4');
    });
  });
});
