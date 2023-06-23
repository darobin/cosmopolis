
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { createReadStream, constants } from 'node:fs';
import { PassThrough } from 'node:stream';
import mime from 'mime-types';
import { get as getSetting } from 'electron-settings';

// NOTE
// This is currently only equiped for loading dev tiles locally. Notably, it resolves
// dev tiles directly via the preferences system, which should be encapsulated.

export default async function tileProtocolHandler (req, cb) {
  const url = new URL(req.url);
  let cid;
  if (url.protocol === 'tile:') {
    cid = url.hostname;
  }
  else {
    return cb({
      statusCode: 421, // Misdirected Request
      mimeType: 'application/json',
      data: createStream(JSON.stringify({
        err: true,
        msg: `Backend does not support requests for scheme "${url.scheme}".`,
      }, null, 2)),
    });
  }
  console.warn(`url to cid`, req.url, cid);
  if (req.method !== 'GET') return cb({
    statusCode: 405, // Method Not Allowed
    mimeType: 'application/json',
    data: createStream(JSON.stringify({
      err: true,
      msg: `Request method "${req.method}" is not supported.`,
    }, null, 2)),
  });
  const send404 = () => {
    cb({
      statusCode: 404,
      mimeType: 'application/json',
      data: createStream(JSON.stringify({
        err: true,
        msg: `URL ${req.url} not found.`,
      }, null, 2)),
    });
  }
  const meta = await getSetting(`developer.${cid}`);
  if (!meta) return send404();
  const pathname = (url.pathname === '/' || !url.pathname) ? '/index.html' : url.pathname;
  const path = join(meta.dir, pathname);
  const mimeType = mime.lookup(path);
  const cspBase = `tile://${url.hostname}`;
  try {
    await access(path, constants.R_OK);
    cb({
      statusCode: 200,
      mimeType,
      headers: {
        'Content-Security-Policy': `default-src 'self' ${cspBase} data: blob:; style-src 'self' 'unsafe-inline' ${cspBase}; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; img-src 'self' ${cspBase} blob: data:; media-src 'self' ${cspBase} blob: data:; frame-src 'self' ${cspBase} blob: data:`,
      },
      data: createReadStream(path),
    });
  }
  catch (err) {
    console.warn(`nope`, err);
    send404();
  }
}

// this is so that we can send strings as streams
function createStream (text) {
  const rv = new PassThrough();
  rv.push(text);
  rv.push(null);
  return rv;
}
