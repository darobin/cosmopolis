
import { LitElement, html, css, nothing } from 'lit';
import { getStore } from '../lib/model.js';
import { refreshLocalTiles, refreshTile, removeTile } from '../db/local-tiles.js';

export class CosmoLabSidebar extends LitElement {
  static styles = [
    css`
      #root {
        padding: 1rem;
      }
      ::part(base) {
        border-radius: initial;
      }
      ::part(summary) {
        font-variation-settings: "wght" 700;
      }
      .actions {
        margin-top: var(--sl-spacing-medium);
        text-align: right;
      }
      table.local-tiles {
        width: 100%;
      }
      td.icon {
        width: 32px;
        text-align: center;
      }
      tr.selected sl-button::part(label) {
        font-variation-settings: "wght" 700;
        padding-left: var(--sl-spacing-2x-small);
      }
      table.local-tiles sl-button::part(base) {
        border: none;
      }
    `
  ];
  static properties = {
    localTiles: { attribute: false },
    currentDevTile: { attribute: false },
  };
  constructor () {
    super();
    const store = getStore('local-tiles');
    this.localTiles = [];
    store.subscribe(({ tiles }) => {
      this.localTiles = tiles;
    });
    const hash = location.hash.replace(/^#/, '');
    if (!hash) return;
    if (!/^tile=/.test(hash)) return;
    this.currentDevTile = hash.replace(/^tile=tile:\/\//, '').replace(/\/$/, '');
  }
  // the workshop listens for these
  loadSingleTile (id) {
    this.currentDevTile = id;
    window.location.hash = `#tile=tile://${id}/`;
  }
  async handleOpenDevModeTile () {
    const tile = await window.cosmopolis.pickDevTile();
    if (!tile) return;
    if (tile.error) {
      // XXX yeah, we can do better
      alert(tile.message);
      console.error(tile.message);
      return;
    }
    this.loadSingleTile(tile.id);
    await refreshLocalTiles();
  }
  handleSelectDevModeTile (ev) {
    const id = ev.currentTarget.getAttribute('data-tile-id');
    this.loadSingleTile(id);
  }
  async handleRefresh (ev) {
    const id = ev.currentTarget.getAttribute('data-tile-id');
    await refreshTile(`tile://${id}/`);
  }
  async handleRemove (ev) {
    const id = ev.currentTarget.getAttribute('data-tile-id');
    await removeTile(`tile://${id}/`);
  }
  render () {
    const current = this.currentDevTile;
    return html`
      <div id="root">
        <sl-details summary="Dev Mode Tiles" open>
          <table class='local-tiles'>
            ${
              Object.values(this.localTiles)
              .sort((a, b) => tileName(a).localeCompare(tileName(b)))
              .map(tile => html`<tr class=${current === tile.id ? 'selected' : ''}>
                <td>
                  <sl-button @click=${this.handleSelectDevModeTile} data-tile-id=${tile.id}>
                    ${tile.manifest?.icons?.[0]?.src
                          ? html`<img src=${new URL(tile.manifest.icons[0].src, tile.url).href} width="24" height="24" slot="prefix">`
                          : nothing}
                    ${tileName(tile)}
                  </sl-button>
                </td>
                <td class="icon">
                  ${tile.liked
                        ? html`<sl-icon name="heart-fill" label="Liked"></sl-icon>`
                        : nothing}
                </td>
                <td class="icon">
                  ${tile.installed
                        ? html`<sl-icon name="bookmark-star-fill" label="Installed"></sl-icon>`
                        : nothing}
                </td>
                <td class="icon">
                  <sl-tooltip content="Refresh">
                    <sl-icon-button name="arrow-clockwise" label="Refresh" @click=${this.handleRefresh} data-tile-id=${tile.id}></sl-icon-button>
                  </sl-tooltip>
                </td>
                <td class="icon">
                  <sl-tooltip content="Remove">
                    <sl-icon-button name="x-circle-fill" label="Remove" @click=${this.handleRemove} data-tile-id=${tile.id}></sl-icon-button>
                  </sl-tooltip>
                </td>
              </tr>`)
            }
          </table>
          <div class="actions">
            <sl-button variant="primary" @click=${this.handleOpenDevModeTile}>
              <sl-icon slot="prefix" name="folder2-open"></sl-icon>
              Load Dev Mode Tile
            </sl-button>
          </div>
        </sl-details>
      </div>
    `;
  }
}

function tileName (tile = {}) {
  return tile.manifest?.name || tile.manifest?.short_name || tile.dir;
}

customElements.define('cm-lab-sidebar', CosmoLabSidebar);
