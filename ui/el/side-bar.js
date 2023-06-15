
import { LitElement, html, css } from 'lit';
import { withStores } from "@nanostores/lit";
import { $ui } from '../stores/ui.js';
import { $router } from '../stores/router.js';

// XXX
// this shouldn't be a drawer
// this is a regular div, with no overlay, that moves the rendering of the rest when shown

export class CosmoSideBar extends withStores(LitElement, [$ui, $router]) {
  static styles = [
    css`
      #root {
        position: fixed;
        top: var(--cm-osx-title-bar-height);
        left: calc(-1 * var(--cm-side-bar-width));
        bottom: 0;
        width: var(--cm-side-bar-width);
        transition: left var(--sl-transition-medium);
        background: var(--cm-electric-blue);
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
      details {
        padding: var(--sl-spacing-2x-large);
      }
      summary {
        font-size: 1.2rem;
        font-weight: 700;
        font-variation-settings: "wght" 700; /* Chrome doesn't apply font-weight correctly. */
        border-bottom: 1px solid transparent;
        transition: border-bottom var(--sl-transition-medium);
      }
      details.selected summary {
        border-bottom: 1px solid var(--cm-lightest);
      }
      summary::marker {
        display: none;
      }
    `
  ];
  render () {
    console.warn(`router`, $router.value?.route);
    const route = $router.value?.route;
    return html`
      <div id="root" class=${$ui.get().sideBarShowing ? 'open' : 'closed'}>
        <details class=${ route === 'search' ? 'selected' : ''} ?open=${route === 'search'}>
          <summary><a href="#/search/">Search</a></summary>
          <ul>
            <li>No saved searches.</li>
          </ul>
        </details>
      </div>
    `;
  }
}

customElements.define('cm-side-bar', CosmoSideBar);
