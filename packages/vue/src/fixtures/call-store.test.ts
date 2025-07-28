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

      const callStack = store.call('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');

      callStack?.resolve('success');
      await expect(callStack?.promise).resolves.toBe('success');

      await expect.element(screen.getByTestId('callStack')).not.toBeInTheDocument();
    });

    it('should handle promise rejection', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const callStack = store.call('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');

      callStack?.reject();

      await expect.element(screen.getByTestId('callStack')).not.toBeInTheDocument();
    });

    it('should handle safe promise resolution', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const callStack = store.callSafe('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');

      callStack?.resolve('success');
      await expect(callStack?.promise).resolves.toEqual({
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

      const callStack = store.callSafe('test');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test');

      callStack?.reject();
      await expect(callStack?.promise).resolves.toEqual({
        ok: false,
        reason: undefined,
      });

      await expect.element(screen.getByTestId('callStack')).not.toBeInTheDocument();
    });

    it('should update call stacks when store is cleared', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call('test');
      store.call('test');

      await expect.poll(() => screen.getByTestId('callStack').elements().length).toBe(2);

      store.clear();

      await expect.poll(() => screen.getByTestId('callStack').elements().length).toBe(0);
    });
  });
});
