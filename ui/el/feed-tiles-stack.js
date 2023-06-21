
import { LitElement, html, css } from 'lit';
import { withStores } from "@nanostores/lit";
import { $router } from '../stores/router.js';

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
//  - render at the right position based on sidebar (this will be needed for layout anyway)
//  - only do app
//  - kinda fake app for now by getting a list of installed tiles
//  - render the layout/template
//  - then try to rebuild the proper experience
//  - WISH MESSAGING MUST ONLY BE VIA THE ROOT

export class CosmoFeedTilesStack extends withStores(LitElement, [$router]) {
  static styles = [
    css`
      :host {
        display: block;
      }
      p {
        font-weight: bold;
      }
    `
  ];
  render () {
    const route = $router.value?.route;
    return html`
      <div id="root">
        <p>
          ${route}
        </p>
      </div>
    `;
  }
}

customElements.define('cm-feed-tiles-stack', CosmoFeedTilesStack);
