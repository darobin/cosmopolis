
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
        min-height: 200px;
        max-height: 800px;
      }
      h3 {
        margin: 0;
      }
      h3 img {
        vertical-align: middle;
      }
      [slot='header'], [slot='footer'] {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      [slot='footer'] sl-icon-button {
        font-size: 1.4rem;
      }
      sl-card::part(body) {
        padding: 0;
      }
      sl-card::part(footer) {
        padding-top: var(--sl-spacing-small);
        padding-bottom: var(--sl-spacing-small);
      }
      sl-dialog.about::part(body) {
        text-align: center;
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
  handleMenu (ev) {
    const menu = ev.detail?.item?.value;
    if (menu === 'about') {
      this.shadowRoot.querySelector('sl-dialog.about').show();
    }
  }
  handleLike () {
    alert('Not supported yet!');
  }
  render () {
    if (!this.src) return nothing;
    // TODO:
    // I would like to set partition=${`persist:${authority}`} on the webview but it fails silently. Need to investigate.
    // XXX
    //  - autoresize based on content
    //  - layout to be flush
    const icon = this.meta.icons?.[0]?.src ? new URL(this.meta.icons[0].src, this.src).href : null;
    const name = this.meta.name || this.meta.short_name || 'Untitled';
    const authority = new URL(this.src).hostname;
    console.warn(authority);
    return html`
      <sl-card>
        <div slot="header">
          <h3>
            ${icon
              ? html`<img src=${icon} width="32" height="32" class='tile-icon'>`
              : nothing}
            ${name}
          </h3>
          <sl-dropdown hoist>
            <sl-icon-button name="three-dots-vertical" label="Actions" slot="trigger"></sl-icon-button>
            <sl-menu @sl-select=${this.handleMenu}>
              <sl-menu-item value='about'>
                ${icon ? html`<img src=${icon} width="32" height="32" class='tile-icon' slot="prefix">` : nothing}
                About ${name}
              </sl-menu-item>
            </sl-menu>
          </sl-dropdown>
        </div>
        <webview src=${this.src} preload="./app/preload-webview.js" autosize></webview>
        <div slot="footer">
          <sl-icon-button name="arrow-through-heart" label="Like" @click=${this.handleLike}></sl-icon-button>
        </div>
        <sl-dialog label="About" class="about">
          ${icon
            ? html`<img src=${icon} width="64" height="64"><br>`
            : nothing}
          <strong>${name}</strong>
        </sl-dialog>
      </sl-card>
    `;
  }
}

customElements.define('cm-tile', CosmoTile);
