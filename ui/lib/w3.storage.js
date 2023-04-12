
import { Web3Storage } from 'web3.storage';
import { Store } from "tauri-plugin-store-api";

const TOKEN = '$token';
const store = new Store("w3.storage.store");

let client;

export async function getToken () {
  return await store.get(TOKEN);
}

export async function setToken (token) {
  await store.set(TOKEN, token);
  await store.save();
}

export async function deleteToken () {
  await store.delete(TOKEN);
  await store.save();
}

export async function registerTokenChange (cb) {
  await store.onKeyChange(TOKEN, cb);
}

export async function checkToken (token) {
  try {
    const c = new Web3Storage({ token });
    const res = await c.list({ maxResults: 1 });
    await res[Symbol.asyncIterator]().next()
    return true;
  }
  catch (err) {
    return false;
  }
}

export async function getClient () {
  if (client) return client;
  const token = await getToken();
  if (!token) return;
  client = new Web3Storage({ token });
  return client;
}
