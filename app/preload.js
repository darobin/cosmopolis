
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;
// let intentID = 1;

contextBridge.exposeInMainWorld('cosmopolis',{
  // preferences
  getSetting: (keyPath) => invoke('settings:get', keyPath),
  setSetting: (keyPath, data) => invoke('settings:set', keyPath, data),
  // picking stuff
  pickDevTile: () => invoke('pick:tile-dev'),
  // dev tiles
  devTileHistory: () => invoke('dev:tile-history'),
});
