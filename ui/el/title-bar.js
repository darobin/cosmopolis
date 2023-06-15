
import { LitElement, html, css } from 'lit';
import { withStores } from "@nanostores/lit";
import { $ui, toggleSideBar } from '../stores/ui.js';

export class CosmoTitleBar extends withStores(LitElement, [$ui]) {
  static styles = [
    css`
      #root {
        -webkit-app-region: drag;
        color: var(--cm-street-dark);
        background: var(--cm-lightest);
        display: flex;
        align-items: center;
        /* NOTE: this is OSX-specific */
        padding-left: var(--cm-traffic-light-padding);
        height: var(--cm-osx-title-bar-height);
        transition: padding-left var(--sl-transition-medium);
        border-bottom: 1px solid var(--cm-mid-grey);
      }
      #root.open {
        /* NOTE: this is OSX-specific and assumes 400px wide */
        padding-left: calc(var(--cm-side-bar-width) - var(--cm-osx-title-bar-height));
      }
      #icon-bar {
        display: flex;
        align-items: center;
        min-width: var(--cm-osx-title-bar-height);
        min-height: var(--cm-osx-title-bar-height);
      }
      #title {
        width: -webkit-fill-available;
        border-left: 1px solid var(--cm-mid-grey);
      }
      h1 {
        padding: 0 0 0 var(--sl-spacing-x-small);
        margin: 0;
        font-family: var(--cm-title-font);
        font-size: var(--cm-large-text);
        font-weight: 100;
        font-variation-settings: "wght" 100; /* Chrome doesn't apply font-weight correctly. */
      }
      sl-icon-button {
        font-size: var(--cm-large-text);
        color: var(--cm-electric-blue);
      }
    `
  ];
  render () {
    const open = $ui.get().sideBarShowing;
    const label = open ? 'Hide side bar' : 'Show side bar';
    return html`
      <div id="root" class=${open ? 'open' : 'closed'}>
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
