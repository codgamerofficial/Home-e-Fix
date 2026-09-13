import test from "node:test";
import assert from "node:assert/strict";
import { useUIStore } from "../src/store/ui.store";

test("Search State - UI Store handles open, close, and toggle transitions", () => {
  const store = useUIStore.getState();

  // Reset to false
  store.setSearchOpen(false);
  assert.equal(useUIStore.getState().searchOpen, false);

  // Open
  store.setSearchOpen(true);
  assert.equal(useUIStore.getState().searchOpen, true);

  // Close
  store.setSearchOpen(false);
  assert.equal(useUIStore.getState().searchOpen, false);
});
