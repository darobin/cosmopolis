/* eslint-disable global-require */
/* global require */
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;

contextBridge.exposeInMainWorld('cosmopolis', {
  // preferences
  getSetting: (keyPath) => invoke('settings:get', keyPath),
  setSetting: (keyPath, data) => invoke('settings:set', keyPath, data),
  // picking stuff
  pickDevTile: () => invoke('pick:tile-dev'),
  // stored tiles
  localTiles: () => invoke('tiles:list-local'),
  installTile: (url, installed, wishes) => invoke('tiles:install', url, installed, wishes),
  likeTile: (url, liked) => invoke('tiles:like', url, liked),
  refreshTile: (url) => invoke('tiles:refresh', url),
  removeTile: (url) => invoke('tiles:remove', url),
});
