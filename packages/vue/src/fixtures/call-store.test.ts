import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-vue";
import { createCallStore } from "../create-call-store";
import Component from "./call-store.vue";

describe("CallStore", () => {
  describe("Store Operations", () => {
    it("should reflect store changes in entries", async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call("test");

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");
    });

    it("should handle promise resolution", async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const entry = store.call("test");

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");

      entry?.resolve("success");
      await expect(entry?.promise).resolves.toBe("success");

      await expect.element(screen.getByTestId("entry")).not.toBeInTheDocument();
    });

    it("should handle promise rejection", async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const entry = store.call("test");

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");

      entry?.reject();

      await expect.element(screen.getByTestId("entry")).not.toBeInTheDocument();
    });

    it("should handle safe promise resolution", async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const entry = store.callSafe("test");

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");

      entry?.resolve("success");
      await expect(entry?.promise).resolves.toEqual({
        ok: true,
        data: "success",
      });

      await expect.element(screen.getByTestId("entry")).not.toBeInTheDocument();
    });

    it("should handle safe promise rejection", async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      const entry = store.callSafe("test");

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");

      entry?.reject();
      await expect(entry?.promise).resolves.toEqual({
        ok: false,
        reason: undefined,
      });

      await expect.element(screen.getByTestId("entry")).not.toBeInTheDocument();
    });

    it("should update entries when store is cleared", async () => {
      const [store] = createCallStore();

      const screen = render(Component, {
        props: {
          store,
        },
      });

      store.call("test");
      store.call("test");

      await expect
        .poll(() => screen.getByTestId("entry").elements().length)
        .toBe(2);

      store.clear();

      await expect
        .poll(() => screen.getByTestId("entry").elements().length)
        .toBe(0);
    });
  });
});
