import { beforeEach, describe, expect, it, vi } from "vitest";
import { CallStore } from "./call-store";

// We polyfill `Promise.withResolvers` because it is not available in Node environment.
import "@ungap/with-resolvers";

let store: CallStore;

beforeEach(() => {
  store = new CallStore();
});

describe("CallStore", () => {
  describe("Initialization", () => {
    it("should create a new store", () => {
      expect(store).toBeInstanceOf(CallStore);
    });
  });

  describe("Create", () => {
    it("should be able to add a promise entry and resolve it", async () => {
      const entry = store.call("payload");

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.payload).toBe("payload");
      expect(entry.safe).toBe(false);
      expect(entry.promise).toBeInstanceOf(Promise);
      expect(entry.resolve).toBeDefined();
      expect(entry.reject).toBeDefined();

      expect(store.entries).toHaveLength(1);
      expect(store.entries[0]).toBe(entry);

      entry.resolve("value");

      await expect(entry.promise).resolves.toBe("value");
    });

    it("should be able to add a safe promise entry and resolve it", async () => {
      const entry = store.callSafe("payload");

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.payload).toBe("payload");
      expect(entry.safe).toBe(true);
      expect(entry.promise).toBeInstanceOf(Promise);
      expect(entry.resolve).toBeDefined();
      expect(entry.reject).toBeDefined();

      expect(store.entries).toHaveLength(1);
      expect(store.entries[0]).toBe(entry);

      entry.resolve("value");

      await expect(entry.promise).resolves.toEqual({ ok: true, data: "value" });
    });

    it("should be able to add a promise entry and reject it", async () => {
      const entry = store.call("payload");

      entry.reject("reason");

      await expect(entry.promise).rejects.toThrow("reason");
    });

    it("should be able to add a safe promise entry and reject without throwing", async () => {
      const entry = store.callSafe("payload");

      entry.reject("reason");

      await expect(entry.promise).resolves.toEqual({
        ok: false,
        reason: "reason",
      });
    });

    it("should be able to reject with an error", async () => {
      const entry = store.call("payload");

      entry.reject(new Error("reason"));

      await expect(entry.promise).rejects.toThrow("reason");
    });

    it("should maintain the correct order of promise resolution", async () => {
      const entry1 = store.call("payload1");
      const entry2 = store.call("payload2");

      entry2.resolve("value2");
      entry1.resolve("value1");

      await expect(entry2.promise).resolves.toBe("value2");
      await expect(entry1.promise).resolves.toBe("value1");
    });
  });

  describe("Read", () => {
    it("should be able to retrieve a promise entry by id", () => {
      const entry = store.call("payload");

      expect(store.get(entry.id)).toBe(entry);
    });

    it("should return undefined if the promise entry is not found by id", () => {
      expect(store.get(0)).toBeUndefined();
    });

    it("should be able to retrieve all promise entries", () => {
      const entry1 = store.call("payload1");
      const entry2 = store.call("payload2");

      expect(store.getAll()).toEqual([entry1, entry2]);
    });

    it("should return an empty array if there are no promise entries", () => {
      expect(store.getAll()).toEqual([]);
    });
  });

  describe("Update", () => {
    it("should be able to update a promise entry", () => {
      const entry = store.call("payload");

      store.update(entry.id, "updated");

      const updatedEntry = store.get(entry.id);

      expect(updatedEntry).toBeDefined();
      expect(updatedEntry?.payload).toBe("updated");
    });

    it("should handle updating a non-existent promise entry gracefully", () => {
      store.update(0, "updated");

      expect(() => store.update(0, "updated")).not.toThrow();
    });
  });

  describe("Delete", () => {
    it("should be able to delete a promise entry by id", () => {
      const entry = store.call("payload");

      store.delete(entry.id);

      expect(store.entries).toHaveLength(0);
      expect(store.get(entry.id)).toBeUndefined();
    });

    it("should handle deleting a non-existent promise entry gracefully", () => {
      expect(() => store.delete(0)).not.toThrow();
    });

    it("should clear all promise entries", () => {
      const entry1 = store.call("payload");
      const entry2 = store.call("payload");

      expect(store.entries).toHaveLength(2);
      expect(store.get(entry1.id)).toBeDefined();
      expect(store.get(entry2.id)).toBeDefined();

      store.clear();

      expect(store.entries).toHaveLength(0);
      expect(store.get(entry1.id)).toBeUndefined();
      expect(store.get(entry2.id)).toBeUndefined();
    });
  });

  describe("Event", () => {
    it("should dispatch add events when adding a promise entry", () => {
      const addListener = vi.fn();

      store.addEventListener("add", addListener);

      const entry = store.call("payload");

      expect(addListener).toBeCalledTimes(1);
      expect(addListener).toBeCalledWith({
        type: "add",
        entry,
      });
    });

    it("should dispatch update events when updating a promise entry", () => {
      const updateListener = vi.fn();

      store.addEventListener("update", updateListener);

      const entry = store.call("payload");
      store.update(entry.id, "updated");

      expect(updateListener).toBeCalledTimes(1);
      expect(updateListener).toBeCalledWith({
        type: "update",
        entry: expect.objectContaining({
          id: entry.id,
          payload: "updated",
        }),
      });
    });

    it("should dispatch resolve events when resolving a promise entry", async () => {
      const resolveListener = vi.fn();

      store.addEventListener("resolve", resolveListener);

      const entry = store.call("payload");
      entry.resolve("value");

      await expect(entry.promise).resolves.toBe("value");

      expect(resolveListener).toBeCalledTimes(1);
      expect(resolveListener).toBeCalledWith({
        type: "resolve",
        entry,
      });
    });

    it("should dispatch reject events when rejecting a promise entry", async () => {
      const rejectListener = vi.fn();

      store.addEventListener("reject", rejectListener);

      const entry = store.call("payload");
      entry.reject("reason");

      await expect(entry.promise).rejects.toThrow("reason");

      expect(rejectListener).toBeCalledTimes(1);
      expect(rejectListener).toBeCalledWith({
        type: "reject",
        entry,
      });
    });

    it("should dispatch delete events when deleting a promise entry", () => {
      const deleteListener = vi.fn();

      store.addEventListener("delete", deleteListener);

      const entry = store.call("payload");
      store.delete(entry.id);

      expect(deleteListener).toBeCalledTimes(1);
      expect(deleteListener).toBeCalledWith({
        type: "delete",
        entry,
      });
    });

    it("should dispatch clear events when clearing all promise entries", () => {
      const clearListener = vi.fn();

      store.addEventListener("clear", clearListener);

      const entry1 = store.call("payload1");
      const entry2 = store.call("payload2");
      store.clear();

      expect(clearListener).toBeCalledTimes(1);
      expect(clearListener).toBeCalledWith({
        type: "clear",
        entries: [entry1, entry2],
      });
    });

    it("should be able to add and remove event listeners", () => {
      const addListener = vi.fn();

      store.addEventListener("add", addListener);
      store.call("payload");
      expect(addListener).toBeCalledTimes(1);

      store.removeEventListener("add", addListener);
      store.call("payload");
      expect(addListener).toBeCalledTimes(1);
    });

    it("should be able to remove all event listeners", () => {
      const addListener = vi.fn();
      const updateListener = vi.fn();

      store.addEventListener("add", addListener);
      store.addEventListener("update", updateListener);

      store.removeEventListener("add", addListener);
      store.removeEventListener("update", updateListener);

      store.call("payload");
      expect(addListener).not.toBeCalled();

      const entry = store.call("payload");
      store.update(entry.id, "updated");
      expect(updateListener).not.toBeCalled();
    });
  });
});
