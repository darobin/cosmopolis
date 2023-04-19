
import { readTextFile, writeTextFile, createDir, BaseDirectory } from '@tauri-apps/api/fs';
import { watch } from "tauri-plugin-fs-watch-api";
import nanoid from "../smallid.js";
import { registerFeedType } from '../../db/feed-types.js'

const FEED_DIR = 'ipfs/feeds';
const BASE_DIR = { dir: BaseDirectory.AppConfig };

// we need this for initialisation in the hacky version
await createDir(FEED_DIR, { ...BASE_DIR, recursive: true });

class CuratedFeed {
  constructor (data = {}) {
    this.id = data.id || nanoid();
    this.items = data.items || [];
    this.handlers = [];
    this.eventSink = (evt) => this.handlers.forEach(h => h(evt));
  }
  toJSON () {
    return {
      type: 'Feed',
      id: this.id,
      items: this.items,
    };
  }
  onUpdate (cb) {
    this.handlers.push(cb);
  }
  unload () {
    if (this.stopWatching) this.stopWatching();
  }
  static async create () {
    const feed = new CuratedFeed();
    await writeFeed(feed);
    return feed;
  }
  static async load (id, doWatch) {
    const feed = new CuratedFeed(await readFeed(id));
    if (doWatch) feed.stopWatching = await watchFeed(id, feed.eventSink);
    return feed;
  }
}

async function writeFeed (feed) {
  // console.warn(`writing ${FEED_DIR}/${feed.id}.json`, JSON.stringify(feed, null, 2), BASE_DIR);
  await writeTextFile(`${FEED_DIR}/${feed.id}.json`, JSON.stringify(feed, null, 2), BASE_DIR);
}

async function readFeed (id) {
  return await readTextFile(`${FEED_DIR}/${id}.json`, BASE_DIR);
}

async function watchFeed (id, cb) {
  const stopWatching = await watch(
    `${FEED_DIR}/${id}`,
    {},
    (evt) => {
      // const { type, payload } = event;
      cb(evt);
    }
  );
  return stopWatching;
}

registerFeedType({
  id: 'curated-feed',
  label: 'Curated Feed',
  type: CuratedFeed,
});
