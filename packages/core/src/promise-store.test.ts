import { beforeEach, describe, expect, it } from 'vitest';

import { PromiseStore } from './promise-store';

// We polyfill `Promise.withResolvers` because it is not available in Node environment.
// For more information, see https://github.com/vitest-dev/vitest/discussions/5512#discussioncomment-9054811.
import '@ungap/with-resolvers';

it('should initialize correctly', () => {
  const store = new PromiseStore();
  const [payload, { pending, cancel, ok }] = store.getSnapshot();

  expect(payload).toEqual({ key: 0, payload: undefined });
  expect(pending).toBe(false);
  expect(cancel).toBeInstanceOf(Function);
  expect(ok).toBeInstanceOf(Function);
});

describe('safeCreate', () => {
  let store: PromiseStore<string>;
  let answerPromise: ReturnType<PromiseStore<string>['safeCreate']>;

  beforeEach(() => {
    store = new PromiseStore<string>();
    answerPromise = store.safeCreate('test');
  });

  it('should resolve with data when promise resolves', async () => {
    const [, { pending }] = store.getSnapshot();
    expect(pending).toBe(true);

    store.getSnapshot()[1].ok('success');

    await expect(answerPromise).resolves.toEqual({
      ok: true,
      data: 'success',
    });

    const [, { pending: pendingAfter }] = store.getSnapshot();
    expect(pendingAfter).toBe(false);
  });

  it('should resolve without throwing when promise is cancelled without reason', async () => {
    const [, { pending }] = store.getSnapshot();
    expect(pending).toBe(true);

    store.getSnapshot()[1].cancel();

    await expect(answerPromise).resolves.toEqual({
      ok: false,
      reason: undefined,
    });

    const [, { pending: pendingAfter }] = store.getSnapshot();
    expect(pendingAfter).toBe(false);
  });

  it('should resolve with custom reason when promise is cancelled with a reason', async () => {
    const [, { pending }] = store.getSnapshot();
    expect(pending).toBe(true);

    store.getSnapshot()[1].cancel(new Error('reason'));

    await expect(answerPromise).resolves.toEqual({
      ok: false,
      reason: new Error('reason'),
    });

    const [, { pending: pendingAfter }] = store.getSnapshot();
    expect(pendingAfter).toBe(false);
  });
});

describe('create', () => {
  let store: PromiseStore<string>;
  let answerPromise: ReturnType<PromiseStore<string>['create']>;

  beforeEach(() => {
    store = new PromiseStore<string>();
    answerPromise = store.create('test');
  });

  it('should resolve with data when promise resolves', async () => {
    const [, { pending }] = store.getSnapshot();
    expect(pending).toBe(true);

    store.getSnapshot()[1].ok('success');

    await expect(answerPromise).resolves.toBe('success');

    const [, { pending: pendingAfter }] = store.getSnapshot();
    expect(pendingAfter).toBe(false);
  });

  it('should reject when promise is cancelled without reason', async () => {
    const [, { pending }] = store.getSnapshot();
    expect(pending).toBe(true);

    store.getSnapshot()[1].cancel();

    await expect(answerPromise).rejects.toBeUndefined();

    const [, { pending: pendingAfter }] = store.getSnapshot();
    expect(pendingAfter).toBe(false);
  });

  it('should reject with custom reason when promise is cancelled with a reason', async () => {
    const [, { pending }] = store.getSnapshot();
    expect(pending).toBe(true);

    store.getSnapshot()[1].cancel(new Error('reason'));

    await expect(answerPromise).rejects.toEqual(new Error('reason'));

    const [, { pending: pendingAfter }] = store.getSnapshot();
    expect(pendingAfter).toBe(false);
  });
});
