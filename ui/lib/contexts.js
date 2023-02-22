
import { Store } from "./tauri/store.js";

const store = new Store("contexts.store");
let contexts = await store.get("ctx-list");
console.warn(`at load`, contexts);
if (!contexts) {
  contexts = [];
  await store.set("ctx-list", []);
}

console.warn(`later`, contexts);
