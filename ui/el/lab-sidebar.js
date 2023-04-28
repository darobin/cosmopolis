
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
      img.tile-icon {
        vertical-align: bottom;
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
    console.warn(`dispatching event for`, url);
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
    console.warn(`sl-select`, ev.currentTarget.value);
    const id = ev.currentTarget.value;
    console.warn(`loading`, id);
    this.loadSingleTile(`tile://${id}/`);
  }
  // XXX
  //  - this badly needs a way to refresh previously loaded tiles, and to delete some
  render () {
    const noPrevious = !this.previousDevTiles?.length;
    const current = this.currentDevTile;
    return html`
      <div id="root">
        <sl-details summary="Dev Mode Tiles" open>
          <sl-select label="Load previously-loaded tile" ?disabled=${noPrevious} value=${current || ''}
          placeholder=${noPrevious ? 'No previous tiles' : ''} @sl-change=${this.handleSelectDevModeTile}>
            ${
              (this.previousDevTiles || [])
                .map(tile => html`
                  <sl-option value=${tile.id}>
                    ${tile.manifest?.icons?.[0]?.src
                      ? html`<img src=${tile.manifest?.icons?.[0]?.src} width="24" height="24" class='tile-icon'>`
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
