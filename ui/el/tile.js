
import { LitElement, html, css } from 'lit';
import { nanoid } from 'nanoid';
import { addBrowserView, updateBrowserView, removeBrowserView } from '../stores/browser-views.js';

// In case of problem:
//  look at https://github.com/vantezzen/react-electron-browser-view/blob/master/src/ElectronBrowserView.js
export class CosmoTile extends LitElement {
  static styles = [
    css`
      #tile {
        background: #fff;
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
    wishtype: { type: String },
    wishid: { type: String },
    wishhandler: { attribute: false },
    wishdata: { attribute: false },
    id: { type: String },
  };
  firstUpdated () {
    this.addBV();
  }
  willUpdate (changedProps) {
    if (changedProps.has('src') && this.id) {
      this.removeBV();
      this.addBV();
    }
    else if (['x', 'y', 'width', 'height'].find(k => changedProps.has(k))) {
      this.updateBV();
    }
  }
  disconnectedCallback () {
    removeBrowserView(this.id);
  }
  addBV () {
    this.id = nanoid();
    addBrowserView(this.id, { x: this.x || 0, y: this.y || 0, width: this.width || 0, height: this.height || 0, src: this.src }, this.wishhandler, this.wishtype, this.wishid, this.wishdata);
  }
  updateBV () {
    updateBrowserView(this.id, { x: this.x || 0, y: this.y || 0, width: this.width || 0, height: this.height || 0, src: this.src });
  }
  removeBV () {
    removeBrowserView(this.id);
  }
  render () {
    return html`<div id="tile" data-tile-id=${this.id} style=${`top: ${this.y}px; left: ${this.x}px; width: ${this.width}px; height: ${this.height}px;`}></div>`;
  }
}

customElements.define('cm-tile', CosmoTile);
