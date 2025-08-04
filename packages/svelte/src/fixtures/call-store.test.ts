import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { CallStore } from '../call-store';
import Component from './call-store.svelte';

describe('CallStore', () => {
  describe('when creating a call store', () => {
    it('should create a store instance', () => {
      const store = new CallStore();

      expect(store).toBeInstanceOf(CallStore);
    });

    it('should accept constructor options', () => {
      const store = new CallStore({ unmountingDelay: 100 });

      expect(store).toBeInstanceOf(CallStore);
    });
  });

  describe('when using the store', () => {
    it('should return an empty stack when no calls exist', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      // No calls should be rendered initially
      await expect.element(screen.container).toHaveTextContent('');
    });

    it('should return the call stack when calls exist', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');
    });

    it('should update when new calls are added', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      store.call('first-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('first-payload');

      store.call('second-payload');

      // Should show both calls - check that both payloads are visible
      await expect.element(screen.container).toHaveTextContent('first-payload');
      await expect.element(screen.container).toHaveTextContent('second-payload');
    });

    it('should update when call payloads are updated', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      const promise = store.call('initial-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('initial-payload');

      store.update(promise, 'updated-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('updated-payload');
    });

    it('should remove calls when they are resolved', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      await screen.getByTestId('resolve').click();

      await expect(promise).resolves.toBe(true);
      await expect.element(screen.getByTestId('call')).not.toBeInTheDocument();
    });

    it('should remove calls when they are rejected', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      await screen.getByTestId('reject').click();

      await expect(promise).rejects.toThrow();
      await expect.element(screen.getByTestId('call')).not.toBeInTheDocument();
    });

    it('should handle calls with unmounting delay', async () => {
      const store = new CallStore({ unmountingDelay: 50 });

      const screen = render(Component, {
        store,
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      await screen.getByTestId('resolve').click();
      await expect(promise).resolves.toBe(true);

      // With unmounting delay, the call should still be visible
      await expect.element(screen.getByTestId('call')).toBeInTheDocument();

      // Wait for the unmounting delay to expire
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Now the call should be removed
      await expect.element(screen.getByTestId('call')).not.toBeInTheDocument();
    });
  });

  describe('when the component unmounts', () => {
    it('should cleanup event listeners', () => {
      const store = new CallStore();

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
});
