
import { LitElement, html, css, nothing } from 'lit';

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
    `
  ];
  static properties = {
    previousDevTiles: { attribute: false },
    currentDevTile: { attribute: false },
  };
  constructor () {
    super();
    this.refreshHistory();
  }
  async refreshHistory () {
    window.cosmopolis
      .getSetting('developer.tiles.loadHistory')
      .then(hist => this.previousDevTiles = hist || [])
    ;
  }
  // the workshop listens for these
  loadSingleTile (url) {
    const ev = new CustomEvent('cm-lab-workshop-source', { detail: { url }});
    window.dispatchEvent(ev);
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
    this.currentDevTile = tile.id;
    this.loadSingleTile(tile.url);
  }
  handleSelectDevModeTile (ev) {
    const id = ev.detail.item.value;
    this.loadSingleTile(`tile://${id}/`);
  }
  render () {
    const noPrevious = !this.previousDevTiles?.length;
    const current = this.currentDevTile;
    return html`
      <div id="root">
        <sl-details summary="Dev Mode Tiles" open>
          <sl-select label="Load previously-loaded tile" ?disabled=${noPrevious} value=${current || ''}
          placeholder=${noPrevious ? 'No previous tiles' : ''} @sl-select=${this.handleSelectDevModeTile}>
            ${
              (this.previousDevTiles || [])
                .map(tile => html`
                  <sl-option value=${tile.id}>
                    ${tile.manifest?.icons?.[0]?.src
                      ? html`<img src=${tile.manifest?.icons?.[0]?.src} width="16" height="16">`
                      : nothing}
                    ${tile.manifest?.name || tile.manifest?.short_name || tile.dir}
                  </sl-option>
                `)
            }
          </sl-select>
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

customElements.define('cm-lab-sidebar', CosmoLabSidebar);
