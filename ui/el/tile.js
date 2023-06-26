
import { LitElement, html, css } from 'lit';
import { nanoid } from 'nanoid';
import { addBrowserView, updateBrowserView, removeBrowserView } from '../stores/browser-views.js';

// In case of problem:
//  look at https://github.com/vantezzen/react-electron-browser-view/blob/master/src/ElectronBrowserView.js
export class CosmoTile extends LitElement {
  static styles = [
    css`
      #tile {
        background: orange;
        position: fixed;
      }
    `
  ];
  static properties = {
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
    src: { type: String },
    id: { type: String },
  };
  // XXX
  //  - in the backend: need CSP, preload
  firstUpdated () {
    this.id = nanoid();
    addBrowserView(this.id, { x: this.x || 0, y: this.y || 0, width: this.width || 0, height: this.height || 0, src: this.src });
  }
  willUpdate (changedProps) {
    const chg = ['x', 'y', 'width', 'height', 'src'].find(k => changedProps.has(k));
    console.warn(`changed`, chg, this.x);
    if (chg) updateBrowserView(this.id, { x: this.x || 0, y: this.y || 0, width: this.width || 0, height: this.height || 0, src: this.src });
  }
  disconnectedCallback () {
    removeBrowserView(this.id);
  }
  render () {
    return html`<div id="tile" style=${`top: ${this.y}px; left: ${this.x}px; width: ${this.width}px; height: ${this.height}px;`}>${this.src}</div>`;
  }
}

customElements.define('cm-tile', CosmoTile);
