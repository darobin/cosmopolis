
import { atom, action } from 'nanostores';

export const $uiSideBarShowing = atom(true);

export const showSideBar = action($uiSideBarShowing, 'showSideBar', (store) => store.set(true));
export const hideSideBar = action($uiSideBarShowing, 'hideSideBar', (store) => store.set(false));
export const toggleSideBar = action($uiSideBarShowing, 'toggleSideBar', (store) => store.set(!store.get()));

export const $uiFeedWidth = atom(0);
export const setFeedWidth = action($uiFeedWidth, 'setFeedWidth', (store, width) => {
  if (typeof width === 'string') width = parseInt(width, 10);
  if (isNaN(width)) throw new Error(`Invalid width.`);
  if (width < 0) throw new Error(`Width cannot be negative.`);
  store.set(width);
});

export const $uiFeedTitle = atom('');
export const setFeedTitle = action($uiFeedTitle, 'setFeedTitle', (store, title) => {
  if (!title || typeof title !== 'string') title = '';
  store.set(title);
});

export const $uiFeedIcon = atom('');
export const setFeedIcon = action($uiFeedIcon, 'setFeedIcon', (store, url) => {
  if (!url || typeof url !== 'string') url = '';
  store.set(url);
});
