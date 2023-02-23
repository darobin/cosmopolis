
import { LitElement, html, css } from 'lit';
import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';

export class CosmoContextLink extends LitElement {
  static styles = [
    css`
      sl-button[variant="text"]::part(label) {
        color: var(--sl-color-neutral-600);
        font-size: 1.4rem;
        transition: 0.2s;
        white-space: normal;
        text-align: left;
        line-height: 1;
      }
      sl-button[variant="text"]:hover::part(label) {
        color: var(--cm-sky-dark);
      }
      form,
      div {
        display: flex;
      }
      sl-icon-button {
        color: var(--sl-color-danger-600);
      }
      sl-icon-button:hover::part(base) {
        color: var(--sl-color-danger-900);
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
  eventDelete () {
    this.dispatchEvent(new CustomEvent('delete-context', { bubbles: true, composed: true }));
  }
  eventChange (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let { name = '' } = serialize(ev.target);
    name = name.trim();
    if (!name) return;
    this.dispatchEvent(new CustomEvent('change-context', { detail: { name }, bubbles: true, composed: true }));
  }
  handleNameChange (ev) {
    const value = ev.target.value;
    console.warn(`val`, value);
    this.dirty = (value !== this.name);
  }
  render () {
    if (!this.editable) return html`<sl-button variant="text" size="large">${this.name}</sl-button>`;
    return html`
      <div>
        <sl-icon-button name="x-circle" label="Delete Context" @click=${this.eventDelete}></sl-icon-button>
        <form @submit=${this.eventChange}>
          <sl-input type="text" name="name" value=${this.name} placeholder="Context name" required autocorrect="on" enterkeyhint="done" spellcheck @change=${this.handleNameChange}></sl-input>
          <sl-icon-button type="submit" name="check-lg" label="Ok" ?disabled=${!this.dirty}></sl-icon-button>
        </form>
      </div>
    `;
  }
}

// STATUS:
//  - change of the input doesn't update dirty correctly
//  - style inputs to look like the context links
//  - the buttons don't have enough contrast
//  - handle the events in the parent

customElements.define('cm-context-link', CosmoContextLink);
