

import { registerStore, writable } from '../lib/model.js';
import { getToken, setToken, registerTokenChange, deleteToken } from '../lib/w3.storage.js';

const defaultValue = { token: await getToken() };
const store = writable(defaultValue);

registerStore('w3.storage-token', store);

registerTokenChange((token) => {
  store.update((data) => ({ ...data, token }));
});

export async function saveToken (token) {
  return await setToken(token);
}

export async function removeToken () {
  return await deleteToken();
}
