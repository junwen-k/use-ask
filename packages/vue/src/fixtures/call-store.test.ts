import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-vue';

import { createCallStore } from '../create-call-store';
import Component from './call-store.vue';

describe('CallStore', () => {
  describe('Store Operations', () => {
    it('should reflect store changes in call stacks', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');
    });

    it('should handle promise resolution', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');

      store.resolve(promise, 'success');
      await expect(promise).resolves.toBe('success');

      await expect.element(screen.getByTestId('callStack')).not.toBeInTheDocument();
    });

    it('should handle promise rejection', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');

      store.reject(promise, 'error');
      await expect(promise).rejects.toThrow('error');

      await expect.element(screen.getByTestId('callStack')).not.toBeInTheDocument();
    });

    it('should handle safe promise resolution', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.callSafe('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');

      store.resolve(promise, 'success');
      await expect(promise).resolves.toEqual({
        ok: true,
        data: 'success',
      });

      await expect.element(screen.getByTestId('callStack')).not.toBeInTheDocument();
    });

    it('should handle safe promise rejection', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.callSafe('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');

      store.reject(promise);
      await expect(promise).resolves.toEqual({
        ok: false,
        reason: undefined,
      });

      await expect.element(screen.getByTestId('callStack')).not.toBeInTheDocument();
    });
  });
});
