/* global module */
import { get as getSetting } from 'electron-settings';
import chalk from 'chalk';
import nanoid from './smallid.js';

const WISH_TYPES = new Set(['pick']);
const ICONS_PATH = 'file:///ui/assets/icons';
// const wishListInteractions = {};

// WISHES!
// The approach I am taking here is to have different wish constructors for each broader verb
// class. The thinking is that each of these maps to different interaction modalities, and
// will therefore have different APIs. This is somewhat similar to events.

// Each wish is described by:
//  - name
//  - description
//  - icons
//  - mediaTypes
//  - headless?
//  - url
//  - internal (points to the implementation)
async function findMatchingWish (type, options = {}) {
  if (!WISH_TYPES.has(type)) throw new Error(`Unknown wish type "${type}".`);
  let granters = await getSetting(`wish.sources.${type}`) || [];
  if (type === 'pick') {
    if (options.filters) granters = granters.filter(grant => hasMatchingType(grant.mediaTypes, options.filters));
    granters.unshift({
      name: 'Local device file',
      description: 'Pick a file from a local device drive',
      icons: [{ src: `${ICONS_PATH}/file-earmark-fill.svg` }],
      headless: true,
      internal: new FilePickerPickWish({ filters: options.filters }),
    });
  }
  return granters.map(g => ({ ...g, id: nanoid() }));
}

function hasMatchingType (supported, filters) {
  if (supported.some(sup => sup === '*')) return true;
  if (filters.some(fil => fil === '*')) return true;
  return filters.some(fil => {
    if (/\w+\/\*/.test(fil)) return supported.some(sup => sup.startsWith(fil.replace(/\*$/, '')));
    const wild = fil.replace(/\/\w+/, '/*');
    return supported.some(sup => sup === fil || sup === wild);
  });
}

async function registerWishInteraction (granters) {
  return new Promise((resolve) => {
    const wishID = nanoid();
    // wishListInteractions[wishID] = granters.map(({ name, description, icons, id }) => ({ name, description, icons, id }));
    granters = granters.map(({ name, description, icons, id }) => ({ name, description, icons, id }));
    ww(`filing with`, wishID)
    // WARNING
    // `parent.postMessage` might not work in Electron, for some reason
    // We know that event.source works for replying to a message when the parent initiates. So if `parent` doesn't
    // work, one option might be that on load for every tile it sends a message which we listen to and we save the source
    // in a global.
    parent.postMessage({ type: 'cm-wish-select-granter', granters, wishID });
    const handler = (ev) => {
      ww(`msg`, ev.data.type, ev.data.wishID);
      if (ev.data?.wishID === wishID) {
        window.removeEventListener('message', handler);
        if (ev.data?.type === 'cm-wish-granter-selected') resolve({ granterID: ev.data.granter, wishID });
        else if (ev.data?.type === 'cm-wish-cancelled') resolve({});
      }
    };
    window.addEventListener('message', handler);
  });
}

async function instantiateWish (granter, wishID) {
  return new Promise((resolve) => {
    ww(`send instantiation`, granter, wishID);
    parent.postMessage({ type: 'cm-wish-instantiate', granter, wishID });
    const handler = (ev) => {
      ww(`msg`, ev.data.type, ev.data.wishID);
      window.removeEventListener('message', handler);
      if (ev.data?.wishID === wishID) {
        if (ev.data?.type === 'cm-wish-granted') resolve({ payload: ev.data.payload });
        else if (ev.data?.type === 'cm-wish-cancelled') resolve({});
      }
    };
    window.addEventListener('message', handler);
  });
}

// XXX what does picking a contact look like? maybe just vaddr+json
class Wish {
  #type;
  #filters = ['image/*'];
  #multiple = false;
  #title = 'Pick';
  #message = '';
  constructor (type, { filters, multiple, title, message } = {}) {
    ww(`ctor`, type)
    if (!WISH_TYPES.has(type)) throw new Error(`Unknown wish type "${type}".`);
    this.#type = type;
    if (filters && Array.isArray(filters)) this.#filters = filters;
    if (typeof multiple !== 'undefined') this.#message = !!message;
    if (typeof title === 'string') this.#title = title;
    if (typeof message === 'string') this.#message = message;
  }
  get type () { return this.#type; }
  get filters () { return this.#filters; }
  get multiple () { return this.#multiple; }
  get title () { return this.#title; }
  get message () { return this.#message; }
  async grant () {
    ww(`granting…`)
    const granters = await findMatchingWish('pick', { filters: this.#filters });
    ww(`matched`, granters)
    // IMPORTANT NOTE
    // In the UI, if there are no granters we need an interaction to run a search. That won't work with this model
    // that expects to already know about them all. We will refactor later.
    ww(`registering interaction…`)
    const { granterID, wishID } = await registerWishInteraction(granters);
    ww(`id=`, granterID, wishID)
    // wish was cancelled, we resolve with undefined
    if (!granterID) return;
    const granter = granters.find(g => g.id === granterID);
    ww(`running…`)
    if (granter.internal) return await granter.run();
    return await instantiateWish(granter, wishID);
  }
}

// - events
// - promises

// this is an internal wish implementation
// probably factor out at some point
class FilePickerPickWish {
  constructor ({ filters } = {}) {
    this.filters = filters;
  }
  async run () {}
}

function ww (...str) {
  console.warn(...str.map(s => chalk.cyan(s)));
}

module.exports = {
  Wish,
};
