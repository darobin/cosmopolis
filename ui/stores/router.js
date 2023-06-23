
import { createRouter } from '../lib/router';
import { setFeedWidth, setFeedTitle, setFeedIcon } from './ui.js';

export const $router = createRouter({
  home: '/',
  // XXX search can save params to local store with a nanoid, we just have to be careful about changing
  // the ID with every changed param. Use a fake ID for an edited, unsaved search and that is persisted.
  search: '/search/:savedSearch?',
  social: '/social/:list?',
  library: '/library/:path?',
  apps: '/apps/',
});

$router.subscribe((store) => {
  const route = store.route;
  console.warn(`Deriving from route with ${route}`);
  if (route === 'apps') {
    setFeedWidth(360);
    setFeedTitle('Apps');
    setFeedIcon('builtin:app-indicator');
  }
  else {
    setFeedWidth(0);
    setFeedTitle('');
    setFeedIcon('');
  }
});
