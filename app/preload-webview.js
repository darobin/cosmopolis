
const { contextBridge, ipcRenderer } = require('electron');
const { invoke, sendToHost } = ipcRenderer;

contextBridge.exposeInMainWorld('cosmopolis',{
  // intent: (action, type, data) => {
  //   const id = 'x' + intentID++;
  //   invoke('intent:show-matching-intents', action, type, data, id);
  //   return id;
  // },
  // signalIntentCancelled: () => {
  //   sendToHost('intent-cancelled');
  // },
  // signalCreateFeed: (data) => {
  //   sendToHost('create-feed', data);
  // },
});

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
