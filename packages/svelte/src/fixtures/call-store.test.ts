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

      const callStack = store.call('test');

      await screen.getByTestId('resolve').click();

      await expect(callStack.promise).resolves.toBe(true);
    });

    it('should handle promise rejection', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      const callStack = store.call('test');

      await screen.getByTestId('reject').click();

      await expect(callStack.promise).rejects.toThrow();
    });

    it('should handle safe promise resolution', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      const callStack = store.callSafe('test');

      await screen.getByTestId('resolve').click();

      await expect(callStack.promise).resolves.toEqual({
        ok: true,
        data: true,
      });
    });

    it('should handle safe promise rejection', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      const callStack = store.callSafe('test');

      await screen.getByTestId('reject').click();

      await expect(callStack.promise).resolves.toEqual({
        ok: false,
        reason: undefined,
      });
    });

    it('should update call stacks when store is cleared', async () => {
      const store = new CallStore();

      const screen = render(Component, {
        store,
      });

      store.call('test1');
      store.call('test2');

      await expect.poll(() => screen.getByTestId('callStack').elements().length).toBe(2);

      store.clear();

      await expect.poll(() => screen.getByTestId('callStack').elements().length).toBe(0);
    });

    it('should cleanup event listeners when component unmounts', () => {
      const store = new CallStore();

      const removeEventListenerSpy = vi.spyOn(store, 'removeEventListener');

      const screen = render(Component, {
        store,
      });

      screen.unmount();

      for (const event of ['add', 'update', 'settled', 'resolve', 'reject', 'delete', 'clear']) {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(event, expect.any(Function));
      }
      removeEventListenerSpy.mockRestore();
    });
  });
});
