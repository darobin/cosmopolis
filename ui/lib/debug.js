
import { makeKeyDownMatcher } from "./keyboard.js";

export function registerReload () {
  window.addEventListener('keydown', makeKeyDownMatcher('cmd+R', reload));
  window.addEventListener('keydown', makeKeyDownMatcher('ctrl+R', reload));
}

function reload () {
  console.warn('RELOAD');
  window.reload();
}
