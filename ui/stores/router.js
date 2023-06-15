
import { createRouter } from '../lib/router';

export const $router = createRouter({
  home: '/',
  // XXX search can save params to local store with a nanoid, we just have to be careful about changing
  // the ID with every changed param. Use a fake ID for an edited, unsaved search and that is persisted.
  search: '/search/:savedSearch?',
});
