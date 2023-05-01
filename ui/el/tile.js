
import { LitElement, html, css, nothing } from 'lit';

export class CosmoTile extends LitElement {
  static styles = [
    css`
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
    src: {},
    meta: { attribute: false },
  };
  constructor () {
    super();
    this.meta = {};
    if (this.src) this.loadURL(this.src);
  }
  willUpdate (changedProps) {
    if (changedProps.has('src')) this.loadURL(this.src);
  }
  async loadURL (src) {
    console.warn(`loadURL`, src);
    const res = await fetch(new URL('manifest.json', src));
    this.meta = await res.json();
    console.warn(`meta`, this.meta);
  }
  render () {
    if (!this.src) return nothing;
    // XXX
    //  - make this a cm-tile element
    //  - add a ••• drop down
    //  - about menu
    //  - footer
    //  - webview params
    //    - CSP
    //  - autoresize based on content
    //  - layout to be flush
    //  - notes on a better monitor somewhere, too
    return html`
      <sl-card>
        <div slot="header">
          <h3>
            ${this.meta.icons?.[0]?.src
              ? html`<img src=${new URL(this.meta.icons[0].src, this.src).href} width="32" height="32" class='tile-icon'>`
              : nothing}
              ${this.meta.name || this.meta.short_name || 'Untitled'}
          </h3>
        </div>
        <webview src=${this.src}></webview>
      </sl-card>
    `;
  }
}

customElements.define('cm-tile', CosmoTile);
