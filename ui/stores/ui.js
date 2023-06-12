
import { map, action } from 'nanostores';

export const $ui = map({
  sideBarShowing: false,
});

export const showSideBar = action($ui, 'showSideBar', (store) => store.setKey('sideBarShowing', true));
export const hideSideBar = action($ui, 'hideSideBar', (store) => store.setKey('sideBarShowing', false));
export const toggleSideBar = action($ui, 'toggleSideBar', (store) => {
  console.warn(`TOGGLE ${store.value.sideBarShowing}`);
  store.setKey('sideBarShowing', !store.value.sideBarShowing);
});
