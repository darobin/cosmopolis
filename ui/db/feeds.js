

import { registerStore, writable } from '../lib/model.js';
// import { listContexts, registerContextListChange, registerCurrentChange, addContext, updateContext, deleteContext, getCurrent, setCurrent } from '../lib/contexts.js';

const defaultValue = {};
const store = writable(defaultValue);

registerStore('feeds', store);

export async function loadFeed (id) {
  // XXX
  //  - how do we know the feed type?
  //  - read from the fs
  //  - set the fs up to watch and update when needed
}

export async function unloadFeed (id) {
  // XXX
  //  - stop watching
}

export async function updateFeed (feed) {
  // XXX
  //  - save the feed to disk
}


// registerContextListChange((contexts) => {
//   store.update((data) => ({ ...data, contexts }));
// });

// registerCurrentChange((current) => {
//   store.update((data) => ({ ...data, current }));
// });

// export async function saveContext (ctx) {
//   if (ctx.$id) return updateContext(ctx.$id, ctx);
//   return addContext(ctx);
// }

// export async function removeContext (ctx) {
//   const id = ctx?.$id || ctx;
//   return deleteContext(id);
// }

// export async function selectContext (ctx) {
//   const id = ctx?.$id || ctx;
//   return setCurrent(id);
// }

// export async function addFeedToContext (feedID, ctxID) {
//   if (!ctxID) ctxID = store.current;
//   const ctx = store.contexts.find(c => c.$id === ctxID);
//   if (!ctx) throw new Error(`Can't find context ${ctxID}`);
//   if (!ctx.feeds) ctx.feeds = [];
//   ctx.feeds.push(feedID);
//   return saveContext(ctx);
// }
