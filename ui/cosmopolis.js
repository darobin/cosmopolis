
import "@shoelace-style/shoelace";
import { getAnimation, setDefaultAnimation } from '@shoelace-style/shoelace/dist/utilities/animation-registry.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// configure shoelace assets
setBasePath('./ui');

// set shared preferences for animations
const detailsShowAnim = getAnimation(null, 'details.show', { dir: 'ltr' });
const detailsHideAnim = getAnimation(null, 'details.hide', { dir: 'ltr' });
const animOptions = { options: { duration: 100 } };
setDefaultAnimation('details.show', { ...detailsShowAnim, ...animOptions });
setDefaultAnimation('details.hide', { ...detailsHideAnim, ...animOptions });

// stores
import './stores/local-tiles.js';

// elements
// import './el/lab-sidebar.js';
// import './el/lab-workshop.js';
import './el/title-bar.js';
import './el/side-bar.js';
import './el/tile-icon.js';
import './el/tile-card.js';
import './el/tile.js';
import './el/identity-switcher.js';
import './el/feed-tiles-stack.js';
