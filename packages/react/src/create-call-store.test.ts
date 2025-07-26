import { act, renderHook } from "@testing-library/react";
import { CallStore } from "@ui-call/core";
import { describe, expect, it, vi } from "vitest";
import { createCallStore } from "./create-call-store";

// We polyfill `Promise.withResolvers` because it is not available in Node environment.
import "@ungap/with-resolvers";

describe("createCallStore", () => {
  describe("Initialization", () => {
    it("should create a new store and use snapshot hook", () => {
      const [store, useEntries] = createCallStore();

      expect(store).toBeInstanceOf(CallStore);
      expect(useEntries).toBeInstanceOf(Function);
    });
  });

  describe("Store Operations", () => {
    it("should reflect store changes in entries", () => {
      const [store, useEntries] = createCallStore();

      const { result } = renderHook(() => useEntries());

      act(() => {
        store.call("test");
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0].payload).toBe("test");
    });

    it("should handle promise resolution", async () => {
      const [store, useEntries] = createCallStore();

      const { result } = renderHook(() => useEntries());

      act(() => store.call("test"));
      expect(result.current).toHaveLength(1);

      const entry = store.get(result.current[0].id);
      expect(entry).toBeDefined();

      await act(async () => {
        entry?.resolve("success");
        await expect(entry?.promise).resolves.toBe("success");
      });

      expect(result.current).toHaveLength(0);
    });

    it("should handle promise rejection", async () => {
      const [store, useEntries] = createCallStore();

      const { result } = renderHook(() => useEntries());

      act(() => store.call("test"));
      expect(result.current).toHaveLength(1);

      const entry = store.get(result.current[0].id);
      expect(entry).toBeDefined();

      await act(async () => {
        entry?.reject("error");
        await expect(entry?.promise).rejects.toBe("error");
      });

      expect(result.current).toHaveLength(0);
    });

    it("should handle safe promise resolution", async () => {
      const [store, useEntries] = createCallStore();

      const { result } = renderHook(() => useEntries());

      act(() => store.callSafe("test"));
      expect(result.current).toHaveLength(1);

      const entry = store.get(result.current[0].id);
      expect(entry).toBeDefined();

      await act(async () => {
        entry?.resolve("success");
        await expect(entry?.promise).resolves.toEqual({
          ok: true,
          data: "success",
        });
      });

      expect(result.current).toHaveLength(0);
    });

    it("should handle safe promise rejection", async () => {
      const [store, useEntries] = createCallStore();

      const { result } = renderHook(() => useEntries());

      act(() => store.callSafe("test"));
      expect(result.current).toHaveLength(1);

      const entry = store.get(result.current[0].id);
      expect(entry).toBeDefined();

      await act(async () => {
        entry?.reject();
        await expect(entry?.promise).resolves.toEqual({
          ok: false,
          reason: undefined,
        });
      });
    });

    it("should update entries when store is cleared", () => {
      const [store, useEntries] = createCallStore();

      const { result } = renderHook(() => useEntries());

      act(() => {
        store.call("test1");
        store.call("test2");
      });
      expect(result.current).toHaveLength(2);

      act(() => store.clear());
      expect(result.current).toHaveLength(0);
    });

    it("should cleanup event listeners when hook unmounts", () => {
      const [store, useEntries] = createCallStore();
      const { unmount } = renderHook(() => useEntries());

      const removeEventListenerSpy = vi.spyOn(store, "removeEventListener");

      unmount();

      for (const event of [
        "add",
        "update",
        "settled",
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
