

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

export async function addFeedToContext (feedID, ctxID) {
  if (!ctxID) ctxID = store.current;
  console.warn(`finding in`, store.contexts);
  const ctx = store.contexts.find(c => c.$id === ctxID);
  console.warn(`found`, ctx);
  if (!ctx) throw new Error(`Can't find context ${ctxID}`);
  if (!ctx.feeds) ctx.feeds = [];
  ctx.feeds.push(feedID);
  return saveContext(ctx);
}
