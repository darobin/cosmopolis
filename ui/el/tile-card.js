
import { LitElement, html, css, nothing } from 'lit';

export class CosmoTileCard extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        border-bottom: 1px solid var(--sl-color-neutral-200);
      }
      a {
        display: flex;
        padding: var(--sl-spacing-medium);
        transition: background var(--sl-transition-medium);
        color: inherit;
        text-decoration: inherit;
        align-items: center;
      }
      a:hover {
        background-color: #eee;
      }
      #icon {
        /* display: block; */
        margin-right: var(--sl-spacing-x-small);
      }
      #name {
        font-weight: 700;
        font-variation-settings: "wght" 700;
      }
    `
  ];
  static properties = {
    tile: { attribute: false },
  };
  render () {
    const tile = this.tile;
    if (!tile) return nothing;
    return html`
      <a href=${tile.link}>
        <span id="icon"><cm-tile-icon size="48" alt=${`${tile.short_name || tile.name} icon`} base=${`tile://${tile.authority}/`} .sources=${tile.icons}></cm-tile-icon></span>
        <span id="texts">
          <span id="name">${tile.name || tile.short_name}</span>
          ${tile.description ? html`<span id="description">${tile.description}</span>` : nothing}
        </span>
      </a>
    `;
  }
}

customElements.define('cm-tile-card', CosmoTileCard);
