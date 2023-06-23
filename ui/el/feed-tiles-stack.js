
import { LitElement, html, css, nothing } from 'lit';
import { withStores } from "@nanostores/lit";
// import { nanoid } from 'nanoid';
import { computed } from 'nanostores'
import { $router } from '../stores/router.js';
import { $uiSideBarShowing, $uiFeedWidth, $uiFeedTitle, $uiFeedIcon, $uiFeedData, $uiFeedMode } from '../stores/ui.js';
// import { addBrowserView } from '../stores/browser-views.js';

// this has to always be px
const SIDE_BAR_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cm-side-bar-width'), 10);
const $left = computed($uiSideBarShowing, ui => ui ? SIDE_BAR_WIDTH : 0);

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
//  - only do app
//  - kinda fake app for now by getting a list of installed tiles
//  - render the layout/template
//  - then try to rebuild the proper experience
//  - WISH MESSAGING MUST ONLY BE VIA THE ROOT
//  - NOTE: we must render an element under the window to get the scroll, I think
//  - need to wipe all BVs on route change. Because they're set by the main process, they persist reloads and bugs. (should wipe on reload)

export class CosmoFeedTilesStack extends withStores(LitElement, [$router, $left, $uiFeedWidth, $uiFeedTitle, $uiFeedIcon, $uiFeedMode, $uiFeedData]) {
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
      .mode-icon-grid {
        display: grid;
        grid: auto-flow / repeat(4, 80px);
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
    `
  ];
  // XXX probably not in this, just for test
  // firstUpdated () {
  //   const id = nanoid();
  //   console.warn(`just for kicks: ${id}`);
  //   addBrowserView(id, { x: 600, y: 600, width: 100, height: 400, src: 'https://berjon.com/' });
  // }
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
        </ul>
      `;
    }
    return html`
      <ul>
        ${$uiFeedData.value.map(ti => html`<li>${ti.name}</li>`)}
      </ul>
    `;
  }
  render () {
    const route = $router.value?.route;
    let feed = nothing;
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
      feed = html`
        <sl-card id="feed" style=${`width: ${$uiFeedWidth.value}px`}>
          <div slot="header">
            <h3>${icon} ${$uiFeedTitle.value}</h3>
          </div>
          ${this.renderDataForMode()}
        </sl-card>
      `;
    }
    return html`
      <div id="root" style=${`left: ${$left.value}px`}>
        ${feed}
        <p>
          ${route}
        </p>
      </div>
    `;
  }
}

customElements.define('cm-feed-tiles-stack', CosmoFeedTilesStack);
