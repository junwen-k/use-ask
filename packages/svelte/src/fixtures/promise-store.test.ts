import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { PromiseStore } from "../promise-store";
import Component from "./promise-store.svelte";

describe("PromiseStore", () => {
  describe("Store Operations", () => {
    it("should reflect store changes in entries", async () => {
      const store = new PromiseStore();

      const screen = render(Component, {
        store,
      });

      store.add("test");

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");
    });

    it("should handle promise resolution", async () => {
      const store = new PromiseStore();

      const screen = render(Component, {
        store,
      });

      const entry = store.add("test");

      await screen.getByTestId("resolve").click();

      await expect(entry.promise).resolves.toBe(true);
    });

    it("should handle promise rejection", async () => {
      const store = new PromiseStore();

      const screen = render(Component, {
        store,
      });

      const entry = store.add("test");

      await screen.getByTestId("reject").click();

      await expect(entry.promise).rejects.toThrow();
    });

    it("should handle safe promise resolution", async () => {
      const store = new PromiseStore();

      const screen = render(Component, {
        store,
      });

      const entry = store.addSafe("test");

      await screen.getByTestId("resolve").click();

      await expect(entry.promise).resolves.toEqual({
        ok: true,
        data: true,
      });
    });

    it("should handle safe promise rejection", async () => {
      const store = new PromiseStore();

      const screen = render(Component, {
        store,
      });

      const entry = store.addSafe("test");

      await screen.getByTestId("reject").click();

      await expect(entry.promise).resolves.toEqual({
        ok: false,
        reason: undefined,
      });
    });

    it("should update entries when store is cleared", async () => {
      const store = new PromiseStore();

      const screen = render(Component, {
        store,
      });

      store.add("test1");
      store.add("test2");

      await expect
        .poll(() => screen.getByTestId("entry").elements().length)
        .toBe(2);

      store.clear();

      await expect
        .poll(() => screen.getByTestId("entry").elements().length)
        .toBe(0);
    });

    it("should cleanup event listeners when component unmounts", () => {
      const store = new PromiseStore();

      const removeEventListenerSpy = vi.spyOn(store, "removeEventListener");

      const screen = render(Component, {
        store,
      });

      screen.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );
      removeEventListenerSpy.mockRestore();
    });
  });
});
