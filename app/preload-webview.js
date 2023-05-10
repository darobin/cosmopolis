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

const WISH_TYPES = new Set(['pick']);
const ICONS_PATH = 'file:ui/assets/icons';

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
  if (type === 'pick') {
    if (options.filters) granters = granters.filter(grant => hasMatchingType(grant.mediaTypes, options.filters));
    granters.unshift({
      name: 'Local device file',
      description: 'Pick a file from a local device drive',
      icons: [{ src: `${ICONS_PATH}/file-earmark-fill.svg` }],
      headless: true,
      internal: new FilePickerPickWish({ filters: options.filters }),
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

// --------------------------------------------------------------------------------------------------------------------
// XXX this hasn't been implemented yet
// --------------------------------------------------------------------------------------------------------------------
async function instantiateWish (granter) {
  return new Promise((resolve) => {
    ww(`send instantiation`, granter);
    parent.postMessage({ type: 'cm-wish-instantiate', granter });
    const handler = (ev) => {
      ww(`msg`, ev.data.type);
      window.removeEventListener('message', handler);
      if (ev.data?.type === 'cm-wish-granted') resolve({ payload: ev.data.payload });
      else if (ev.data?.type === 'cm-wish-cancelled') resolve({});
    };
    window.addEventListener('message', handler);
  });
}

// we want options for multiple, title, message too
async function makeWish (type, { filters } = {}) {
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
  if (granter.internal) return await granter.internal.run();
  return await instantiateWish(granter);
}

// this is an internal wish implementation
// probably factor out at some point
class FilePickerPickWish {
  constructor ({ filters } = {}) {
    this.filters = filters;
  }
  // XXX
  // Very annouyingly, I haven't been able to get Blobs and createObjectURL working in a tile.
  // No matter how much I open the CSP, it still produces a CSP error.
  async run () {
    const data = await invoke('wish:pick-local-image');
    return data.url;
    // return new Blob(data.blob, { type: data.type });
    // ww('RUN!!!');
    // // XXX call the backend picker
    // return new Blob(['hello there!'], { type: 'text/plain' });
  }
}

function ww (...str) {
  ipcRenderer.sendToHost('cm-debug', { message: str.join(' ') })
}
