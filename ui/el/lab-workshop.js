
import { LitElement, html, css } from 'lit';

export class CosmoLabWorkshop extends LitElement {
  static styles = [
    css`
      #root {
        padding: 1rem;
      }
    `
  ];
  static properties = {
    currentTileURL: { attribute: false },
  };
  constructor () {
    super();
    this.currentTileURL = null;
    this.handleWorkshopSourceChange = (ev) => {
      const { detail: { url }} = ev;
      this.currentTileURL = url;
    };
    this.handleHashChange = () => {
      const hash = location.hash.replace(/^#/, '');
      if (!hash) return;
      if (!/^tile=/.test(hash)) return;
      this.currentTileURL = hash.replace(/^tile=/, '');
    };
    this.handleHashChange();
  }
  connectedCallback () {
    super.connectedCallback();
    window.addEventListener('hashchange', this.handleHashChange);
  }
  disconnectedCallback () {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this.handleHashChange);
  }
  render () {
    if (!this.currentTileURL) return html`<div id="root"></div>`;
    return html`
      <div id="root">
        <cm-tile src=${this.currentTileURL}></cm-tile>
      </div>
    `;
  }
}

customElements.define('cm-lab-workshop', CosmoLabWorkshop);
