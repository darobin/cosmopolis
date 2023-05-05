/* eslint-disable global-require */
/* global require */
const { contextBridge, ipcRenderer } = require('electron');
// const { invoke } = ipcRenderer;
// const { Wish } = require('./lib/wishes.js');

// wishing
// contextBridge.exposeInMainWorld('Wish', Wish);

// debug
contextBridge.exposeInMainWorld('debug', (...msg) => ipcRenderer.sendToHost('cm-debug', { message: msg.join(' ') }));

// ipcRenderer.sendToHost('cm-test', { value: 'BEFORE' });
window.addEventListener('DOMContentLoaded', () => {
  const rob = new ResizeObserver((entries) => {
    const height = entries[0]?.contentRect?.height;
    ipcRenderer.sendToHost('cm-tile-resize', { height });
  });
  rob.observe(document.documentElement);
});
// ipcRenderer.sendToHost('cm-test', { value: 'AFTER' });
