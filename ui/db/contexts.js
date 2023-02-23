

import { registerStore, writable } from '../lib/model.js';

const defaultValue = { contexts: null, current: null, err: null };
const store = writable(defaultValue);

registerStore('contexts', store);

// XXX use .update to merge
// XXX export some actions

// export async function initIdentities () {
//   store.set({ state: 'loading', people: [] });
//   try {
//     const ipnsList = await window.envoyager.loadIdentities();
//     const resList = await Promise.all(ipnsList.map(({ ipns }) => fetch(`ipns://${ipns}`, { headers: { Accept: 'application/json' }})));
//     const people = (await Promise.all(resList.map(r => r.json()))).map((p, idx) => ({...p, url: `ipns://${ipnsList[idx].ipns}`}));
//     store.set({ state: 'loaded', people });
//   }
//   catch (err) {
//     store.set({ state: 'error', people: [], err });
//   }
// }
