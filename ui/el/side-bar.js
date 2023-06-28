
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
        background: var(--cm-neutral-grey);
        border-right: 1px solid var(--cm-mid-grey);
      }
      #root.open {
        left: 0;
      }
      a {
        /* color: var(--cm-electric-blue); */
        flex-grow: 1;
        color: inherit;
        text-decoration: none;
      }
      sl-card {
        display: block;
        margin: var(--sl-spacing-medium);
      }
      sl-card::part(header) {
        border-bottom: none;
      }
      sl-card::part(body) {
        border-bottom: none;
        padding: calc(var(--padding)  / 2) var(--padding);
      }
      sl-card.no-body::part(body) {
        padding: 0;
      }
      h2 {
        display: flex;
        align-items: center;
        font-size: 1rem;
        font-weight: 700;
        font-variation-settings: "wght" 700; /* Chrome doesn't apply font-weight correctly. */
        margin: 0;
      }
      h2 > sl-icon {
        margin-right: var(--sl-spacing-small);
        min-width: var(--sl-spacing-large);
        min-height: var(--sl-spacing-large);
      }
      sl-card ul {
        margin: 0;
        padding: 0;
      }
      li.no-results {
        list-style-type: none;
        color: var(--sl-color-neutral-500);
      }
      sl-tree {
        --indent-guide-width: 1px;
      }
      sl-tree-item::part(item--selected) {
        background-color: transparent;
        border-color: transparent;
      }
      sl-tree-item::part(expand-button) {
        rotate: none;
      }
      sl-tree-item::part(expand-button) {
        padding-left: 0;
      }
      sl-tree-item.leaf::part(expand-button) {
        display: none;
      }
      sl-tree-item::part(children)::before {
        /* this is SL's left position minus var(--sl-spacing-x-small) which we have removed from the expand-button */
        left: calc(1em - (var(--indent-guide-width) / 2) - 1px - var(--sl-spacing-x-small));
      }
    `
  ];

  // if we do this in render() it will override user choice; all this does is open the current route because that
  // has useful context
  updated () {
    const details = $router.value?.route && this.shadowRoot.getElementById($router.value.route);
    if (!details) return;
    details.open = true;
  }
  render () {
    let library = html`
      <ul>
        <li class="no-results">Nothing saved to library.</li>
      </ul>
    `;
    if ($tilesDevMode?.value?.length) {
      // <sl-tree-item>
      //   <sl-icon name="card-list"></sl-icon> <a href="#">Sit Amet</a>
      // </sl-tree-item>
      // SL doesn't have a way to style leaves distinctly, so we must manage that ourselves with .leaf
      library = html`
        <sl-tree>
          <sl-icon name="folder2" slot="expand-icon"></sl-icon>
          <sl-icon name="folder2-open" slot="collapse-icon"></sl-icon>
          <sl-tree-item class="leaf">
            <sl-icon name="code-square"></sl-icon>
            <a href="#/library/$developer-mode-tiles">
              Developer Mode Tiles
            </a>
          </sl-tree-item>
        </sl-tree>
      `;
    }
    return html`
      <div id="root" class=${$uiSideBarShowing.get() ? 'open' : 'closed'}>
        <sl-card>
          <cm-identity-switcher></cm-identity-switcher>
        </sl-card>

        <sl-card id="search">
          <h2 slot="header"><sl-icon name="search"></sl-icon> <a href="#/search/">Search</a></h2>
          <ul>
            <li class="no-results">No saved searches.</li>
          </ul>
        </sl-card>

        <sl-card id="social">
          <h2 slot="header"><sl-icon name="people-fill"></sl-icon> <a href="#/social/">Social</a></h2>
          <ul>
            <li class="no-results">No lists.</li>
          </ul>
        </sl-card>

        <sl-card id="library">
          <h2 slot="header"><sl-icon name="collection"></sl-icon> <a href="#/library/">Library</a></h2>
          ${library}
        </sl-card>

        <sl-card id="apps" class="no-body">
          <h2 slot="header"><sl-icon name="app-indicator"></sl-icon> <a href="#/apps/">Apps</a></h2>
        </sl-card>
      </div>
    `;
  }
}

customElements.define('cm-side-bar', CosmoSideBar);
