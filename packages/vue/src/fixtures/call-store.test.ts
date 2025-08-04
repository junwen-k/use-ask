import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-vue';

import { createCallStore } from '../create-call-store';
import Component from './call-store.vue';

describe('createCallStore', () => {
  describe('when creating a call store', () => {
    it('should return a store instance and a hook function', () => {
      const [store, useCallStore] = createCallStore();

      expect(store).toBeDefined();
      expect(useCallStore).toBeInstanceOf(Function);
    });

    it('should accept constructor options', () => {
      const [store] = createCallStore({ unmountingDelay: 100 });

      expect(store).toBeDefined();
    });
  });

  describe('when using the hook', () => {
    it('should return an empty stack when no calls exist', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      await expect.element(screen.container).toHaveTextContent('');
    });

    it('should return the call stack when calls exist', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call('test-payload');

      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('test-payload');
    });

    it('should update when new calls are added', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call('first-payload');

      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('first-payload');

      store.call('second-payload');

      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('first-payload');
      await expect.element(screen.getByTestId('payload-1')).toHaveTextContent('second-payload');
    });

    it('should update when call payloads are updated', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('initial-payload');

      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('initial-payload');

      store.update(promise, 'updated-payload');

      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('updated-payload');
    });

    it('should remove calls when they are resolved', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('test-payload');

      store.resolve(promise, 'success');
      await expect(promise).resolves.toBe('success');

      await expect.element(screen.getByTestId('call-0')).not.toBeInTheDocument();
    });

    it('should remove calls when they are rejected', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('test-payload');

      store.reject(promise, 'error');
      await expect(promise).rejects.toThrow('error');

      await expect.element(screen.getByTestId('call-0')).not.toBeInTheDocument();
    });

    it('should handle calls with unmounting delay', async () => {
      const [store] = createCallStore({ unmountingDelay: 50 });

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('test-payload');

      store.resolve(promise, 'success');
      await expect(promise).resolves.toBe('success');

      await expect.element(screen.getByTestId('call-0')).toBeInTheDocument();

      await new Promise((resolve) => setTimeout(resolve, 60));

      await expect.element(screen.getByTestId('call-0')).not.toBeInTheDocument();
    });
  });

  describe('when the component unmounts', () => {
    it('should cleanup event listeners', async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call('test-payload');
      await expect.element(screen.getByTestId('payload-0')).toHaveTextContent('test-payload');

      screen.unmount();

      const newPromise = store.call('new-payload');
      expect(newPromise).toBeDefined();
    });
  });
});
