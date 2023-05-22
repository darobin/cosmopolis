
import { registerStore, writable, get } from '../lib/model.js';

const defaultValue = { tiles: await listLocalTiles() };
const store = writable(defaultValue);

registerStore('local-tiles', store);

export async function listLocalTiles () {
  return await window.cosmopolis.localTiles();
}

export async function refreshLocalTiles () {
  const tiles = await window.cosmopolis.localTiles();
  store.update((data) => ({ ...data, tiles }));
}

export async function installTile (url) {
  const id = url2id(url);
  const meta = get(store).tiles[id].manifest;
  console.warn(`install`, meta);
  const mergedWishes = (meta.wishes || []).map(w => {
    return {
      ...{
        icons: meta.icons,
        name: `${meta.name || meta.short_name || 'Untitled'} (${w.type})`,
      },
      ...w,
    };
  });
  console.warn(`merged`, mergedWishes);
  await window.cosmopolis.installTile(url, true, mergedWishes);
  await refreshLocalTiles();
}
export async function uninstallTile (url) {
  await window.cosmopolis.installTile(url, false);
  await refreshLocalTiles();
}
export async function likeTile (url) {
  await window.cosmopolis.likeTile(url, true);
  await refreshLocalTiles();
}
export async function unlikeTile (url) {
  await window.cosmopolis.likeTile(url, false);
  await refreshLocalTiles();
}

export async function refreshTile (url) {
  await window.cosmopolis.refreshTile(url);
  await refreshLocalTiles();
}
export async function removeTile (url) {
  await window.cosmopolis.removeTile(url);
  await refreshLocalTiles();
}

export function localMeta (url) {
  const id = url2id(url);
  const meta = get(store).tiles[id];
  if (!meta) return {};
  return {
    installed: !!meta.installed,
    liked: !!meta.liked,
  }
}

function url2id (url) {
  return new URL(url).hostname;
}
