
import { LitElement, html, css } from 'lit';
import { withStores } from "@nanostores/lit";
import { $ui } from '../stores/ui.js';

// XXX
// this shouldn't be a drawer
// this is a regular div, with no overlay, that moves the rendering of the rest when shown

export class CosmoSideBar extends withStores(LitElement, [$ui]) {
  static styles = [
    css`
      sl-drawer::part(base), sl-drawer::part(overlay) {
        top: var(--cm-osx-titlebar-height);
      }
    `
  ];
  render () {
    console.warn(`sidebar showing ${$ui.get().sideBarShowing}`);
    return html`
      <sl-drawer ?open=${$ui.get().sideBarShowing} placement="start" no-header>
        hello
      </sl-drawer>
    `;
  }
}

customElements.define('cm-side-bar', CosmoSideBar);
