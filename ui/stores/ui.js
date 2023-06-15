
import { map, action } from 'nanostores';

export const $ui = map({
  sideBarShowing: true,
});

export const showSideBar = action($ui, 'showSideBar', (store) => store.setKey('sideBarShowing', true));
export const hideSideBar = action($ui, 'hideSideBar', (store) => store.setKey('sideBarShowing', false));
export const toggleSideBar = action($ui, 'toggleSideBar', (store) => {
  store.setKey('sideBarShowing', !store.value.sideBarShowing);
});
