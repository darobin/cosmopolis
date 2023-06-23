/* eslint-disable global-require */
/* global require */
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;

let sendMessagePort;
contextBridge.exposeInMainWorld('cosmopolis', {
  connectPort: () => {
    if (sendMessagePort) return;
    const { port1, port2 } = new MessageChannel();
    sendMessagePort = port1;
    ipcRenderer.postMessage('connect-port', null, [port2]);
  },
  // browser view management
  addBrowserView: (id, props) => {
    if (!sendMessagePort) throw new Error('Cannot create a BrowserView before the message port is initialised.');
    sendMessagePort.postMessage({
      ...props,
      type: 'add-browser-view',
      id,
    });
  },
  updateBrowserView: (id, props) => {
    if (!sendMessagePort) throw new Error('Cannot update a BrowserView before the message port is initialised.');
    sendMessagePort.postMessage({
      ...props,
      type: 'update-browser-view',
      id,
    });
  },
  removeBrowserView: (id) => {
    if (!sendMessagePort) throw new Error('Cannot remove a BrowserView before the message port is initialised.');
    sendMessagePort.postMessage({
      type: 'remove-browser-view',
      id,
    });
  },
  // preferences
  getSimpleData: (keyPath) => invoke('simple-data:get', keyPath),
  setSimpleData: (keyPath, data) => invoke('simple-data:set', keyPath, data),
  // XXX none of the below have been reviewed
  // picking stuff
  pickDevTile: () => invoke('pick:tile-dev'),
  // stored tiles
  localTiles: () => invoke('tiles:list-local'),
  installTile: (url, installed, wishes) => invoke('tiles:install', url, installed, wishes),
  refreshTile: (url) => invoke('tiles:refresh', url),
  removeTile: (url) => invoke('tiles:remove', url),
});
