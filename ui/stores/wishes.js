
import { atom, action } from 'nanostores';
import { $uiTilePrimary } from './ui.js';

const WISH_TYPES = new Set(['pick', 'edit']);

const selectorTitle = {
  pick: 'Pick',
  edit: 'Edit',
}
export const $wishSelector = atom({
  showing: false,
  type: null,
  title: null,
  filters: [],
  wishID: null,
  tileID: null,
});
export const showWishSelector = action($wishSelector, 'showWishSelector', (store, tileID, wish) => {
  if (tileID === $uiTilePrimary.get()) {
    setWishTiles([]);
  }
  else {
    let seen = false;
    const newWishes = $wishTiles.get().filter(tid => {
      if (tid === tileID) {
        seen = true;
        return true;
      }
      if (seen) return false;
      return true;
    });
    setWishTiles(newWishes);
  }
  store.set({
    showing: true,
    type: wish.type,
    title: selectorTitle[wish.type] || wish.type,
    wishID: wish.id,
    filters: wish.filters,
    tileID,
  });
  updateMatchingWishes(wish.type, wish.filters);
});
export const cancelWishSelection = action($wishSelector, 'cancelWishSelection', (store) => {
  const tid = store.get().tileID;
  const wid = store.get().wishID;
  store.set({
    showing: false,
    type: null,
    title: '',
    wishID: null,
    filters: [],
  });
  window.cosmopolis.cancelWish(tid, wid);
});

// Each wish is described by:
//  - name
//  - description
//  - icons
//  - mediaTypes
//  - headless?
//  - url
//  - internal (points to the implementation)
export const $wishGranterCandidates = atom([]);
export const updateMatchingWishes = action($wishGranterCandidates, 'updateMatchingWishes', async (store, type, filters) => {
  if (!WISH_TYPES.has(type)) {
    console.error(`Unknown wish type "${type}".`);
    store.set([]);
    return;
  }
  let granters = await window.cosmopolis.getSimpleData(`wish.sources.${type}`);
  if (filters && (type === 'pick' || type === 'edit')) granters = granters.filter(grant => hasMatchingType(grant.mediaTypes, filters));
  if (type === 'pick') {
    granters.unshift({
      name: 'Local device file',
      description: 'Pick a file from a local device drive',
      icons: [{ src: `builtin:file-earmark-fill` }],
      headless: true,
      internal: new FilePickerPickWish({ filters }),
      type: 'pick',
    });
  }
  store.set(granters);
});

function hasMatchingType (supported, filters) {
  if (supported.some(sup => sup === '*')) return true;
  if (filters.some(fil => fil === '*')) return true;
  return filters.some(fil => {
    if (/\w+\/\*/.test(fil)) return supported.some(sup => sup.startsWith(fil.replace(/\*$/, '')));
    const wild = fil.replace(/\/\w+/, '/*');
    return supported.some(sup => sup === fil || sup === wild);
  });
}

export const $wishTiles = atom([]);
const setWishTiles = action($wishTiles, 'setWishTiles', (store, value) => store.set(value));

// this is an internal wish implementation
// probably factor out at some point
// XXX the filters don't work (and other options aren't there either)
class FilePickerPickWish {
  constructor ({ filters } = {}) {
    this.filters = filters;
  }
  async run () {
    const data = await window.cosmopolis.pickLocalFile();
    return new Blob([data.blob], { type: data.type });
  }
}
