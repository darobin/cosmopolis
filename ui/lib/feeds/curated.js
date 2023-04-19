
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import nanoid from "../smallid.js";
import { registerFeedType } from '../../db/feed-types.js'

class CuratedFeed {
  constructor () {
    this.id = nanoid();
    this.items = [];
  }
  toJSON () {
    return {
      type: 'Feed',
      id: this.id,
      items: this.items,
    };
  }
  static async create () {
    const feed = new CuratedFeed();
    await writeFeed(feed);
    return new CuratedFeed(feed);
  }
}

async function writeFeed (feed) {
  await writeTextFile(`${feed.id}.json`, JSON.stringify(feed, null, 2), { dir: BaseDirectory.AppConfig });
}

registerFeedType({
  id: 'curated-feed',
  label: 'Curated Feed',
  type: CuratedFeed,
});
