
import { LitElement, html, css } from 'lit';
// import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import { getStore } from '../lib/model.js';
// import { saveContext, removeContext, selectContext } from '../db/contexts.js';
import { actionButton } from './button-styles.js';

export class CosmoFeeds extends LitElement {
  static styles = [
    css`
    #hint-root {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    `,
    actionButton,
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
      this.showHint = !this.feeds.length;
    });
    ftStore.subscribe(({ feedTypes }) => {
      if (!feedTypes || !feedTypes.length) {
        this.feedTypes = [];
        return;
      }
      this.feedTypes = feedTypes;
    });
  }
  handleAddFeed (ev) {
    const id = ev.detail.item.value;
    const type = this.feedTypes.find(({ id }) => id === id)?.type
    if (!type) return console.warn(`No feed constructor found for ${id}.`);
    const feed = await type.create();
    // XXX
    // - add to feed store
    // - save feed configuration to disk
    // this should all trigger the right stores and update the rendering
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
    if (this.showHint) return this.renderAddFeed();
    return html`
      <div id="root">
        x
      </div>
    `;
  }
  renderAddFeed (small = false) {
    return html`
      <div id="hint-root">
        <sl-dropdown @sl-select=${this.handleAddFeed}>
          <sl-button slot="trigger" ?caret=${!small} class="action" size=${small ? 'small' : 'large'}>
            <sl-icon name="view-list"></sl-icon>
            ${small ? html`<sl-icon name="plus-lg"></sl-icon>` : 'Add Feed'}
          </sl-button>
          <sl-menu>
            ${
              this.feedTypes.map(({ id, label }) => html`<sl-menu-item value=${id}>${label}</sl-menu-item>`)
            }
          </sl-menu>
        </sl-dropdown>
      </div>
    `;
  }
}

customElements.define('cm-feeds', CosmoFeeds);
