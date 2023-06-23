
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ipcMain, dialog, BrowserView }  from 'electron';
import { get as getSetting, set as setSetting, unset as unsetSetting } from 'electron-settings';
import mime from 'mime-types';
import chalk from 'chalk';
import loadJSON from './lib/load-json.js';
import nanoid from './lib/smallid.js';


const { handle } = ipcMain;

export function registerPlatformServiceHandlers () {
  handle('dbg:warn', handleDebugWarn);
  handle('settings:get', handleSettingsGet);
  handle('settings:set', handleSettingsSet);
  handle('pick:tile-dev', handlePickDevTile);
  handle('tiles:list-local', handleListLocalTiles);
  handle('tiles:install', handleInstallTile);
  handle('tiles:like', handleLikeTile);
  handle('tiles:refresh', handleRefreshTile);
  handle('tiles:remove', handleRemoveTile);
  handle('wish:pick-local-image', handlePickLocalImage);
}

let receiveMessagePort;
const browserViews = {};
export function connectMessaging (mainWindow) {
  ipcMain.on('connect-port', (ev) => {
    receiveMessagePort = ev.ports[0];
    receiveMessagePort.postMessage('test-yo');
    receiveMessagePort.on('message', (ev) => {
      const { type, x, y, width, height, src, id } = ev.data;
      if (type === 'add-browser-view') {
        const bv = new BrowserView();
        mainWindow.setBrowserView(bv);
        bv.setBounds({ x, y, width, height })
        bv.webContents.loadURL(src);
        browserViews[id] = bv;
      }
      else if (type === 'update-browser-view') {
        browserViews[id]?.setBounds({ x, y, width, height });
      }
      else if (type === 'remove-browser-view') {
        if (browserViews[id]) mainWindow.removeBrowserView(browserViews[id]);
      }
    });
    receiveMessagePort.start();
  });
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
      const meta = {
        id,
        url,
        dir,
        manifest,
      };
      await setSetting(`developer.tiles.localMap.${id}`, meta);
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

// XXX we should be passing parameters here
async function handlePickLocalImage () {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Pick Image',
    buttonLabel: 'Pick',
    properties: ['openFile', 'treatPackageAsDirectory'],
    message: 'Pick an image.'
  });
  if (canceled) return;
  if (filePaths && filePaths.length) {
    const img = filePaths[0];
    const type = mime.lookup(img);
    return {
      blob: await readFile(img),
      type,
    };
  }
}

function handleDebugWarn (ev, str) {
  console.warn(chalk.magenta(str));
}

async function handleListLocalTiles () {
  return getSetting('developer.tiles.localMap');
}

async function handleInstallTile (ev, url, installed = true, wishes) {
  console.warn(url, installed, wishes);
  await setLocalTileField(url, 'installed', installed)
  await manageWishInstallation(url, installed, wishes);
}
async function handleLikeTile (ev, url, liked = true) {
  await setLocalTileField(url, 'liked', liked)
}

async function handleRemoveTile (ev, url) {
  const id = new URL(url).hostname;
  return unsetSetting(`developer.tiles.localMap.${id}`);
}

async function handleRefreshTile (ev, url) {
  const id = new URL(url).hostname;
  const meta = await getSetting(`developer.tiles.localMap.${id}`);
  if (!meta?.dir) return;
  meta.manifest = JSON.parse(await readFile(join(meta.dir, 'manifest.json')));
  return setSetting(`developer.tiles.localMap.${id}`, meta);
}



async function setLocalTileField (url, key, value) {
  const id = new URL(url).hostname;
  await setSetting(`developer.tiles.localMap.${id}.${key}`, value);
}

async function manageWishInstallation (url, installed, wishes) {
  const wishSources = await getSetting('wish.sources') || {};
  if (installed) {
    wishes.forEach(wish => {
      const { type, name, description, icons, mediaTypes } = wish;
      if (!wishSources[type]) wishSources[type] = [];
      wishSources[type] = wishSources[type].filter(src => src.url !== url);
      if (installed) {
        wishSources[type].push({
          type,
          name,
          description,
          icons,
          url,
          mediaTypes,
        });
      }
    });
  }
  else {
    Object.keys(wishSources).forEach(type => {
      wishSources[type] = wishSources[type].filter(w => w.url !== url);
    });
  }
  await setSetting('wish.sources', wishSources);
}
