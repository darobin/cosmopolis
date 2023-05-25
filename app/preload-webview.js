/* eslint-disable global-require */
/* global require */
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;

async function getSetting (keyPath) {
  return invoke('settings:get', keyPath);
}

// wishing
contextBridge.exposeInMainWorld('makeWish', makeWish);

// debug
contextBridge.exposeInMainWorld('debug', (...msg) => ipcRenderer.sendToHost('cm-debug', { message: msg.join(' ') }));

// ipcRenderer.sendToHost('cm-test', { value: 'BEFORE' });
window.addEventListener('DOMContentLoaded', () => {
  const rob = new ResizeObserver((entries) => {
    const height = entries[0]?.contentRect?.height;
    ipcRenderer.sendToHost('cm-tile-resize', { height });
  });
  rob.observe(document.documentElement);
});
// ipcRenderer.sendToHost('cm-test', { value: 'AFTER' });

const WISH_TYPES = new Set(['pick', 'edit']);
const ICONS_PATH = 'file:ui/assets/icons';
const wishRegistry = {};

let interactionID = 1;
function nanoid () {
  return interactionID++;
}

// Each wish is described by:
//  - name
//  - description
//  - icons
//  - mediaTypes
//  - headless?
//  - url
//  - internal (points to the implementation)
async function findMatchingWish (type, options = {}) {
  if (!WISH_TYPES.has(type)) throw new Error(`Unknown wish type "${type}".`);
  let granters = await getSetting(`wish.sources.${type}`) || [];
  if (options.filters && (type === 'pick' || type === 'edit')) granters = granters.filter(grant => hasMatchingType(grant.mediaTypes, options.filters));
  if (type === 'pick') {
    granters.unshift({
      name: 'Local device file',
      description: 'Pick a file from a local device drive',
      icons: [{ src: `${ICONS_PATH}/file-earmark-fill.svg` }],
      headless: true,
      internal: new FilePickerPickWish({ filters: options.filters }),
      type: 'pick',
    });
  }
  return granters.map(g => ({...g, id: nanoid() }));
}

function hasMatchingType (supported, filters) {
  if (supported.some(sup => sup === '*')) return true;
  if (filters.some(fil => fil === '*')) return true;
  return filters.some(fil => {
    if (/\w+\/\*/.test(fil)) return supported.some(sup => sup.startsWith(fil.replace(/\*$/, '')));
    const wild = fil.replace(/\/\w+/, '/*');
    return supported.some(sup => sup === fil || sup === wild);
  });
}

async function listPotentialGranters (type, granters) {
  ww(`listPotential`, JSON.stringify(granters))
  return new Promise((resolve) => {
    const wishID = nanoid();
    const handler = (ev, gid, wid) => {
      if (wid !== wishID) return;
      ipcRenderer.off('cm-wish-granter-selected', handler);
      // this is == on purpose for casting purposes
      if (gid) resolve({ granter: granters.find(g => g.id == gid) });
      else resolve({});
    };
    ipcRenderer.on('cm-wish-granter-selected', handler);
    ipcRenderer.sendToHost('cm-wish-select-granter', { type, granters }, wishID);
  });
}

async function instantiateWish (granter, data) {
  return new Promise((resolve) => {
    ww(`send instantiation`);
    const wishID = nanoid();
    // blob may be null for cancelled wishes
    wishRegistry[wishID] = resolve;
    ipcRenderer.sendToHost('cm-wish-instantiate', { granter, data }, wishID);
  });
}

// we want options for multiple, title, message too
async function makeWish (type, { filters, data } = {}) {
  ww(`start`, type, JSON.stringify(filters));
  if (!WISH_TYPES.has(type)) throw new Error(`Unknown wish type "${type}".`);
  if (filters && !Array.isArray(filters)) throw new Error(`Filters must be an array.`);
  ww(`granting…`)
  const granters = await findMatchingWish('pick', { filters });
  ww(`matched`, JSON.stringify(granters))
  // IMPORTANT NOTE
  // In the UI, if there are no granters we need an interaction to run a search. That won't work with this model
  // that expects to already know about them all. We will refactor later.
  ww(`listing…`)
  const { granter } = await listPotentialGranters(type, granters);
  ww(`g=`, granter)
  // wish was cancelled, we resolve with undefined
  if (!granter) return;
  ww(`running…`)
  if (granter.internal) return await granter.internal.run(type, data);
  return await instantiateWish(granter, data);
}

ipcRenderer.on('cm-wish-instantiation', (ev, granter, wid, data) => {
  contextBridge.exposeInMainWorld('currentWish', {
    type: granter.type,
    data,
    grant: async (blob) => {
      // This is a bit of a mindfuck. Each preload is a different instance. Here we are in a wish tile. We send the
      // granted blob to our host, a webview in a cm-tile element. That cm-tile element has a parent cm-tile element.
      // It tells the parent cm-tile element about the granted blob. The parent then dispatches a cm-wish-granted
      // event to its own webview, which is where the other preload exists. That's the code below handling this event
      // by hitting the wishRegistry.
      // To make things EVEN MORE interesting, in this case Eletron refuses to structure-clone a blob. So instead we
      // convert it to an ArrayBuffer and type, and rebuild it on the other side
      ipcRenderer.sendToHost('cm-wish-granted', { arrayBuffer: await blob.arrayBuffer(), type: blob.type }, wid);
    },
  });
  const wev = new CustomEvent('wish');
  window.dispatchEvent(wev);
});

ipcRenderer.on('cm-wish-granted', (ev, blob, wid) => {
  if (blob) {
    // Reconstructing a blob as detailed above.
    wishRegistry[wid]?.(new Blob([blob.arrayBuffer], { type: blob.type }));
  }
  // was cancelled
  else {
    wishRegistry[wid]?.();
  }
});

// this is an internal wish implementation
// probably factor out at some point
class FilePickerPickWish {
  constructor ({ filters } = {}) {
    this.filters = filters;
  }
  async run () {
    const data = await invoke('wish:pick-local-image');
    return new Blob([data.blob], { type: data.type });
  }
}

function ww (...str) {
  ipcRenderer.sendToHost('cm-debug', { message: str.join(' ') })
}
