
import { atom, action, onMount, computed } from 'nanostores';

// "Installed apps" are tiles that are both: 1) flagged as installed and 2) that have that default wish
// that makes them root-launchable.
// XXX: for now we don't check the wish part, need to fix that soon.
export const $tilesInstalledApps = atom([]);
export const refreshInstalledApps = action($tilesInstalledApps, 'refreshInstalledApps', async (store) => {
  const installed = await window.cosmopolis.getSimpleData('installed');
  store.set(Object.keys(installed).filter(k => installed[k]));
});
onMount($tilesInstalledApps, () => refreshInstalledApps());

// Dev tiles are tiles specially installed via the dev mode.
// XXX: need to add a menu to make that possible again
export const $tilesDevMode = atom([]);
export const refreshDevModeTiles = action($tilesDevMode, 'refreshDevModeTiles', async (store) => {
  const developer = await window.cosmopolis.getSimpleData('developer');
  store.set(Object.keys(developer));
});
onMount($tilesDevMode, () => refreshDevModeTiles());

// Maps authority to manifest.
// Note that this is a map but we treat it like an atom, you can only replace it wholesale.
export const $tilesCache = atom({});
export const refreshTilesCache = action($tilesCache, 'refreshTilesCache', async (store) => {
  const cache = await window.cosmopolis.getSimpleData('cache');
  store.set(cache);
});
onMount($tilesCache, () => refreshTilesCache());

// Only has installed:true app
export const $tilesInstalledAppsCached = computed([$tilesInstalledApps, $tilesCache], (installed, cache) => {
  return installed.map(k => ({ ...cache[k], authority: k })).filter(Boolean);
});

// Has the dev app with the cache data
export const $tilesDevModeCached = computed([$tilesDevMode, $tilesCache], (developer, cache) => {
  return developer.map(k => ({ ...cache[k], authority: k })).filter(Boolean);
});
