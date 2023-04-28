
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
    // XXX
    //  - fetch the URL's metadata
    //  - make it available locally
    this.currentTileURL = url;
  }
  render () {
    console.warn(`rendering`, this.currentTileURL);
    // XXX
    //  - create a pane
    //  - center it
    //  - use the metadata to populate it
    //  - use a <webview> to render it
    return html`
      <div id="root">
        URL: ${this.currentTileURL}
      </div>
    `;
  }
}

customElements.define('cm-lab-workshop', CosmoLabWorkshop);
