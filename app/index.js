
import { app, /*protocol,*/ BrowserWindow, screen }  from 'electron';
// import { ipfsProtocolHandler } from './ipfs-handler.js';
// import { initIPNSCache, shutdown } from './ipfs-node.js';
// import { initDataSource } from './data-source.js';
// import { initIntents } from './intents.js';
import makeRel from './lib/rel.js';

let mainWindow;
const rel = makeRel(import.meta.url);

// there can be only one
const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
}
else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// XXX can we save screen & position?
// XXX also autoreload

app.whenReady().then(async () => {
  // protocol.registerStreamProtocol('ipfs', ipfsProtocolHandler);
  // protocol.registerStreamProtocol('ipns', ipfsProtocolHandler);
  // await initIPNSCache();
  // await initDataSource();
  // await initIntents();
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    backgroundColor: '#fff',
    title: 'cosmopolis',
    // titleBarStyle: 'hidden',
    icon: './img/icon.png',
    webPreferences: {
      webviewTag: true, // I know that this isn't great, but the alternatives aren't there yet
      preload: rel('./preload.js'),
    },
  });
  // mainWindow.loadFile('index.html');
  mainWindow.loadFile('lab.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
  const { webContents } = mainWindow;
  // reloading
  webContents.on('before-input-event', makeKeyDownMatcher('cmd+R', reload));
  webContents.on('before-input-event', makeKeyDownMatcher('ctrl+R', reload));
  webContents.on('before-input-event', makeKeyDownMatcher('cmd+alt+I', openDevTools));
  webContents.on('before-input-event', makeKeyDownMatcher('ctrl+alt+I', openDevTools));
});

// app.on('will-quit', shutdown);

function reload () {
  console.log('RELOAD');
  mainWindow.reload();
}

function openDevTools () {
  mainWindow.webContents.openDevTools();
}

// function makeKeyUpMatcher (sc, cb) {
//   return makeKeyMatcher('keyUp', sc, cb);
// }

function makeKeyDownMatcher (sc, cb) {
  return makeKeyMatcher('keyDown', sc, cb);
}

function makeKeyMatcher (type, sc, cb) {
  let parts = sc.split(/[+-]/)
    , key = parts.pop().toLowerCase()
    , modifiers = {
        shift: false,
        control: false,
        meta: false,
        alt: false,
      }
  ;
  parts.forEach(p => {
    p = p.toLowerCase();
    if (p === 'ctrl') p = 'control';
    if (p === 'cmd') p = 'meta';
    if (typeof modifiers[p] !== 'boolean') console.warn(`Unknown command modifier ${p}.`);
    modifiers[p] = true;
  });
  return (evt, input) => {
    if (type !== input.type) return;
    if (key !== input.key) return;
    let badMod = false;
    Object.keys(modifiers).forEach(mod => {
      if (input[mod] !== modifiers[mod]) badMod = true;
    });
    if (badMod) return;
    cb();
  };
}
