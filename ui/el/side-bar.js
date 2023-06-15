
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
        background: var(--cm-lightest);
        border-top: 1px solid var(--cm-mid-grey);
        border-right: 1px solid var(--cm-mid-grey);
      }
      #root.open {
        left: 0;
      }
    `
  ];
  render () {
    console.warn(`sidebar showing ${$ui.get().sideBarShowing}`);
    return html`
      <div id="root" class=${$ui.get().sideBarShowing ? 'open' : 'closed'}>
        hello
      </div>
    `;
  }
}

customElements.define('cm-side-bar', CosmoSideBar);
