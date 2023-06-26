
import { LitElement, html, css } from 'lit';
import { withStores } from "@nanostores/lit";
import { $uiSideBarShowing } from '../stores/ui.js';
import { $router } from '../stores/router.js';
import { $tilesDevMode } from '../stores/tiles.js';

export class CosmoSideBar extends withStores(LitElement, [$uiSideBarShowing, $router, $tilesDevMode]) {
  static styles = [
    css`
      #root {
        position: fixed;
        top: var(--cm-osx-title-bar-height);
        left: calc(-1 * var(--cm-side-bar-width));
        bottom: 0;
        width: var(--cm-side-bar-width);
        transition: left var(--sl-transition-medium);
        background: var(--cm-dark-electric);
        /* border-top: 1px solid var(--cm-mid-grey); */
        border-right: 1px solid var(--cm-mid-grey);
        color: var(--cm-lightest);
      }
      #root.open {
        left: 0;
      }
      a {
        color: inherit;
        text-decoration: none;
      }
      cm-identity-switcher {
        margin: var(--sl-spacing-2x-large);
      }
      details {
        margin: var(--sl-spacing-2x-large) var(--sl-spacing-2x-small) var(--sl-spacing-2x-large) var(--sl-spacing-2x-large);
      }
      summary {
        display: flex;
        align-items: center;
        font-size: 1.2rem;
        font-weight: 700;
        font-variation-settings: "wght" 700; /* Chrome doesn't apply font-weight correctly. */
        border-right: var(--sl-spacing-2x-small) solid transparent;
        border-radius: var(--sl-spacing-2x-small);
        transition: border-bottom var(--sl-transition-medium);
      }
      details.selected summary {
        border-right-color: var(--cm-lightest);
      }
      summary::marker {
        content: "";
      }
      summary > sl-icon {
        margin-right: var(--sl-spacing-small);
        min-width: var(--sl-spacing-large);
        min-height: var(--sl-spacing-large);
      }
      details ul {
        margin: var(--sl-spacing-small) 0 var(--sl-spacing-small) calc(var(--sl-spacing-large) + var(--sl-spacing-small));
        padding: 0;
      }
      li.no-results {
        list-style-type: none;
      }
    `
  ];

  // XXX
  //  - style the tree usabilty
  //  - handle pathing (with special paths that start with $ and the rest picks an ID that might be nested in the tree)
  //    to generate a feed in the store
  //  - produce the dev apps feed
  //  - render dev apps feed as cards
  //  - activate those to load them, with the right route too
  //  - use that to load wishes, and return to wish management
  render () {
    const route = $router.value?.route;
    let library = html`
      <ul>
        <li class="no-results">Nothing saved to library.</li>
      </ul>
    `;
    if ($tilesDevMode?.value?.length) {
      library = html`
        <sl-tree>
          <sl-tree-item>
            <a href="#/library/$developer-mode-tiles">
              <sl-icon name="code-square"></sl-icon>
              Developer Mode Tiles
            </a>
          </sl-tree-item>
        </sl-tree>
      `;
    }
    return html`
      <div id="root" class=${$uiSideBarShowing.get() ? 'open' : 'closed'}>
        <cm-identity-switcher></cm-identity-switcher>

        <details class=${ route === 'search' ? 'selected' : ''} ?open=${route === 'search'}>
          <summary><sl-icon name="search"></sl-icon> <a href="#/search/">Search</a></summary>
          <ul>
            <li class="no-results">No saved searches.</li>
          </ul>
        </details>

        <details class=${ route === 'social' ? 'selected' : ''} ?open=${route === 'social'}>
          <summary><sl-icon name="people-fill"></sl-icon> <a href="#/social/">Social</a></summary>
          <ul>
            <li class="no-results">No lists.</li>
          </ul>
        </details>

        <details class=${ route === 'library' ? 'selected' : ''} ?open=${route === 'library'}>
          <summary><sl-icon name="collection"></sl-icon> <a href="#/library/">Library</a></summary>
          ${library}
        </details>

        <details class=${ route === 'apps' ? 'selected' : ''} ?open=${route === 'apps'}>
          <summary><sl-icon name="app-indicator"></sl-icon> <a href="#/apps/">Apps</a></summary>
        </details>
      </div>
    `;
  }
}

customElements.define('cm-side-bar', CosmoSideBar);
