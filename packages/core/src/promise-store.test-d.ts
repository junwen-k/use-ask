import { describe, expectTypeOf, it } from "vitest";
import {
  type PromiseEntrySafe,
  type PromiseEntryUnsafe,
  PromiseStore,
} from "./promise-store";

describe("PromiseStore", () => {
  it("should infer correct types for add", () => {
    const store = new PromiseStore<string, number, string>();

    expectTypeOf(store.add).toEqualTypeOf<
      (payload: string) => PromiseEntryUnsafe<string, number, string>
    >();
  });

  it("should infer correct types for addSafe", () => {
    const store = new PromiseStore<string, number, string>();

    expectTypeOf(store.addSafe).toEqualTypeOf<
      (payload: string) => PromiseEntrySafe<string, number, string>
    >();
  });
});
