
import { screen }  from 'electron';
// use the sync version because async can't save before exit
import { getSync as getSetting, setSync as setSetting } from 'electron-settings';

const SETTING = 'window.position';
const DEBOUNCE = 1000;
let debounceTimer;

export async function manageWindowPosition (win) {
  const { workAreaSize: { width, height }, bounds: displayBounds } = screen.getPrimaryDisplay();
  const defaultState = { width, height, displayBounds };
  const winState = getSetting(SETTING) || {};
  if (winState) {
    const onSomeDisplay = screen.getAllDisplays().find(({ bounds: { x, y, width, height } }) => {
      return winState.x >= x && winState.y >= y &&
            (winState.x + winState.width) <= (x + width) &&
            (winState.y + winState.height) <= (y + height)
      ;
    });
    if (!onSomeDisplay) Object.assign(winState, defaultState);
  }
  else {
    Object.assign(winState, defaultState);
  }
  win.setBounds(winState);
  const save = () => {
    setSetting(SETTING, winState);
  };
  const positionChange = () => {
    const winBounds = win.getBounds();
    if (!win.isMaximized() && !win.isMinimized() && !win.isFullScreen()) Object.assign(winState, winBounds);
    winState.displayBounds = screen.getDisplayMatching(winBounds).bounds;
    save();
  };
  const debouncedPositionChange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(positionChange, DEBOUNCE);
  };
  const unmanage = () => {
    if (win) {
      save();
      win.removeListener('resize', debouncedPositionChange);
      win.removeListener('move', debouncedPositionChange);
      clearTimeout(debounceTimer);
      win.removeListener('close', unmanage);
      win.removeListener('closed', unmanage);
      win = null;
    }
  };

  win.on('resize', positionChange);
  win.on('move', positionChange);
  // win.on('close', unmanage);
  win.on('closed', unmanage);
}
