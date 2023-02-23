

import { registerStore, writable } from '../lib/model.js';
import { listContexts, registerContextListChange, addContext, updateContext, deleteContext } from '../lib/contexts.js';

const defaultValue = { contexts: await listContexts(), current: null };
const store = writable(defaultValue);

registerStore('contexts', store);

registerContextListChange((contexts) => {
  store.update((data) => ({ ...data, contexts }));
});

export async function saveContext (ctx) {
  if (ctx.$id) return updateContext(ctx.$id, ctx);
  return addContext(ctx);
}

export async function removeContext (ctx) {
  return deleteContext(ctx.$id);
}
