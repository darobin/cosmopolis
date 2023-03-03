

import { registerStore, writable } from '../lib/model.js';
import { listContexts, registerContextListChange, registerCurrentChange, addContext, updateContext, deleteContext, getCurrent, setCurrent } from '../lib/contexts.js';

const defaultValue = { contexts: await listContexts(), current: await getCurrent() };
const store = writable(defaultValue);

registerStore('contexts', store);

registerContextListChange((contexts) => {
  store.update((data) => ({ ...data, contexts }));
});

registerCurrentChange((current) => {
  store.update((data) => ({ ...data, current }));
});

export async function saveContext (ctx) {
  if (ctx.$id) return updateContext(ctx.$id, ctx);
  return addContext(ctx);
}

export async function removeContext (ctx) {
  const id = ctx?.$id || ctx;
  return deleteContext(id);
}

export async function selectContext (ctx) {
  const id = ctx?.$id || ctx;
  return setCurrent(id);
}
