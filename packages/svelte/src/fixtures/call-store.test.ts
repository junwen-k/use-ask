import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { CallStore } from '../call-store';
import Component from './call-store.svelte';

describe('CallStore', () => {
  describe('Store Operations', () => {
    it('should reflect store changes in call stacks', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      store.call('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');
    });

    it('should handle promise resolution', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      const promise = store.call('test');

      await screen.getByTestId('resolve').click();

      await expect(promise).resolves.toBe(true);
    });

    it('should handle promise rejection', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      const promise = store.call('test');

      await screen.getByTestId('reject').click();

      await expect(promise).rejects.toThrow();
    });

    it('should cleanup event listeners when component unmounts', () => {
      const store = new CallStore();

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      const screen = render(Component, {
        store,
      });

      screen.unmount();

      for (const event of ['add', 'update', 'settled', 'resolve', 'reject']) {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
      }
      removeEventListenerSpy.mockRestore();
    });
  });
});
