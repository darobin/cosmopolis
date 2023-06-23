
import { atom, computed, action } from 'nanostores';
import { $router } from './router.js';
import { $tilesInstalledAppsCached } from './tiles.js';

export const $uiSideBarShowing = atom(true);

export const showSideBar = action($uiSideBarShowing, 'showSideBar', (store) => store.set(true));
export const hideSideBar = action($uiSideBarShowing, 'hideSideBar', (store) => store.set(false));
export const toggleSideBar = action($uiSideBarShowing, 'toggleSideBar', (store) => store.set(!store.get()));

const feedWidths = {
  apps: 360,
};
export const $uiFeedWidth = computed($router, (router) => feedWidths[router.route] || 0);

const feedTitles = {
  apps: 'Apps',
};
export const $uiFeedTitle = computed($router, (router) => {
  if (feedTitles[router.route]) return feedTitles[router.route];
  // here we can also derive from feed cache data
  return '';
});

const feedIcons = {
  apps: 'builtin:app-indicator',
};
export const $uiFeedIcon = computed($router, (router) => {
  if (feedIcons[router.route]) return feedIcons[router.route];
  // here we can also derive from feed cache data
  return '';
});

const feedModes = {
  apps: 'icon-grid',
};
export const $uiFeedMode = computed($router, (router) => feedModes[router.route] || 'tiles-timeline');

export const $uiFeedData = computed([$router, $tilesInstalledAppsCached], (router, installedApps) => {
  if (router.route === 'apps') return installedApps.map(app => ({ ...app, link: `#/apps/${app.authority}` }));
  // here we can also load and feed and such
  return '';
});

export const $uiTilePrimary = computed([$router], (router) => {
  if (router.route === 'apps') {
    if (router.params.authority) return `tile://${router.params.authority}/`;
  }
  return null;
});
