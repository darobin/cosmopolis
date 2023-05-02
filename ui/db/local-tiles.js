
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
  await window.cosmopolis.installTile(url, true);
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

export function localMeta (url) {
  const id = new URL(url).hostname;
  const meta = get(store).tiles[id];
  if (!meta) return {};
  return {
    installed: !!meta.installed,
    liked: !!meta.liked,
  }
}
