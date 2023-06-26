
import { LitElement, html, css } from 'lit';

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
  };
  render () {
    return html`<div id="tile" style=${`top: ${this.y}px; left: ${this.x}px; width: ${this.width}px; height: ${this.height}px;`}>${this.src}</div>`;
  }
}

customElements.define('cm-tile', CosmoTile);
