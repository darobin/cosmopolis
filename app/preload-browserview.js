/* eslint-disable global-require */
/* global require */
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;

let primaryPort;
ipcRenderer.once(`connect-tile`, (ev) => {
  primaryPort = ev.ports[0];
});

// wishing
contextBridge.exposeInMainWorld('makeWish', makeWish);

// we want options for multiple, title, message too
async function makeWish (type, options = {}) {
  const id = await invoke('wish:generate-id');
  primaryPort.postMessage({ type: 'make-wish', wish: { id, type, options }});
  return new Promise((resolve) => {
    const wishHandler = (ev) => {
      const { type, wish } = ev.data;
      if (!wish || wish.id !== id) return;
      primaryPort.onmessage = null;
      // NOTE: we resolve empty, cancellation isn't an error
      if (type === 'cancel-wish') return resolve();
      if (type === 'grant-wish') return resolve(); // XXX need to have some data in there
    };
    primaryPort.onmessage = wishHandler;
  });
}

// async function getSetting (keyPath) {
//   return invoke('settings:get', keyPath);
// }

// debug
// contextBridge.exposeInMainWorld('debug', (...msg) => ipcRenderer.sendToHost('cm-debug', { message: msg.join(' ') }));

// // ipcRenderer.sendToHost('cm-test', { value: 'BEFORE' });
// window.addEventListener('DOMContentLoaded', () => {
//   const rob = new ResizeObserver((entries) => {
//     const height = entries[0]?.contentRect?.height;
//     ipcRenderer.sendToHost('cm-tile-resize', { height });
//   });
//   rob.observe(document.documentElement);
// });
// // ipcRenderer.sendToHost('cm-test', { value: 'AFTER' });

// const ICONS_PATH = 'file:ui/assets/icons';
// const wishRegistry = {};

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
