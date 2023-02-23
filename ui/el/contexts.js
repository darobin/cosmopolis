
import { LitElement, html, css, nothing } from 'lit';
import { getStore } from '../lib/model.js';
import { actionButton } from './button-styles.js';

export class CosmoContexts extends LitElement {
  static styles = [
    css`
      sl-drawer::part(overlay) {
        background-color: transparent;
      }
      sl-drawer::part(panel) {
        background-color: var(--cm-sky-fog);
        height: calc(100% - var(--cm-street-size))
      }
      sl-drawer::part(close-button) {
        color: var(--cm-street-dark);
      }
      div {
        opacity: 1;
        transition: 0.5s opacity;
      }
      div.hidden {
        opacity: 0;
      }
    `,
    actionButton,
  ];
  static properties = {
    contexts: {
      attribute: false,
    },
    creating: {
      attribute: false,
    },
    current: {
      attribute: false,
    },
    open: {
      attribute: false,
    },
    title: {
      attribute: false,
    },
  };
  constructor () {
    super();
    const store = getStore('contexts');
    this.open = false;
    this.contexts = null;
    this.current = null;
    this.creating = false

    store.subscribe(({ contexts, current }) => {
      if (!this.contexts || !this.contexts.length) this.open = true;
      this.contexts = contexts;
      this.current = current;
      if (current) this.title = current.name;
    });
  }
  handleOpen () {
    this.open = true;
  }
  handleCloseRequest (ev) {
    if (!this.contexts || !this.contexts.length) return ev.preventDefault();
    this.open = false;
  }
  render () {
    return html`
      <div>
        <div class=${this.open ? 'hidden' : ''}>
          <sl-button @click=${this.handleOpen}><sl-icon name="list-ul"></sl-icon></sl-button>
          <h2>${this.title || nothing}</h2>
        </div>
        <sl-drawer placement="start" ?open=${!!this.open} @sl-request-close=${this.handleCloseRequest}>
          <sl-button slot="footer" class="action">
            <sl-icon slot="prefix" name="plus-square"></sl-icon>
            Add Context
          </sl-button>
        </sl-drawer>
      </div>
    `;
  }
}

customElements.define('cm-contexts', CosmoContexts);
