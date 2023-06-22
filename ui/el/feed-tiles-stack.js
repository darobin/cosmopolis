
import { LitElement, html, css } from 'lit';
import { withStores } from "@nanostores/lit";
import { nanoid } from 'nanoid';
// import { computed } from 'nanostores'
import { $router } from '../stores/router.js';
import { $ui } from '../stores/ui.js';
import { addBrowserView } from '../stores/browser-views.js';

// this has to always be px
// const SIDE_BAR_WIDTH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cm-side-bar-width'), 10);
// const $left = computed($ui, ui => ui.sideBarShowing ? SIDE_BAR_WIDTH : 0);

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

export class CosmoFeedTilesStack extends withStores(LitElement, [$router, $ui]) {
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
      #root.side-bar-open {
        left: var(--cm-side-bar-width);
      }
    `
  ];
  firstUpdated () {
    const id = nanoid();
    console.warn(`just for kicks: ${id}`);
    addBrowserView(id, { x: 500, y: 500, width: 300, height: 300, src: 'https://berjon.com/' });
  }
  render () {
    const route = $router.value?.route;
    return html`
      <div id="root" class=${$ui.get().sideBarShowing ? 'side-bar-open' : 'side-bar-closed'}>
        <p>
          ${route}
        </p>
      </div>
    `;
  }
}

customElements.define('cm-feed-tiles-stack', CosmoFeedTilesStack);
