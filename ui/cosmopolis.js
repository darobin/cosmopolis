
import "@shoelace-style/shoelace";
import { getAnimation, setDefaultAnimation } from '@shoelace-style/shoelace/dist/utilities/animation-registry.js';

// set shared preferences for animations
const detailsShowAnim = getAnimation(null, 'details.show', { dir: 'ltr' });
const detailsHideAnim = getAnimation(null, 'details.hide', { dir: 'ltr' });
const animOptions = { options: { duration: 100 } };
setDefaultAnimation('details.show', { ...detailsShowAnim, ...animOptions });
setDefaultAnimation('details.hide', { ...detailsHideAnim, ...animOptions });

// elements
import './el/lab-sidebar.js';
