import { describe, expectTypeOf, it } from 'vitest';

import {
  CallStore,
  type CallOptions,
  type CallStackSafe,
  type CallStackUnsafe,
} from './call-store';

describe('CallStore', () => {
  it('should infer correct types for call', () => {
    const store = new CallStore<string, number, string>();

    expectTypeOf(store.call).toEqualTypeOf<
      (payload: string, options?: CallOptions) => CallStackUnsafe<string, number, string>
    >();
  });

  it('should infer correct types for callSafe', () => {
    const store = new CallStore<string, number, string>();

    expectTypeOf(store.callSafe).toEqualTypeOf<
      (payload: string, options?: CallOptions) => CallStackSafe<string, number, string>
    >();
  });
});
