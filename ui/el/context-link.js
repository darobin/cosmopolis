
import { LitElement, html, css, nothing } from 'lit';

export class CosmoContextLink extends LitElement {
  static styles = [
    css`
      sl-button[variant="text"]::part(label) {
        color: var(--sl-color-neutral-600);
        font-size: 1.4rem;
        transition: 0.2s;
      }
      sl-button[variant="text"]:hover::part(label) {
        color: var(--cm-sky-dark);
      }
    `,
  ];
  static properties = {
    id: {},
    name: { type: String },
    editable: { type: Boolean },
    dirty: { attribute: false },
  };
  constructor () {
    super();
    this.dirty = false;
  }
  render () {
    if (!this.editable) return html`<sl-button variant="text" size="large">${this.name}</sl-button>`;
    return html`
      <div>
        delete button
        context editor, keep track of dirty status
        ok button, disabled if not dirty
      </div>
    `;
  }
}

customElements.define('cm-context-link', CosmoContextLink);
