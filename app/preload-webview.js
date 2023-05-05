/* eslint-disable global-require */
/* global require */
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;
const { Wish } = require('./lib/wishes.js');

// wishing
contextBridge.exposeInMainWorld('Wish', Wish);

// debug
contextBridge.exposeInMainWorld('wrn', (...str) => alert(str));
// contextBridge.exposeInMainWorld('wrn', (...str) => console.warn(str));

// WOW
// A function that triggers an IPC invoke() works if it's local; if you `export` it then it
// will trigger a bizare `Message 3 rejected by interface blink.mojom.Widget` error.
// eslint-disable-next-line
function warn (str) {
  invoke('dbg:warn', str);
}

window.addEventListener('message', (ev) => {
  const { source } = ev;
  if (ev.data.type === 'cm-tile-resize-init') {
    const rob = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect?.height;
      source.postMessage({ type: 'cm-tile-resize', height, source: 'observer' }, '*');
    });
    rob.observe(document.documentElement);
  }
});
