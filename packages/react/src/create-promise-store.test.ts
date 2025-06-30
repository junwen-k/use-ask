import { renderHook } from '@testing-library/react';
import { PromiseStore } from '@use-ask/core';
import { describe, expect, it } from 'vitest';

import { createPromiseStore } from './create-promise-store';

// TODO: test strict typing

describe('createPromiseStore', () => {
  it('should create store with initial payload', () => {
    const initialPayload = { test: 'data' };
    const { result } = renderHook(() => {
      const [store, snapshot] = createPromiseStore(initialPayload);
      return { store, snapshot };
    });

    expect(result.current.store).toBeDefined();
    expect(result.current.store.getSnapshot()[0].payload).toBe(initialPayload);
  });

  it('should create store without initial payload', () => {
    const { result } = renderHook(() => {
      const [store, snapshot] = createPromiseStore();
      return { store, snapshot };
    });

    expect(result.current.store).toBeDefined();
    expect(result.current.store.getSnapshot()[0].payload).toBeUndefined();
  });

  it('should return store and snapshot function', () => {
    const { result } = renderHook(() => {
      const [store, getSnapshot] = createPromiseStore();
      return { store, getSnapshot };
    });

    expect(result.current.store).toBeInstanceOf(PromiseStore);
    expect(result.current.getSnapshot).toBeInstanceOf(Function);
  });
});
