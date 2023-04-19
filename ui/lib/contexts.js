
import { Store } from "tauri-plugin-store-api";
import nanoid from "./smallid.js";

const CTX_LIST = '$ctx-list';
const CTX_CURRENT = '$ctx-current';

const store = new Store("contexts.store");
let contexts = await store.get(CTX_LIST);
if (!contexts) {
  contexts = [];
  await store.set(CTX_LIST, []);
}

export async function listContexts () {
  const entries = await store.entries();
  const entryMap = {};
  let list = [];
  entries.forEach(([k, v]) => {
    if (k === CTX_LIST) list = v;
    else if (/^\$/.test(k)) return;
    else entryMap[k] = v;
  });
  return list.map(k => entryMap[k]).filter(Boolean);
}

// this has a race condition
// make sure the UI blocks calling this while it's running
// later: add a better way to keep the list sorted
export async function addContext (ctx) {
  const id = nanoid();
  ctx.$id = id;
  const list = await store.get(CTX_LIST);
  list.push(id);
  await store.set(id, ctx);
  await store.set(CTX_LIST, list);
  await store.save();
}

export async function getContext (id) {
  return store.get(id);
}

export async function updateContext (id, ctx) {
  await store.set(id, ctx);
  await store.save();
}

export async function deleteContext (id) {
  await store.delete(id);
  let list = await store.get(CTX_LIST);
  list = list.filter(k => k !== id);
  await store.set(CTX_LIST, list);
  await store.save();
}

export async function registerContextChange (id, cb) {
  await store.onKeyChange(id, cb);
}

export async function registerContextListChange (cb) {
  await store.onChange(async () => cb(await listContexts()));
}

export async function getCurrent () {
  return store.get(CTX_CURRENT);
}

export async function setCurrent (id) {
  await store.set(CTX_CURRENT, id);
  await store.save();
}

export async function registerCurrentChange (cb) {
  await store.onKeyChange(CTX_CURRENT, cb);
}
