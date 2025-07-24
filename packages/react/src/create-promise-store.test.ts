import { act, renderHook } from "@testing-library/react";
import { PromiseStore } from "@use-ask/core";
import { describe, expect, it, vi } from "vitest";
import { createPromiseStore } from "./create-promise-store";

// We polyfill `Promise.withResolvers` because it is not available in Node environment.
import "@ungap/with-resolvers";

describe("createPromiseStore", () => {
  describe("Initialization", () => {
    it("should create a new store and use snapshot hook", () => {
      const [store, useEntries] = createPromiseStore();

      expect(store).toBeInstanceOf(PromiseStore);
      expect(useEntries).toBeInstanceOf(Function);
    });
  });

  describe("Store Operations", () => {
    it("should reflect store changes in entries", () => {
      const [store, useEntries] = createPromiseStore();

      const { result } = renderHook(() => useEntries());

      act(() => {
        store.add("test");
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].payload).toBe("test");
    });

    it("should handle promise resolution", async () => {
      const [store, useEntries] = createPromiseStore();

      const { result } = renderHook(() => useEntries());

      act(() => {
        const entry = store.add("test");

        store.get(entry.id)?.resolve("success");
      });

      await expect(result.current[0].promise).resolves.toBe("success");
    });

    it("should handle promise rejection", async () => {
      const [store, useEntries] = createPromiseStore();

      const { result } = renderHook(() => useEntries());

      act(() => {
        const entry = store.add("test");

        store.get(entry.id)?.reject("error");
      });

      await expect(result.current[0].promise).rejects.toThrow("error");
    });

    it("should handle safe promise resolution", async () => {
      const [store, useEntries] = createPromiseStore();

      const { result } = renderHook(() => useEntries());

      act(() => {
        const entry = store.addSafe("test");

        store.get(entry.id)?.resolve("success");
      });

      await expect(result.current[0].promise).resolves.toEqual({
        ok: true,
        data: "success",
      });
    });

    it("should handle safe promise rejection", async () => {
      const [store, useEntries] = createPromiseStore();

      const { result } = renderHook(() => useEntries());

      act(() => {
        const entry = store.addSafe("test");

        store.get(entry.id)?.reject();
      });

      await expect(result.current[0].promise).resolves.toEqual({
        ok: false,
        reason: undefined,
      });
    });

    it("should update entries when store is cleared", () => {
      const [store, useEntries] = createPromiseStore();

      const { result } = renderHook(() => useEntries());

      act(() => {
        store.add("test1");
        store.add("test2");
      });

      expect(result.current).toHaveLength(2);

      act(() => {
        store.clear();
      });

      expect(result.current).toHaveLength(0);
    });

    it("should cleanup event listeners when hook unmounts", () => {
      const [store, useEntries] = createPromiseStore();
      const { unmount } = renderHook(() => useEntries());

      const removeEventListenerSpy = vi.spyOn(store, "removeEventListener");

      unmount();

      for (const event of [
        "add",
        "update",
        "resolve",
        "reject",
        "delete",
        "clear",
      ]) {
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          event,
          expect.any(Function)
        );
      }
      removeEventListenerSpy.mockRestore();
    });
  });
});
