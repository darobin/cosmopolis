
import { registerFeedType } from '../../db/feed-types.js'

class CuratedFeed {
  constructor () {
    // XXX
  }
  static create () {
    // XXX
  }
}

registerFeedType({
  id: 'curated-feed',
  label: 'Curated Feed',
  type: CuratedFeed,
});
