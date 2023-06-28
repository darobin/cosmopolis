
import { LitElement, html, css, nothing } from 'lit';
import { withStores } from "@nanostores/lit";
import { computed } from 'nanostores'
import { $router } from '../stores/router.js';
import { $uiSideBarShowing, $uiFeedWidth, $uiFeedTitle, $uiFeedIcon, $uiFeedData, $uiFeedMode, $uiTilePrimary } from '../stores/ui.js';
import { $wishSelector, showWishSelector, cancelWishSelection, $wishGranterCandidates, makeAWish, $wishTiles } from '../stores/wishes.js';

// this has to always be px
const SIDE_BAR_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cm-side-bar-width'), 10);
const $left = computed($uiSideBarShowing, ui => ui ? SIDE_BAR_WIDTH : 0);
const PRIMARY_TILE_WIDTH = 880;
const BORDER_WIDTH = 1;
const TITLE_BAR_HEIGHT = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cm-osx-title-bar-height'), 10);
const CARD_HEADER_HEIGHT = 45;
// const CARD_FOOTER_HEIGHT = 0; // XXX this will obviously have to change

// XXX what happens here
//  - there is a feed column
//    - its width, template, layout, and data source depend on the route (plus possibly a UI toggle)
//  - then there can be a tile, followed by * wish tiles, followed by ? wish picker
//  - the feed is rendered by:
//    - applying the right layout (just a class)
//    - selecting the right data store based on the route (this should be a computed store, but local to this file)
//    - setting the right width (also from the class, but we need to know it too)
//    - iterating the data with the template (no paging yet)
//  - tiles are rendered with BrowserContext, positioned absolutely based on existing calculations
//    - how does this work with horizontal scrolling?
//    - maybe on scroll they get replaced with an element of the same size, grey (or maybe that's always behind them and they get hidden)

// how do we test this?
//  - then try to rebuild the proper experience
//  - WISH MESSAGING MUST ONLY BE VIA THE ROOT
//  - need to wipe all BVs on route change. Because they're set by the main process, they persist reloads and bugs. (should wipe on reload)

// ISSUES
//  - need to render the side bar inside a BV if we want it to z-index on top
//  - scroll events don't bubble up from the tile viewport, we'll have to make sure they do

export class CosmoFeedTilesStack extends withStores(
    LitElement,
    [
      $router,
      $left,
      $uiFeedWidth, $uiFeedTitle, $uiFeedIcon, $uiFeedMode, $uiFeedData, $uiTilePrimary,
      $wishSelector, $wishGranterCandidates, $wishTiles,
    ]
  ) {
  static styles = [
    css`
      :host {
        display: block;
      }
      p {
        font-weight: bold;
      }
      #root {
        position: fixed;
        overflow-y: auto;
        left: 0;
        right: 0;
        bottom: 0;
        top: var(--cm-osx-title-bar-height);
        transition: left var(--sl-transition-medium);
      }
      #feed {
        position: absolute;
        top: 0;
        bottom: 0;
      }
      #primary-tile {
        position: absolute;
        top: 0;
        bottom: 0;
      }
      #selector {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 360px;
      }
      h3 {
        margin: 0;
        display: flex;
        align-items: center;
        font-weight: 100;
        font-variation-settings: "wght" 100;
      }
      h3 sl-icon, h3 img {
        height: 20px;
        width: 20px;
        min-height: 20px;
        min-width: 20px;
        margin-right: var(--sl-spacing-small);
      }
      sl-card::part(base) {
        border-radius: 0;
        height: 100%;
      }
      sl-card::part(body) {
        --padding: 0;
        flex-grow: 1;
        overflow: auto;
      }
      sl-card::part(footer) {
        text-align: right;
      }
      .mode-icon-grid {
        display: grid;
        grid: auto-flow / repeat(4, 80px);
        padding: var(--sl-spacing-large);
      }
      .mode-icon-grid a {
        display: block;
        padding: var(--sl-spacing-x-small);
        text-align: center;
        text-decoration: none;
        color: inherit;
        font-size: 0.9rem;
        /* overflow-wrap: break-word; */
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color var(--sl-transition-medium);
      }
      .mode-icon-grid a:hover {
        color: var(--cm-electric-blue);
      }
      .selector-icon-grid {
        padding: var(--sl-spacing-medium);
      }
      .selector-icon-grid > div {
        padding-bottom: var(--sl-spacing-small);
      }
      .selector-icon-grid sl-button {
        width: 100%;
      }
      .selector-icon-grid sl-button::part(base) {
        justify-content: flex-start;
      }
    `
  ];
  static properties = {
    scrollLeft: { type: Number },
    scrollTick: { type: Boolean },
  };
  constructor () {
    super();
    $wishSelector.subscribe((sel) => {
      if (sel.showing) this.scrollRight();
    });
    $wishTiles.subscribe(() => this.scrollRight());
  }
  // this is called whenver a tile makes a wish
  // { tileID: the target tile, type: make-wish|, wish: { id: wish ID, ...} }
  wishHandler (data) {
    console.warn(`wishing`, data);
    if (data.type === 'make-wish') showWishSelector(data.tileID, data.wish);
  }
  handleSelectWish (ev) {
    const link = ev.currentTarget.getAttribute('data-link');
    makeAWish(link);
  }
  scrollRight () {
    const root = this.shadowRoot?.querySelector('#root');
    if (!root) return;
    setTimeout(() => {
      root.scrollLeft = root.scrollWidth;
      // Smooth sounds good but trying to update the BrowserView fast enough throws an endless
      // series of exceptions. There may be a fix (hiding the BV), I haven't dug into it.
      // root.scrollTo({ left: root.scrollWidth, behavior: 'smooth' });
    }, 100);
  }
  updateScroll () {
    if (!this.scrollTick) {
      window.requestAnimationFrame(() => {
        this.scrollLeft = this.shadowRoot.querySelector('#root').scrollLeft;
        this.scrollTick = false;
      });
      this.scrollTick = true;
    }
  }
  renderDataForMode () {
    if ($uiFeedMode.value === 'icon-grid') {
      return html`
        <div class="mode-icon-grid">
          ${$uiFeedData.value.map(ti => html`
            <a href=${ti.link}>
              <span class="icon"><cm-tile-icon size="48" alt=${`${ti.short_name || ti.name} icon`} base=${`tile://${ti.authority}/`} .sources=${ti.icons}></cm-tile-icon></span>
              <span class="name">${ti.short_name || ti.name}</span>
            </a>
          `)}
        </div>
      `;
    }
    if ($uiFeedMode.value === 'tiles-timeline') {
      return html`
        <div class="mode-tiles-timeline">
          ${$uiFeedData.value.map(tile => html`<cm-tile-card .tile=${tile}></cm-tile-card>`)}
        </div>
      `;
    }
    return html`
      <ul>
        ${$uiFeedData.value.map(ti => html`<li>${ti.name}</li>`)}
      </ul>
    `;
  }
  renderFeed () {
    if ($uiFeedWidth.value) {
      const iconURL = $uiFeedIcon.value;
      let icon = nothing;
      if (iconURL) {
        if (iconURL.startsWith('builtin:')) {
          icon = html`<sl-icon name=${iconURL.replace('builtin:', '')}></sl-icon>`;
        }
        else {
          icon = html`<img src=${iconURL} width="20" height="20">`;
        }
      }
      return html`
        <sl-card id="feed" style=${`width: ${$uiFeedWidth.value}px`}>
          <div slot="header">
            <h3>${icon} ${$uiFeedTitle.value}</h3>
          </div>
          ${this.renderDataForMode()}
        </sl-card>
      `;
    }
    return nothing;
  }
  renderPrimaryTile () {
    const root = this.shadowRoot.querySelector('#root');
    if ($uiTilePrimary.value && root) {
      const left =  $uiFeedWidth.value;
      const tileX = left + $left.value + BORDER_WIDTH - (this.scrollLeft || 0);
      const tileY = TITLE_BAR_HEIGHT + CARD_HEADER_HEIGHT + BORDER_WIDTH;
      const tileHeight = (root.clientHeight || 0) - (CARD_HEADER_HEIGHT + BORDER_WIDTH);
      return html`
        <sl-card id="primary-tile" style=${`left: ${left}px; width: ${PRIMARY_TILE_WIDTH + (BORDER_WIDTH * 2)}px`}>
          <div slot="header">
            <h3>Tile</h3>
          </div>
          <cm-tile .x=${tileX} .y=${tileY} .width=${PRIMARY_TILE_WIDTH} .height=${tileHeight} src=${$uiTilePrimary.value} .wishhandler=${this.wishHandler}></cm-tile>
        </sl-card>
      `;
    }
    return nothing;
  }
  renderWishSelector () {
    if ($wishSelector.value.showing) {
      // XXX this gets more complicated when we factor in wishes
      const left =  $uiFeedWidth.value + PRIMARY_TILE_WIDTH;
      // XXX need to scroll this into view but only when it switches from visible to non-visible and after the DOM has updated
      // NOTE: we can always just scroll all the way right!
      return html`
        <sl-card id="selector" style=${`left: ${left}px;`}>
          <div slot="header">
            <h3>${$wishSelector.value.title}</h3>
          </div>
          <div class="selector-icon-grid">
            ${$wishGranterCandidates.value.map(ti => html`
            <div>
              <sl-button data-link=${ti.link} @click=${this.handleSelectWish} size="large">
                ${
                  typeof ti.icons === 'string' && ti.icons.startsWith('builtin:')
                  ? html`<sl-icon name=${ti.icons.replace('builtin:', '')} slot="prefix" style="font-size: 24px"></sl-icon>`
                  : html`<cm-tile-icon size="32" alt=${`${ti.short_name || ti.name} icon`} base=${`tile://${ti.authority}/`} .sources=${ti.icons} slot="prefix"></cm-tile-icon>`
                }
                ${ti.short_name || ti.name}
              </sl-button>
            </div>
          `)}
          </div>
          <div slot="footer">
            <sl-button @click=${cancelWishSelection}>Cancel</sl-button>
          </div>
        </sl-card>
      `;
    }
    return nothing;
  }
  renderWishes () {
    if ($wishTiles.value?.length) {
      return html`
        <p>
          ${$wishTiles.value.map(w => w.link)}
        </p>
      `;
    }
    return nothing;
  }
  render () {
    return html`
      <div id="root" style=${`left: ${$left.value}px`} @scroll=${this.updateScroll}>
        ${this.renderFeed()}
        ${this.renderPrimaryTile()}
        ${this.renderWishes()}
        ${this.renderWishSelector()}
      </div>
    `;
  }
}

customElements.define('cm-feed-tiles-stack', CosmoFeedTilesStack);
