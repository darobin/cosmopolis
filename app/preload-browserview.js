/* eslint-disable global-require */
/* global require */
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;

let primaryPort;
ipcRenderer.once(`connect-tile`, (ev) => {
  primaryPort = ev.ports[0];
  primaryPort.onmessage = wishHandler;
  primaryPort.start();
});

// If we are *making* a wish, then we can receive cancel-wish or grant-wish, which will call
// activeWishResolver() to resolve the window.makeWish() promise with. It needs to match the
// activeWishID to make sure that we are keeping track of what is landing where.
// If we are *handling* a wish, then we expose currentWish and trigger an event.
// XXX write up full wish steps.
let activeWishResolver = () => {};
let activeWishID;
function wishHandler (ev) {
  const { type, wish } = ev.data;
  if (!type || !wish) return;
  if (type === 'cancel-wish') {
    if (!wish.id || wish.id !== activeWishID) return;
    activeWishResolver();
  }
  else if (type === 'grant-wish') {
    if (!wish.id || wish.id !== activeWishID) return;
    activeWishResolver(ev.data.data || true); // ev.data.data is for returned data
  }
  else if (type === 'instantiate-wish') {
    alert('wishing ' + wish.type);
    contextBridge.exposeInMainWorld('currentWish', {
      type: wish.type,
      // data: data ? blobFromCloneable(data) : undefined, // XXX I hope we don't need blobFromCloneable
      data: wish.data, // wish.data is for sent data
      grant: async (blob) => {
        primaryPort.postMessage({ type: 'granting-wish', wish: { ...wish }, data: blob });
        // XXX OLD
        // This is a bit of a mindfuck. Each preload is a different instance. Here we are in a wish tile. We send the
        // granted blob to our host, a webview in a cm-tile element. That cm-tile element has a parent cm-tile element.
        // It tells the parent cm-tile element about the granted blob. The parent then dispatches a cm-wish-granted
        // event to its own webview, which is where the other preload exists. That's the code below handling this event
        // by hitting the wishRegistry.
        // To make things EVEN MORE interesting, in this case Electron refuses to structure-clone a blob. So instead we
        // convert it to an ArrayBuffer and type, and rebuild it on the other side
        // ipcRenderer.sendToHost('cm-wish-granted', await cloneableBlob(blob), wid);
      },
    });
    const wev = new CustomEvent('wish');
    window.dispatchEvent(wev);
  }
  activeWishResolver = () => {};
}

// wishing
contextBridge.exposeInMainWorld('makeWish', makeWish);

// We want options for multiple, title, message too.
// Note that options contains the data if applicable.
async function makeWish (type, options = {}) {
  const id = await invoke('wish:generate-id');
  primaryPort.postMessage({ type: 'make-wish', wish: { id, type, options }});
  activeWishID = id;
  return new Promise((resolve) => {
    activeWishResolver = resolve;
  });
}


// async function instantiateWish (granter, data) {
//   if (data) data = await cloneableBlob(data);
//   return new Promise((resolve) => {
//     ww(`send instantiation`);
//     const wishID = nanoid();
//     // blob may be null for cancelled wishes
//     wishRegistry[wishID] = resolve;
//     ipcRenderer.sendToHost('cm-wish-instantiate', { granter, data }, wishID);
//   });
// }

// // we want options for multiple, title, message too
// async function makeWish (type, { filters, data } = {}) {
//   ww(`start`, type, JSON.stringify(filters));
//   if (!WISH_TYPES.has(type)) throw new Error(`Unknown wish type "${type}".`);
//   if (filters && !Array.isArray(filters)) throw new Error(`Filters must be an array.`);
//   const granters = await findMatchingWish(type, { filters });
//   ww(`matched`, JSON.stringify(granters))
//   // IMPORTANT NOTE
//   // In the UI, if there are no granters we need an interaction to run a search. That won't work with this model
//   // that expects to already know about them all. We will refactor later.
//   const { granter } = await listPotentialGranters(type, granters);
//   // wish was cancelled, we resolve with undefined
//   if (!granter) return;
//   if (granter.internal) return await granter.internal.run(type, data);
//   return await instantiateWish(granter, data);
// }

// ipcRenderer.on('cm-wish-instantiation', (ev, granter, wid, data) => {
//   contextBridge.exposeInMainWorld('currentWish', {
//     type: granter.type,
//     data: data ? blobFromCloneable(data) : undefined,
//     grant: async (blob) => {
//       // This is a bit of a mindfuck. Each preload is a different instance. Here we are in a wish tile. We send the
//       // granted blob to our host, a webview in a cm-tile element. That cm-tile element has a parent cm-tile element.
//       // It tells the parent cm-tile element about the granted blob. The parent then dispatches a cm-wish-granted
//       // event to its own webview, which is where the other preload exists. That's the code below handling this event
//       // by hitting the wishRegistry.
//       // To make things EVEN MORE interesting, in this case Electron refuses to structure-clone a blob. So instead we
//       // convert it to an ArrayBuffer and type, and rebuild it on the other side
//       ipcRenderer.sendToHost('cm-wish-granted', await cloneableBlob(blob), wid);
//     },
//   });
//   const wev = new CustomEvent('wish');
//   window.dispatchEvent(wev);
// });

// ipcRenderer.on('cm-wish-granted', (ev, blob, wid) => {
//   if (blob) {
//     // Reconstructing a blob as detailed above.
//     wishRegistry[wid]?.(blobFromCloneable(blob));
//   }
//   // was cancelled
//   else {
//     wishRegistry[wid]?.();
//   }
// });

// function ww (...str) {
//   ipcRenderer.sendToHost('cm-debug', { message: str.join(' ') })
// }

// async function cloneableBlob (blob) {
//   return { arrayBuffer: await blob.arrayBuffer(), type: blob.type };
// }

// function blobFromCloneable (data) {
//   return new Blob([data.arrayBuffer], { type: data.type });
// }
