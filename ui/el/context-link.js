
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
      sl-button[variant="text"]::part(base) {
        height: auto;
        margin-bottom: var(--sl-spacing-medium);
      }
      form,
      div {
        display: flex;
      }
      form,
      sl-input {
        flex-grow: 1;
      }
      form {
        margin-bottom: var(--sl-spacing-small);
      }
      sl-input::part(base) {
        background-color: #fff3;
      }
      sl-input::part(input) {
        color: var(--sl-color-neutral-600);
        background-color: transparent;
        font-size: 1.4rem;
        white-space: normal;
        line-height: 1;
      }
      sl-icon-button.del {
        margin-left: calc(-32px + var(--sl-spacing-small));
        color: var(--sl-color-danger-600);
      }
      sl-icon-button.del:hover::part(base) {
        color: var(--sl-color-danger-900);
      }
      sl-button.ok {
        margin-left: var(--sl-spacing-2x-small);
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
    if (!this.dirty) return;
    let { name = '' } = serialize(ev.target);
    name = name.trim();
    if (!name) return;
    this.dispatchEvent(new CustomEvent('change-context', { detail: { name }, bubbles: true, composed: true }));
  }
  handleNameChange (ev) {
    const value = ev.target.value;
    this.dirty = (value !== this.name);
  }
  willUpdate (changedProps) {
    if (changedProps.has('name')) this.dirty = false;
  }
  render () {
    if (!this.editable) return html`<sl-button variant="text" size="large">${this.name}</sl-button>`;
    return html`
      <div>
        <sl-icon-button class="del" name="x-circle" label="Delete Context" @click=${this.eventDelete}></sl-icon-button>
        <form @submit=${this.eventChange}>
          <sl-input type="text" name="name" value=${this.name} placeholder="Context name" required autocorrect="on" enterkeyhint="done" spellcheck @sl-input=${this.handleNameChange}></sl-input>
          <sl-button type="submit" class="ok" ?disabled=${!this.dirty} variant=${this.dirty ? 'success' : 'default'}>
            <sl-icon name="check-lg"></sl-icon>
          </sl-button>
        </form>
      </div>
    `;
  }
}

// STATUS:
//  - handle the events in the parent

customElements.define('cm-context-link', CosmoContextLink);
