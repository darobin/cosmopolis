

import { registerStore, writable } from '../lib/model.js';

const defaultValue = { feedTypes: [] };
const store = writable(defaultValue);

registerStore('feed-types', store);

// feedType is id, label, obj
export function registerFeedType (feedType) {
  store.update((data) => {
    if (!data.feedTypes.find(({ id }) => id === feedType.id)) data.feedTypes.push(feedType);
    return data;
  });
}
