
import { registerReload } from "./lib/debug.js";
import { invoke, appWindow } from './lib/tauri.js';

appWindow.maximize();
registerReload();

// fake until we really do something
const h1 = document.querySelector('h1');
h1.style.color = 'orange';

// add a welcome
const p = document.createElement('p');
p.textContent = await invoke('welcome', { name: 'cosmopolis' });
h1.after(p);
