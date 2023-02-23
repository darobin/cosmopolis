
import { appWindow } from '@tauri-apps/api/window';
import "@shoelace-style/shoelace";
import { registerReload } from "./lib/debug.js";
import './lib/contexts.js';

// models
import './db/contexts.js';

// elements
import './el/contexts.js';

// this will need to move to its own thing so we can remember previous sizes
appWindow.maximize();

registerReload();
