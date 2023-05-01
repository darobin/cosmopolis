
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
