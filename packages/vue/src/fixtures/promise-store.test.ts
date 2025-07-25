import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-vue";
import Component from "./promise-store.vue";

describe("PromiseStore", () => {
  describe("Store Operations", () => {
    it("should reflect store changes in entries", async () => {
      const screen = render(Component);

      await screen.getByTestId("add").click();

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");
    });

    it("should handle promise resolution", async () => {
      const screen = render(Component);

      await screen.getByTestId("add").click();

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");

      await screen.getByTestId("resolve").click();

      await expect.element(screen.getByTestId("entry")).not.toBeInTheDocument();
    });

    it("should handle promise rejection", async () => {
      const screen = render(Component);

      await screen.getByTestId("add").click();

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");

      await screen.getByTestId("reject").click();

      await expect.element(screen.getByTestId("entry")).not.toBeInTheDocument();
    });

    it("should handle safe promise resolution", async () => {
      const screen = render(Component);

      await screen.getByTestId("addSafe").click();

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");

      await screen.getByTestId("resolve").click();

      await expect.element(screen.getByTestId("entry")).not.toBeInTheDocument();
    });

    it("should handle safe promise rejection", async () => {
      const screen = render(Component);

      await screen.getByTestId("addSafe").click();

      await expect
        .element(screen.getByTestId("payload"))
        .toHaveTextContent("test");

      await screen.getByTestId("reject").click();

      await expect.element(screen.getByTestId("entry")).not.toBeInTheDocument();
    });

    it("should update entries when store is cleared", async () => {
      const screen = render(Component);

      await screen.getByTestId("add").click();
      await screen.getByTestId("add").click();

      await expect
        .poll(() => screen.getByTestId("entry").elements().length)
        .toBe(2);

      await screen.getByTestId("clear").click();

      await expect
        .poll(() => screen.getByTestId("entry").elements().length)
        .toBe(0);
    });
  });
});
