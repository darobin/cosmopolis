
import { LitElement, html, css } from 'lit';

const empty = (size) => html`<div style=${`display: inline-block; width: ${size}px; height:${size}px;`}></div>`;

export class CosmoTileIcon extends LitElement {
  static styles = [
    css`
    :host {
      display: flex;
    }
    `
  ];
  static properties = {
    alt: { type: String },
    base: { type: String },
    size: { type: Number },
    sources: { attribute: false },
  };
  render () {
    const size = this.size || 32;
    let sources = Array.isArray(this.sources) ? this.sources : false;
    if (!sources || !sources.length) return empty(size);
    sources = sources
      .map(icon => ({ ...icon, size: parseInt(icon.sizes) || Number.MAX_SAFE_INTEGER }))
      .sort((a, b) => {
        if (a.size < b.size) return -1;
        if (a.size > b.size) return 1;
        return 0;
      })
    ;
    // we pick the smallest that is bigger than the size we have
    // we don't (yet) support providing multiple sizes as in appmanifest
    const candidates = sources.filter(icon => icon.size >= size);
    // If there are several, take the first one (will be the smallest size that isn't the fallback, or one of the fallbacks).
    // If there were no sizes larger than the requested one and no fallbacks, just take the largest
    const icon = candidates[0] || sources[sources.length - 1];
    const iconSrc = icon.src ? new URL(icon.src, this.base).href : null;
    if (!iconSrc) return empty(size);
    return html`<img src=${iconSrc} width=${size} height=${size} alt=${this.alt}>`;
  }
}

customElements.define('cm-tile-icon', CosmoTileIcon);
