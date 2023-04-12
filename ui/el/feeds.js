
import { LitElement, html, css, nothing } from 'lit';
// import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import { getStore } from '../lib/model.js';
// import { saveContext, removeContext, selectContext } from '../db/contexts.js';
// import { actionButton } from './button-styles.js';

export class CosmoFeeds extends LitElement {
  static styles = [
    css`
    :host {
      border: 1px solid white;
    }
    `,
  ];
  static properties = {
    feeds: { attribute: false },
    feedTypes: { attribute: false },
    showHint: { attribute: false },
  };
  constructor () {
    super();
    const ctxStore = getStore('contexts');
    const ftStore = getStore('feed-types');
    this.showHint = false;
    this.feeds = [];
    this.feedTypes = [];
    ctxStore.subscribe(({ contexts, current }) => {
      if (!contexts || !contexts.length) {
        this.feeds = [];
        this.showHint = false;
        return;
      }
      if (!current) return;
      this.feeds = (this.contexts || []).find(ctx => ctx.$id === current)?.feeds || [];
      this.showHint = !!this.feeds.length;
    });
    ftStore.subscribe(({ feedTypes }) => {
      if (!feedTypes || !feedTypes.length) {
        this.feedTypes = [];
        return;
      }
      this.feedTypes = feedTypes;
    });
  }
  // XXX
  //  - if empty, just put a hint with "add feed" in the middle, no plus column
  //  - make a special button-select component that offers a menu to select from when clicked (here of feed types)
  //  - horizontal feeds flex, with fixed sizes except the last one (also fixed but just plus)
  //  - horizontal scrolling, no vertical scrolling
  //  - each feed is a panel, can request resize from parent (we can just force the sizes of child, no need to communicate)
  //  - feed settings editor in the top bar
  //  - when that's done, play with w3.storage
  render () {
    return html`
      <div id="root">
        x
      </div>
    `;
  }
}

customElements.define('cm-feeds', CosmoFeeds);
