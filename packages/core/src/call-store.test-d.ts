import { describe, expectTypeOf, it } from "vitest";
import {
  CallStore,
  type PromiseEntrySafe,
  type PromiseEntryUnsafe,
} from "./call-store";

describe("CallStore", () => {
  it("should infer correct types for add", () => {
    const store = new CallStore<string, number, string>();

    expectTypeOf(store.call).toEqualTypeOf<
      (payload: string) => PromiseEntryUnsafe<string, number, string>
    >();
  });

  it("should infer correct types for addSafe", () => {
    const store = new CallStore<string, number, string>();

    expectTypeOf(store.callSafe).toEqualTypeOf<
      (payload: string) => PromiseEntrySafe<string, number, string>
    >();
  });
});
