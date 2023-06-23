
import { atom, action } from 'nanostores';

export const $uiSideBarShowing = atom(true);

export const showSideBar = action($uiSideBarShowing, 'showSideBar', (store) => store.set(true));
export const hideSideBar = action($uiSideBarShowing, 'hideSideBar', (store) => store.set(false));
export const toggleSideBar = action($uiSideBarShowing, 'toggleSideBar', (store) => store.set(!store.get()));
