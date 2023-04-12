
import { registerFeedType } from '../../db/feed-types.js'

class CuratedFeed {
  constructor (id) {
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
