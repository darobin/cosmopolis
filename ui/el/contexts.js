
import { LitElement, html, css, nothing } from 'lit';
import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
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
      sl-icon-button {
        font-size: 1.2rem;
      }
      sl-icon-button.action {
        color: var(--cm-street-dark);
      }
      div {
        opacity: 1;
        transition: 0.5s opacity;
      }
      div.hidden {
        opacity: 0;
      }
      p.hint {
        color: var(--cm-street-dark);
        font-size: 1.4rem;
        position: absolute;
        bottom: 3rem;
        left: 1rem;
        right: 2rem;
      }
    `,
    actionButton,
  ];
  static properties = {
    cantEdit: { attribute: false },
    contexts: { attribute: false },
    creating: { attribute: false },
    editing: { attribute: false },
    current: { attribute: false },
    open: { attribute: false },
    showHint: { attribute: false },
    title: { attribute: false },
  };
  constructor () {
    super();
    const store = getStore('contexts');
    this.open = false;
    this.contexts = null;
    this.current = null;
    this.cantEdit = false
    this.creating = false
    this.editing = false
    this.showHint = false

    store.subscribe(({ contexts, current }) => {
      if (!this.contexts || !this.contexts.length) {
        this.open = true;
        this.cantEdit = true;
        this.showHint = true;
      }
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
  handleCreate () {
    this.creating = true;
  }
  handleResetCreation () {
    this.creating = false;
  }
  handleCreateContext (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let { name = '' } = serialize(ev.target);
    name = name.trim();
    if (!name) return;
    console.warn(ev.target, name);
  }
  handleEdit () {
    this.editing = true;
  }
  handleDoneEditing () {
    this.editing = false;
  }
  handlePotentialEsc (ev) {
    if (ev.code === 'Escape') {
      ev.target.closest('form').reset();
      this.creating = false;
    }
  }
  async updated (changedProps) {
    if (changedProps.has('creating') && this.creating) {
      const input = this.shadowRoot.querySelector('#create-name');
      await input.updateComplete;
      input.focus();
    }
  }
  render () {
    return html`
      <div>
        <div class=${this.open ? 'hidden' : ''}>
          <sl-button @click=${this.handleOpen}><sl-icon name="list-ul"></sl-icon></sl-button>
          <h2>${this.title || nothing}</h2>
        </div>
        <sl-drawer placement="start" ?open=${!!this.open} @sl-request-close=${this.handleCloseRequest}>
          ${
            this.showHint
            ? html`<p class="hint">You have no contexts. Use the create button below to add one.</p>`
            : nothing
          }
          ${(this.cantEdit || this.editing || this.creating) ? nothing : html`<sl-icon-button slot="footer" name="pencil-square" label="Edit Context" @click=${this.handleEdit}></sl-icon-button>`}
          ${(this.editing || this.creating) ? nothing : html`<sl-icon-button slot="footer" name="plus-square" label="Add Context" class="action" @click=${this.handleCreate}></sl-icon-button>`}
          ${(this.editing) ? html`<sl-button slot="footer" size="small" class="action" @click=${this.handleDoneEditing}>Done</sl-button>` : nothing}
          ${(this.creating)
            ? html`
              <form @submit=${this.handleCreateContext} slot="footer">
                <sl-input type="text" name="name" id="create-name" placeholder="Context name" required autocorrect="on" enterkeyhint="done" spellcheck @keyup=${this.handlePotentialEsc}></sl-input>
                <br>
                <sl-button type="reset" @click=${this.handleResetCreation} size="small">
                  <sl-icon name="x-circle"></sl-icon>
                  Reset
                </sl-button>
                <sl-button type="submit" class="action" size="small">
                  <sl-icon name="check-lg"></sl-icon>
                  Ok
                </sl-button>
              </form>
              `
            : nothing
          }
        </sl-drawer>
      </div>
    `;
  }
}

customElements.define('cm-contexts', CosmoContexts);
