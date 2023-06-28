
import { atom, action } from 'nanostores';
import { $uiTilePrimary } from './ui.js';

const WISH_TYPES = new Set(['pick', 'edit']);

const selectorTitle = {
  pick: 'Pick',
  edit: 'Edit',
}
const defaultSelector = () => ({
  showing: false,
  type: null,
  title: null,
  filters: [],
  wishID: null,
  tileID: null,
});
export const $wishSelector = atom(defaultSelector());
export const showWishSelector = action($wishSelector, 'showWishSelector', (store, tileID, wish) => {
  if (tileID === $uiTilePrimary.get()) emptyWishTiles([]);
  else trimWishTilesAfter(tileID);
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
  store.set(defaultSelector());
  window.cosmopolis.cancelWish(tid, wid);
});
export const hideWishSelector = action($wishSelector, 'hideWishSelector', (store) => {
  const sel = store.get();
  sel.showing = false;
  store.set(sel);
});
export const restoreWishSelector = action($wishSelector, 'restoreWishSelector', (store, data) => {
  store.set(data);
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
      icons: `builtin:file-earmark-fill`,
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

// This list stashes selector parameters: they are what produced this wish and they can be
// used to restore the selector on wish cancel.
export const $wishTiles = atom([]);
export const emptyWishTiles = action($wishTiles, 'emptyWishTiles', (store) => store.set([]));
export const trimWishTilesAfter = action($wishTiles, 'trimWishTilesAfter', (store, tileID) => {
  let seen = false;
  const newWishes = store.get().filter(w => {
    if (w.tileID === tileID) {
      seen = true;
      return true;
    }
    if (seen) return false;
    return true;
  });
  store.set(newWishes);
});
export const makeAWish = action($wishTiles, 'makeAWish', (store, link) => {
  const selector = $wishSelector.get();
  const wishes = store.get();
  wishes.push({ ...selector, link });
  hideWishSelector();
  store.set(wishes);
});
export const cancelWish = action($wishTiles, 'cancelWish', (store) => {
  const wishes = store.get();
  const selector = wishes.pop();
  restoreWishSelector(selector);
  store.set(wishes);
});

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
