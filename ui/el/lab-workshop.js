
import { LitElement, html, css, nothing } from 'lit';

export class CosmoLabWorkshop extends LitElement {
  static styles = [
    css`
      #root {
        padding: 1rem;
      }
      sl-card {
        display: block;
        width: 600px;
        margin: 0 auto;
      }
      webview {
        width: 100%;
        min-height: 450px;
      }
      h3 img {
        vertical-align: middle;
      }
    `
  ];
  static properties = {
    currentTileURL: { attribute: false },
    currentTileMeta: { attribute: false },
  };
  constructor () {
    super();
    this.currentTileURL = null;
    this.currentTileMeta = null;
    this.handleWorkshopSourceChange = (ev) => {
      const { detail: { url }} = ev;
      this.loadURL(url);
    };
  }
  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('cm-lab-workshop-source', this.handleWorkshopSourceChange);
  }
  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('cm-lab-workshop-source', this.handleWorkshopSourceChange);
  }
  async loadURL (url) {
    console.warn(`loadURL`, url);
    const res = await fetch(new URL('manifest.json', url));
    const meta = await res.json();
    console.warn(`meta`, meta);
    this.currentTileMeta = meta;
    this.currentTileURL = url;
  }
  render () {
    if (!this.currentTileURL) return html`<div id="root"></div>`;
    return html`
      <div id="root">
        <sl-card>
          <div slot="header">
            <h3>
              ${this.currentTileMeta.icons?.[0]?.src
                ? html`<img src=${new URL(this.currentTileMeta.icons[0].src, this.currentTileURL).href} width="32" height="32" class='tile-icon'>`
                : nothing}
                ${this.currentTileMeta.name || this.currentTileMeta.short_name || 'Untitled'}
            </h3>
          </div>
          <webview src=${this.currentTileURL}></webview>
        </sl-card>
      </div>
    `;
  }
}

customElements.define('cm-lab-workshop', CosmoLabWorkshop);
