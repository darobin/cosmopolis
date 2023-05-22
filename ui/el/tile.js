
import { LitElement, html, css, nothing } from 'lit';
import { localMeta, likeTile, unlikeTile, installTile, uninstallTile } from '../db/local-tiles.js';

export class CosmoTile extends LitElement {
  static styles = [
    css`
      #tile {
        display: block;
        width: 600px;
        margin: 0 auto;
      }
      webview {
        width: 100%;
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
      sl-popup {
        --arrow-color: #fff;
      }
      .empty-icon {
        width: 16px;
        height: 16px;
      }
    `
  ];
  static properties = {
    src: { type: String },
    iconSrc: { type: String },
    meta: { attribute: false },
    minheight: { type: Number },
    maxheight: { type: Number },
    installed: { attribute: false },
    liked: { attribute: false },
    showWishPicker: { attribute: false },
    wishPickerTitle: { attribute: false },
    wishPickerOptions: { attribute: false },
    wishID: { attribute: false },
  };
  constructor () {
    super();
    this.minheight = 150;
    this.maxheight = 800;
    this.meta = {};
    this.installed = false;
    this.liked = false;
    this.resetWish();
    if (this.src) this.loadURL(this.src);
  }
  firstUpdated () {
    const wv = this.shadowRoot.querySelector('webview');
    wv.addEventListener('ipc-message', (ev) => {
      console.warn(ev.channel, ev.args);
      if (ev.channel === 'cm-test') console.warn(`CM TEST ACK`);
      else if (ev.channel === 'cm-debug') console.warn(ev.args[0].message);
      else if (ev.channel === 'cm-tile-resize') {
        let h = ev.args[0].height;
        if (h < this.minheight) h = this.minheight;
        else if (h > this.maxheight) h = this.maxheight;
        wv.style.height = `${h}px`;
      }
      else if (ev.channel === 'cm-wish-select-granter') {
        const [opts, wid] = ev.args;
        console.warn(`received`, opts, wid);
        this.showWishPicker = true;
        this.wishPickerTitle = opts.type.charAt(0).toUpperCase() + opts.type.slice(1);
        this.wishPickerOptions = opts.granters;
        this.wishID = wid;
      }
    });
  }
  willUpdate (changedProps) {
    if (changedProps.has('src')) this.loadURL(this.src);
  }
  async loadURL (src) {
    console.warn(`loadURL`, src);
    const res = await fetch(new URL('manifest.json', src));
    this.meta = await res.json();
    this.iconSrc = this.meta.icons?.[0]?.src ? new URL(this.meta.icons[0].src, this.src).href : null;
    this.refreshLocalMeta();
    console.warn(`meta`, this.meta);
  }
  refreshLocalMeta () {
    this.meta = { ...this.meta, ...localMeta(this.src) };
  }
  resetWish () {
    this.showWishPicker = false;
    this.wishID = null;
    this.wishPickerTitle = null;
    this.wishPickerOptions = null;
  }
  handleMenu (ev) {
    const menu = ev.detail?.item?.value;
    if (menu === 'about') {
      this.shadowRoot.querySelector('sl-dialog.about').show();
    }
    else if (menu === 'debug') {
      this.shadowRoot.querySelector('webview').openDevTools();
    }
  }
  handleSelectedWish (ev) {
    console.warn(ev);
    const wishGranterID = ev.detail?.item?.value;
    const wv = this.shadowRoot.querySelector('webview');
    wv.send('cm-wish-granter-selected', wishGranterID, this.wishID);
    this.resetWish();
  }
  handleWishCancel () {
    console.warn('cancelling');
    const wv = this.shadowRoot.querySelector('webview');
    wv.send('cm-wish-granter-selected', undefined, this.wishID);
    this.resetWish();
  }
  async handleLike () {
    if (!this.meta) return;
    if (this.meta.liked) await unlikeTile(this.src);
    else await likeTile(this.src);
    this.refreshLocalMeta();
  }
  async handleInstall () {
    if (!this.meta) return;
    if (this.meta.installed) await uninstallTile(this.src);
    else await installTile(this.src);
    this.refreshLocalMeta();
  }
  render () {
    console.warn(this.wishPickerOptions);
    if (!this.src) return nothing;
    // TODO:
    // I would like to set partition=${`persist:${authority}`} on the webview but it fails silently. Need to investigate.
    const icon = this.iconSrc;
    const name = this.meta.name || this.meta.short_name || 'Untitled';
    const likeLabel = this.meta.liked ? 'Unlike' : 'Like';
    const installLabel = this.meta.installed ? 'Uninstall' : 'Install';
    return html`
      <sl-card id="tile">
        <div slot="header">
          <h3>
            ${icon
              ? html`<img src=${icon} width="32" height="32" class='tile-icon'>`
              : nothing}
            ${name}
          </h3>
          <div>
            <sl-tooltip content=${`${installLabel} Tile`}>
              <sl-icon-button name=${`bookmark-star${this.meta.installed ? '-fill' : ''}`} label=${installLabel} @click=${this.handleInstall}></sl-icon-button>
            </sl-tooltip>
            <sl-dropdown hoist>
              <sl-icon-button name="three-dots-vertical" label="Actions" slot="trigger"></sl-icon-button>
              <sl-menu @sl-select=${this.handleMenu}>
                <sl-menu-item value='debug'>Debug</sl-menu-item>
                <sl-menu-item value='about'>About ${name}</sl-menu-item>
              </sl-menu>
            </sl-dropdown>
          </div>
        </div>
        <webview src=${this.src} preload="./app/preload-webview.js" autosize></webview>
        <div slot="footer">
          <sl-tooltip content=${`${likeLabel} Tile`}>
            <sl-icon-button name=${`arrow-through-heart${this.meta.liked ? '-fill' : ''}`} label=${likeLabel} @click=${this.handleLike}></sl-icon-button>
          </sl-tooltip>
        </div>
        <sl-dialog label="About" class="about">
          ${icon
            ? html`<img src=${icon} width="64" height="64"><br>`
            : nothing}
          <strong>${name}</strong>
        </sl-dialog>
        <sl-popup ?active=${this.showWishPicker} placement="right-start" anchor="tile" distance="7" strategy="fixed" arrow arrow-placement="start">
          <sl-card>
            <h3 slot="header">${this.wishPickerTitle || 'Choose'}</h3>
            <!--
              - here we should handle the case of not having any wish granter
              - need to make this cancellable
              -->
            <sl-menu @sl-select=${this.handleSelectedWish}>
              ${
                (this.wishPickerOptions || []).map(opt => html`
                  <sl-menu-item value=${opt.id}>
                    ${
                      opt.icons?.[0]
                      ? html`<img src=${opt.icons?.[0].src} width="16" height="16" slot="prefix">`
                      : html`<div class="empty-icon" slot="prefix"></div>`
                    }
                    ${opt.name}
                  </sl-menu-item>`
                )
              }
            </sl-menu>
            <div slot="footer">
              <sl-button @click=${this.handleWishCancel}>Cancel</sl-button>
            </div>
          </sl-card>
        </sl-popup>
      </sl-card>
    `;
  }
}

customElements.define('cm-tile', CosmoTile);
