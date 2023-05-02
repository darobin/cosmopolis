
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

// export function warn (str) {
//   invoke('dbg:warn', str);
// }

// setTimeout(() => {
//   warn(`But why…`);
// }, 3000);

// window.addEventListener('message', (ev) => {
//   const { source } = ev;
//   warn(`Goooo`);
//   if (ev.data.type === 'cm-tile-resize-init') {
//     const rob = new ResizeObserver((entries) => {
//       const height = entries[0]?.contentRect?.height;
//       warn(`HEIGHT ${height}`);
//       source.postMessage({ type: 'cm-tile-resize', height, source: 'observer' }, '*');
//     });
//     rob.observe(document.documentElement);
//     // XXX
//     // - get size and send
//     // - set up ResizeObserver and wire that too
//     //  - remove setTimeout if we can
//     setTimeout(() => {
//       source.postMessage({ type: 'cm-tile-resize', height: document.documentElement.offsetHeight, src: 'initial load' }, '*');
//     }, 200);
//   }
// });
