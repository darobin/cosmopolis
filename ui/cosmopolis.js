
import { appWindow } from '@tauri-apps/api/window';
import "@shoelace-style/shoelace";
import { registerReload } from "./lib/debug.js";
import './lib/contexts.js';
import './lib/w3.storage.js';

// models
import './db/contexts.js';
import './db/feed-types.js';
import './db/w3.storage-token.js';

// elements
import './el/contexts.js';
import './el/context-link.js';
import './el/feeds.js';
import './el/w3.storage-token.js';

// feed types
import './lib/feeds/curated.js';

// this will need to move to its own thing so we can remember previous sizes
appWindow.maximize();

registerReload();
