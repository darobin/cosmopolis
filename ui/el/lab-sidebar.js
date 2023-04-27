
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
  };
  constructor () {
    super();
    window.cosmopolis
      .getSetting('developer.tiles.loadHistory')
      .then(hist => this.previousDevTiles = hist || [])
    ;
  }
  handleOpenDevModeTile () {
    // - file picker set for directory (dialog.showOpenDialogSync)
    // - the backend needs to map that to a nanoid and keep track of that
    // - add to previous tiles, cap the size of the list
    // - select previous dev mode tile (set selected, causes sl-select to show, trigger load)
  }
  handleSelectDevModeTile () {
    // - loading tile://nanoid/ should DTRT
  }
  render () {
    const noPrevious = !this.previousDevTiles?.length;
    return html`
      <div id="root">
        <sl-details summary="Dev Mode Tiles" open>
          <sl-select label="Load previously-loaded tile" ?disabled=${noPrevious}
          placeholder=${noPrevious ? 'No previous tiles' : ''} @sl-select=${this.handleSelectDevModeTile}>
            ${
              (this.previousDevTiles || []).map(tile => html`<sl-option value=${tile.id}>${tile.path}</sl-option>`)
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
