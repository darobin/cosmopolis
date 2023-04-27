
import { LitElement, html, css } from 'lit';

export class CosmoLabSidebar extends LitElement {
  static styles = [
    css`
      #root {
        padding: 1rem;
      }
      ::part(base) {
        border-radius: initial;
      }
    `
  ];
  static properties = {
    previousDevTiles: { attribute: false },
  };
  constructor () {
    super();
  }
  render () {
    return html`
      <div id="root">
        <sl-details summary="Dev Mode Tiles" open>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </sl-details>
      </div>
    `;
  }
}

customElements.define('cm-lab-sidebar', CosmoLabSidebar);

// XXX
//  - expose prefs backend/frontend
//  - get list of previous tiles
//  - populate menu from it, shows "none" otherwise
//  - button to pick one
//    - file picker set for directory
//    - the backend needs to map that to a nanoid and keep track of that
//    - loading tile://nanoid/ should DTRT
