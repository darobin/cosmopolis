
import { atom, computed, action } from 'nanostores';
import { $router } from './router.js';
import { $tilesInstalledAppsCached, $tilesDevModeCached } from './tiles.js';

export const $uiSideBarShowing = atom(true);

export const showSideBar = action($uiSideBarShowing, 'showSideBar', (store) => store.set(true));
export const hideSideBar = action($uiSideBarShowing, 'hideSideBar', (store) => store.set(false));
export const toggleSideBar = action($uiSideBarShowing, 'toggleSideBar', (store) => store.set(!store.get()));

const feedWidths = {
  apps: 360,
  library: 360,
};
export const $uiFeedWidth = computed($router, (router) => feedWidths[router.route] || 0);

const feedTitles = {
  apps: 'Apps',
  library: 'Library',
  '$developer-mode-tiles': 'Developer Tiles',
};
export const $uiFeedTitle = computed($router, (router) => {
  return specialSelector(router, feedTitles);
});

const feedIcons = {
  apps: 'builtin:app-indicator',
  library: 'builtin:collection',
  '$developer-mode-tiles': 'builtin:code-square',
};
export const $uiFeedIcon = computed($router, (router) => {
  return specialSelector(router, feedIcons);
});

const feedModes = {
  apps: 'icon-grid',
};
export const $uiFeedMode = computed($router, (router) => feedModes[router.route] || 'tiles-timeline');

export const $uiFeedData = computed([$router, $tilesInstalledAppsCached, $tilesDevModeCached], (router, installedApps, devModeTiles) => {
  if (router.route === 'apps') return installedApps.map(app => ({ ...app, link: `#/apps/${app.authority}` }));
  if (router.route === 'library') {
    if (router.params.path === '$developer-mode-tiles') return devModeTiles.map(tile => ({ ...tile, link: `#/library/$developer-mode-tiles/${tile.authority}` }));
    // special paths start with $, the rest are just IDs that select into the tree (the view has to unfold to match)
    return [];
  }
  // here we can also load and feed and such
  return [];
});

export const $uiTilePrimary = computed([$router], (router) => {
  if (router.params.authority) return `tile://${router.params.authority}/`;
  return null;
});

function specialSelector (router, data) {
  let selector = router.route;
  if (router.route === 'library' && router.params?.path?.startsWith('$') && data[router.params.path]) {
    selector = router.params.path;
  }
  if (data[selector]) return data[selector];
  return '';
}
