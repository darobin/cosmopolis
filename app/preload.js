/* eslint-disable global-require */
/* global require */
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;

const tilePorts = {};

let sendMessagePort;
contextBridge.exposeInMainWorld('cosmopolis', {
  connectPort: () => {
    if (sendMessagePort) return;
    const { port1, port2 } = new MessageChannel();
    sendMessagePort = port1;
    ipcRenderer.postMessage('connect-port', null, [port2]);
  },
  // browser view management
  addBrowserView: (id, props, wishHandler) => {
    if (!sendMessagePort) throw new Error('Cannot create a BrowserView before the message port is initialised.');
    ipcRenderer.once(`connect-tile-${id}`, (ev) => {
      registerTileHandling(id, ev.ports[0], wishHandler);
    });
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
    delete tilePorts[id];
    sendMessagePort.postMessage({
      type: 'remove-browser-view',
      id,
    });
  },
  // preferences
  getSimpleData: (keyPath) => invoke('simple-data:get', keyPath),
  setSimpleData: (keyPath, data) => invoke('simple-data:set', keyPath, data),
  // wishes
  cancelWish: (tid, wid) => {
    const port = tilePorts[tid];
    console.warn(`we have port(${tid})`, port);
    if (!port) return;
    console.warn(`sending`, { type: 'cancel-wish', wish: { id: wid }});
    port.postMessage({ type: 'cancel-wish', wish: { id: wid }});
  },
  // pick local file
  pickLocalFile: () => invoke('wish:pick-local-image'),
  // XXX none of the below have been reviewed
  // picking stuff
  pickDevTile: () => invoke('pick:tile-dev'),
  // stored tiles
  localTiles: () => invoke('tiles:list-local'),
  installTile: (url, installed, wishes) => invoke('tiles:install', url, installed, wishes),
  refreshTile: (url) => invoke('tiles:refresh', url),
  removeTile: (url) => invoke('tiles:remove', url),
});

function registerTileHandling (id, port, wishHandler) {
  tilePorts[id] = port;
  port.onmessage = (msg) => wishHandler(msg.data || {});
}
