import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-vue';

import { createSingletonCallStore } from '../create-singleton-call-store';
import Component from './singleton-call-store.vue';

describe('createSingletonCallStore', () => {
  describe('when creating a singleton call store', () => {
    it('should return a store instance and a hook function', () => {
      const [store, useSingletonCallStore] = createSingletonCallStore();

      expect(store).toBeDefined();
      expect(useSingletonCallStore).toBeInstanceOf(Function);
    });

    it('should accept constructor options', () => {
      const [store] = createSingletonCallStore({ unmountingDelay: 100 });

      expect(store).toBeDefined();
    });
  });

  describe('when using the hook', () => {
    it('should return undefined when no current call exists', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');
    });

    it('should return the current call when it exists', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');
      await expect.element(screen.getByTestId('pending')).toHaveTextContent('true');
    });

    it('should update when the current call changes', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const firstPromise = store.call('first-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('first-payload');

      const secondPromise = store.call('second-payload');

      // In Vue, the singleton behavior updates the payload but returns the same promise
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('second-payload');
      expect(secondPromise).toBe(firstPromise);
    });

    it('should update when the current call payload is updated', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call('initial-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('initial-payload');

      store.update('updated-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('updated-payload');
    });

    it('should return undefined when the current call is resolved', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      store.resolve('success');
      await expect(promise).resolves.toBe('success');

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');
    });

    it('should return undefined when the current call is rejected', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      store.reject('error');
      await expect(promise).rejects.toThrow('error');

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');
    });

    it('should create a new call after resolution', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const firstPromise = store.call('first-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('first-payload');

      store.resolve('success');
      await expect(firstPromise).resolves.toBe('success');

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');

      const secondPromise = store.call('second-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('second-payload');
      expect(secondPromise).not.toBe(firstPromise);
    });

    it('should create a new call after rejection', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const firstPromise = store.call('first-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('first-payload');

      store.reject('error');
      await expect(firstPromise).rejects.toThrow('error');

      await expect.element(screen.getByTestId('no-call')).toHaveTextContent('No current call');

      const secondPromise = store.call('second-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('second-payload');
      expect(secondPromise).not.toBe(firstPromise);
    });

    it('should handle calls with unmounting delay', async () => {
      const [store] = createSingletonCallStore({ unmountingDelay: 50 });

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const promise = store.call('test-payload');

      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      store.resolve('success');
      await expect(promise).resolves.toBe('success');

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
    it('should cleanup event listeners', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      // Trigger some activity to ensure listeners are attached
      store.call('test-payload');
      await expect.element(screen.getByTestId('payload')).toHaveTextContent('test-payload');

      // Unmount the component
      screen.unmount();

      // The store should still work after unmount
      const newPromise = store.call('new-payload');
      expect(newPromise).toBeDefined();
    });
  });

  describe('singleton behavior', () => {
    it('should always return the same promise for multiple calls', async () => {
      const [store] = createSingletonCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
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
