
import { Readable } from 'node:stream';
import { createReadStream, createWriteStream } from 'node:fs';
import { getClient } from '../w3.storage.js';
import { registerFeedType } from '../../db/feed-types.js'
import { encode } from 'multiformats/block'
import * as cbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { CarReader, CarWriter } from '@ipld/car';
import { temporaryFile } from 'tempy';

function encodeCBOR (value) {
  return encode({ value, codec: cbor, hasher: sha256 });
}

// This is a bit of a mess, Readable.from(out) is prone to failing silently in some cases.
// We totally shouldn't need to be relying on a tmpfile here, but the only example that worked
// went through a file and so file it is.
async function makeCar (rootCID, ipldBlocks) {
  const { writer, out } = CarWriter.create([rootCID]);
  const fn = temporaryFile();
  Readable.from(out).pipe(createWriteStream(fn));
  for (const b of ipldBlocks) {
    await writer.put(b);
  }
  await writer.close();
  return await CarReader.fromIterable(createReadStream(fn));
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
    //  - store it
    //  - name it
    //  - return it, and keep the name
  }
}

registerFeedType({
  id: 'curated-feed',
  label: 'Curated Feed',
  type: CuratedFeed,
});

await CuratedFeed.create();
