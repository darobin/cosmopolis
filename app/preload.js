
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;
// let intentID = 1;

contextBridge.exposeInMainWorld('cosmopolis',{
  // preferences
  getSetting: (keyPath) => invoke('settings:get', keyPath),
  setSetting: (keyPath, data) => invoke('settings:set', keyPath, data),
  // picking stuff
  pickDevTile: () => invoke('pick:tile-dev'),
  // stored tiles
  localTiles: () => invoke('tiles:list-local'),
  installTile: (url, installed) => invoke('tiles:install', url, installed),
  likeTile: (url, liked) => invoke('tiles:like', url, liked),
  refreshTile: (url) => invoke('tiles:refresh', url),
  removeTile: (url) => invoke('tiles:remove', url),
});
