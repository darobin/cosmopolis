
import { app, BrowserWindow, ipcMain, dialog, protocol }  from 'electron';
import { get as getSetting, set as setSetting } from 'electron-settings';
import { join } from 'node:path';
import { access } from 'node:fs/promises';
import { createReadStream, constants } from 'node:fs';
import { PassThrough } from 'node:stream';
import mime from 'mime-types';
import { manageWindowPosition } from './lib/window-manager.js';
import makeRel from './lib/rel.js';
import loadJSON from './lib/load-json.js';
import nanoid from './lib/smallid.js';

const { handle } = ipcMain;

let mainWindow;
const rel = makeRel(import.meta.url);

// XXX
// It would be helpful to have better monitoring than what electronmon gives us (and same for the others
// they all fail because of ESM). I think that taking the electronmon code and simply watching for changes
// under `app/` instead of trying to do magic would be great.

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

app.whenReady().then(async () => {
  protocol.registerStreamProtocol('tile', tileProtocolHandler);
  handle('settings:get', handleSettingsGet);
  handle('settings:set', handleSettingsSet);
  handle('pick:tile-dev', handlePickDevTile);
  // await initIntents();
  mainWindow = new BrowserWindow({
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
  await manageWindowPosition(mainWindow);
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

async function handleSettingsGet (ev, keyPath) {
  return getSetting(keyPath);
}
async function handleSettingsSet (ev, keyPath, data) {
  return setSetting(keyPath, data);
}
async function handlePickDevTile () {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Pick Dev Title',
    buttonLabel: 'Pick Tile Directory',
    properties: ['dontAddToRecent', 'openDirectory', 'treatPackageAsDirectory'],
    message: 'Pick a directory with the content of a tile and manifest.json for the metadata.'
  });
  if (canceled) return;
  if (filePaths && filePaths.length) {
    const dir = filePaths[0];
    const devTileMap = await getSetting('developer.tiles.localMap');
    const found = Object.values(devTileMap || {}).find(info => info.dir === dir);
    if (found) return found;
    try {
      const manifest = await loadJSON(join(dir, 'manifest.json'));
      const id = nanoid();
      const url = `tile://${id}/`;
      manifest.icons?.forEach(icon => {
        if (!icon.src) return;
        if (/^data:/i.test(icon.src)) return;
        icon.src = new URL(icon.src, url).href;
      });
      const meta = {
        id,
        url,
        dir,
        manifest,
      };
      await setSetting(`developer.tiles.localMap.${id}`, meta);
      const hist = await getSetting('developer.tiles.loadHistory') || [];
      hist.unshift(meta);
      if (hist.length > 20) hist.length = 20;
      await setSetting(`developer.tiles.loadHistory`, hist);
      return meta;
    }
    catch (err) {
      return {
        error: true,
        message: `Failed to load manifest.json from dev tile: ${err.message}`,
      };
    }
  }
}

// this is so that we can send strings as streams
function createStream (text) {
  const rv = new PassThrough();
  rv.push(text);
  rv.push(null);
  return rv;
}

export async function tileProtocolHandler (req, cb) {
  const url = new URL(req.url);
  let cid;
  if (url.protocol === 'tile:') {
    cid = url.hostname;
  }
  else {
    return cb({
      statusCode: 421, // Misdirected Request
      mimeType: 'application/json',
      data: createStream(JSON.stringify({
        err: true,
        msg: `Backend does not support requests for scheme "${url.scheme}".`,
      }, null, 2)),
    });
  }
  console.warn(`url to cid`, req.url, cid);
  if (req.method !== 'GET') return cb({
    statusCode: 405, // Method Not Allowed
    mimeType: 'application/json',
    data: createStream(JSON.stringify({
      err: true,
      msg: `Request method "${req.method}" is not supported.`,
    }, null, 2)),
  });
  const send404 = () => {
    cb({
      statusCode: 404,
      mimeType: 'application/json',
      data: createStream(JSON.stringify({
        err: true,
        msg: `URL ${req.url} not found.`,
      }, null, 2)),
    });
  }
  const meta = await getSetting(`developer.tiles.localMap.${cid}`);
  if (!meta) return send404();
  const pathname = (url.pathname === '/' || !url.pathname) ? '/index.html' : url.pathname;
  const path = join(meta.dir, pathname);
  const mimeType = mime.lookup(path);
  const cspBase = `tile://${url.hostname}`;
  try {
    await access(path, constants.R_OK);
    cb({
      statusCode: 200,
      mimeType,
      headers: {
        'Content-Security-Policy': `default-src 'self' ${cspBase} data:; style-src 'self' 'unsafe-inline' ${cspBase}; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; img-src 'self' ${cspBase} blob: data:; media-src 'self' ${cspBase} blob: data:`,
      },
      data: createReadStream(path),
    });
  }
  catch (err) {
    console.warn(`nope`, err);
    send404();
  }
}
