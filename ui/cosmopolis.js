
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import "@shoelace-style/shoelace";
import { registerReload } from "./lib/debug.js";
import './lib/contexts.js';

// this will need to move to its own thing so we can remember previous sizes
appWindow.maximize();

registerReload();

// fake until we really do something
const h1 = document.querySelector('h1');
h1.style.color = 'orange';

// add a welcome
const p = document.createElement('p');
p.textContent = await invoke('welcome', { name: 'cosmopolis' });
h1.after(p);
