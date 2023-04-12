
import { getClient } from '../w3.storage.js';
import { registerFeedType } from '../../db/feed-types.js'
import { encode } from 'multiformats/block'
import * as cbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { CarReader, CarWriter } from '@ipld/car';

function encodeCBOR (value) {
  return encode({ value, codec: cbor, hasher: sha256 });
}

// XXX
// No idea if this works
async function makeCar (rootCID, ipldBlocks) {
  const { writer, out } = CarWriter.create([rootCID]);
  const chunks = []; // XXX maybe make this more of a Uint8Array that we append to
  for (const b of ipldBlocks) {
    await writer.put(b);
  }
  await writer.close();
  for await (const c of out) chunks.push(c);
  return await CarReader.fromIterable(chunks);
}

class CuratedFeed {
  constructor () {
    // XXX
  }
  static async create () {
    const w3 = await getClient();
    if (!w3) return console.warn(`Could not get a W3.Storage client.`);
    const feed = {
      type: 'Feed',
      items: [],
    };
    const block = await encodeCBOR(feed);
    console.warn(`block`, block.cid);
    const car = await makeCar(block.cid, [block]);
    console.warn(`car reader`, await car.cids());
    // NOTE: I'm a little worried that this is returning the same CID as that for the root block
    const cid = await w3.putCar(car);
    console.warn(`car cid`, cid);
    // XXX
    //  - name it
    //    - create new name
    //    - SAVE ITS BYTES IN LOCAL STORAGE (noting that this isn't great for security)
    //    - publish the name/value
    //  - return it, and keep the name
  }
}

registerFeedType({
  id: 'curated-feed',
  label: 'Curated Feed',
  type: CuratedFeed,
});

await CuratedFeed.create();
