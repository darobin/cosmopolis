
import { LitElement, html, css } from 'lit';
// import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import { getStore } from '../lib/model.js';
import { addFeedToContext } from '../db/contexts.js';
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
  async handleAddFeed (ev) {
    const id = ev.detail.item.value;
    const type = this.feedTypes.find(({ id }) => id === id)?.type
    if (!type) return console.warn(`No feed constructor found for ${id}.`);
    const feed = await type.create();
    await addFeedToContext(feed);
    // XXX
    // when the context refreshes:
    //  . we should see that we have a new feed ID
    //  . then we attach a feed store to that somehow
    //  . then we load/watch that feedstore and can refresh UI from that
    //  . we probably want to use fs-watch for that
  }
  // XXX
  //  - we need some sort of feedstore that could provide a subscription source ()
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
