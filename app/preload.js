
const { contextBridge, ipcRenderer } = require('electron');
const { invoke } = ipcRenderer;
// let intentID = 1;

contextBridge.exposeInMainWorld('cosmopolis',{
  // preferences
  getSetting: (keyPath) => invoke('settings:get', keyPath),
  setSetting: (keyPath, data) => invoke('settings:set', keyPath, data),
  // // identities
  // loadIdentities: () => invoke('identities:load'),
  // createIdentity: (data) => invoke('identities:create', data),
  // // saveIdentity: (person) => invoke('identities:save', person),
  // // deleteIdentity: (did) => invoke('identities:delete', did),
  // // intents
  // onIntentList: (cb) => ipcRenderer.on('intent-list', cb),
  // // 🚨🚨🚨 SHARED WITH <webview> PRELOADS 🚨🚨🚨
  // // always copy changes here over there
  // intent: (action, type, data) => {
  //   const id = intentID++;
  //   invoke('intent:show-matching-intents', action, type, data, id);
  //   return id;
  // },
  // createFeed: (data) => invoke('intent:create-feed', data),
});
