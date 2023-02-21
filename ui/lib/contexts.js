
import { Store } from "./tauri/store.js";

const store = new Store("contexts.store");
let contexts = await store.get("ctx-list");
if (!contexts) {
  contexts = [];
  await store.set("ctx-list", []);
}

console.warn(store, contexts);
