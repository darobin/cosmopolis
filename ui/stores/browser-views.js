
import { map, action } from 'nanostores';

window.cosmopolis.connectPort();
export const $browserViews = map({});

// XXX
//  - only have a single scroll/resize handler for all BV
//  - we should have an atom that we maintain here that is the scroll area to watch
//  - we also want an action to set that scroll area, as well as to deal with sidebar resizing/moving things
//  - validate props to avoid blowing up there

// Caller should use nanoid to know about the ID.
// Async actions can be awaited with allTasks() but postMessage is just fire and forget. We could wait for
// a response confirming load.
// props: x, y, width, height, src
export const addBrowserView = action($browserViews, 'addBrowserView', (store, id, props, wishHandler, wishType, wishID, wishData) => {
  const handlerWrapper = (data) => {
    data.tileID = id;
    wishHandler(data);
  };
  window.cosmopolis.addBrowserView(id, props, handlerWrapper, wishType, wishID, wishData);
  store.setKey(id, props);
});

export const updateBrowserView = action($browserViews, 'updateBrowserView', (store, id, props) => {
  window.cosmopolis.updateBrowserView(id, props);
  store.setKey(id, props);
});

export const removeBrowserView = action($browserViews, 'removeBrowserView', async (store, id) => {
  await window.cosmopolis.removeBrowserView(id);
  store.setKey(id, undefined);
});
