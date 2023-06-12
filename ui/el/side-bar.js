
import { LitElement, html, css } from 'lit';
import { withStores } from "@nanostores/lit";
import { $ui } from '../stores/ui.js';

export class CosmoSideBar extends withStores(LitElement, [$ui]) {
  static styles = [
    css`
    `
  ];
  render () {
    console.warn(`sidebar showing ${$ui.get().sideBarShowing}`);
    return html`
      <sl-drawer ?open=${$ui.get().sideBarShowing}>
        hello
      </sl-drawer>
    `;
  }
}

customElements.define('cm-side-bar', CosmoSideBar);
