import { CallStore, SingletonCallStore } from '@ui-call/core';
import { describe, expect, it } from 'vitest';
import { isReactive, reactive } from 'vue';

import { createCallStore, createSingletonCallStore } from './create-store';

describe('createCallStore', () => {
  describe('factory function', () => {
    it('should return a CallStore instance', () => {
      const store = createCallStore();

      expect(store).toBeInstanceOf(CallStore);
    });

    it('should accept constructor options', () => {
      const store = createCallStore({ unmountingDelay: 100 });

      expect(store).toBeInstanceOf(CallStore);
    });

    it('should create a new instance each time', () => {
      const store1 = createCallStore();
      const store2 = createCallStore();

      expect(store1).not.toBe(store2);
      expect(store1).toBeInstanceOf(CallStore);
      expect(store2).toBeInstanceOf(CallStore);
    });

    it('should return a non-proxied store instance', () => {
      const store = createCallStore();

      expect(isReactive(store)).toBe(false);
    });

    it('should return a non-proxied store instance when wrapped in reactive', () => {
      const store = createCallStore();
      const reactiveWrapper = reactive({ store });

      expect(isReactive(reactiveWrapper)).toBe(true);
      expect(isReactive(reactiveWrapper.store)).toBe(false);
    });
  });
});

describe('createSingletonCallStore', () => {
  describe('factory function', () => {
    it('should return a SingletonCallStore instance', () => {
      const store = createSingletonCallStore();

      expect(store).toBeInstanceOf(SingletonCallStore);
    });

    it('should accept constructor options', () => {
      const store = createSingletonCallStore({ unmountingDelay: 100 });

      expect(store).toBeInstanceOf(SingletonCallStore);
    });

    it('should create a new instance each time', () => {
      const store1 = createSingletonCallStore();
      const store2 = createSingletonCallStore();

      expect(store1).not.toBe(store2);
      expect(store1).toBeInstanceOf(SingletonCallStore);
      expect(store2).toBeInstanceOf(SingletonCallStore);
    });

    it('should return a non-proxied store instance', () => {
      const store = createSingletonCallStore();

      expect(isReactive(store)).toBe(false);
    });

    it('should return a non-proxied store instance when wrapped in reactive', () => {
      const store = createSingletonCallStore();
      const reactiveWrapper = reactive({ store });

      expect(isReactive(reactiveWrapper)).toBe(true);
      expect(isReactive(reactiveWrapper.store)).toBe(false);
    });
  });
});
