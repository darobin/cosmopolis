
import { LitElement, html, css } from 'lit';
import { withStores } from "@nanostores/lit";
import { $ui, toggleSideBar } from '../stores/ui.js';

export class CosmoTitleBar extends withStores(LitElement, [$ui]) {
  static styles = [
    css`
      #root {
        -webkit-app-region: drag;
        color: var(--cm-street-dark);
        background: #fff;
        display: flex;
        align-items: center;
        /* NOTE: this is OSX-specific */
        padding-left: 80px;
        height: 40px;
      }
      #title {
        width: -webkit-fill-available;
        border-left: 1px solid #ccc;
      }
      h1 {
        padding: 0 0 0 var(--sl-spacing-x-small);
        margin: 0;
        font-family: var(--cm-title-font);
        font-size: 1.4rem;
        font-weight: 100;
        font-variation-settings: "wght" 100; /* Chrome doesn't apply font-weight correctly. */
      }
      sl-icon-button {
        font-size: 1.4rem;
        color: var(--cm-electric-blue);
      }
    `
  ];
  constructor () {
    super();
    console.warn('CTOR');
  }
  render () {
    console.warn(`RENDER ${$ui.sideBarShowing}`);
    const label = $ui.sideBarShowing ? 'Hide side bar' : 'Show side bar';
    return html`
      <div id="root">
        <div id="icon-bar">
          <sl-icon-button name="layout-sidebar" label=${label} @click=${toggleSideBar}></sl-icon-button>
        </div>
        <div id="title">
          <h1>cosmopolis</h1>
        </div>
      </div>
    `;
  }
}

customElements.define('cm-title-bar', CosmoTitleBar);
