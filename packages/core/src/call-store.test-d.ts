import { describe, expectTypeOf, it } from 'vitest';

import { CallStore } from './call-store';
import type { CallOptions } from './call-store';

describe('CallStore', () => {
  it('should infer correct types for call', () => {
    const store = new CallStore<string, number, string>();

    expectTypeOf(store.call).toEqualTypeOf<
      (payload: string, options?: CallOptions) => Promise<number>
    >();
  });
});
