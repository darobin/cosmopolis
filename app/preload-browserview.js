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
    activeWishResolver(ev.data.data || true); // ev.data.data is for returned data
  }
  else if (type === 'instantiate-wish') {
    contextBridge.exposeInMainWorld('currentWish', {
      type: wish.type,
      // data: data ? blobFromCloneable(data) : undefined, // XXX I hope we don't need blobFromCloneable
      data: wish.data, // wish.data is for sent data
      grant: async (blob) => {
        primaryPort.postMessage({ type: 'granting-wish', wish: { ...wish }, data: blob });
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
