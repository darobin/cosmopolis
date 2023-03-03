
import { LitElement, html, css, nothing } from 'lit';
import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import { getStore } from '../lib/model.js';
import { saveContext, removeContext, selectContext } from '../db/contexts.js';
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
      #root {
        opacity: 1;
        transition: 0.5s opacity;
        padding: 1rem;
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
      ul {
        padding: 0;
      }
      li {
        list-style-type: none;
      }
      #open-contexts::part(label) {
        font-size: 2rem;
        color: #fff;
        padding-left: 0;
      }
      #controls {
        display: flex;
      }
      h2 {
        margin: 0;
        font-family: var(--cm-title-font);
        font-weight: 500;
        color: var(--sl-color-neutral-600);
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
      if (!contexts || !contexts.length) {
        this.open = true;
        this.cantEdit = true;
        this.showHint = true;
      }
      if (!current) this.open = true;
      this.contexts = contexts;
      this.current = current;
      if (current) this.title = (this.contexts || []).find(ctx => ctx.$id === current)?.name;
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
  async handleCreateContext (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let { name = '' } = serialize(ev.target);
    name = name.trim();
    if (!name) return;
    await saveContext({ name });
    this.creating = false;
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
  handleLoadContext (ev) {
    selectContext(ev.target.id);
    this.open = false;
  }
  async handleChangeContext (ev) {
    if (!ev.detail?.name) return;
    await saveContext({ $id: ev.target.id, name: ev.detail.name });
  }
  async handleDeleteContext (ev) {
    await removeContext({ $id: ev.target.id });
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
      <div id="root">
        <div class=${this.open ? 'hidden' : ''} id="controls">
          <sl-button @click=${this.handleOpen} variant="text" id="open-contexts"><sl-icon name="list-ul"></sl-icon></sl-button>
          <h2>${this.title || nothing}</h2>
        </div>
        <sl-drawer placement="start" ?open=${!!this.open} @sl-request-close=${this.handleCloseRequest}>
          ${
            (this.contexts && this.contexts.length)
            ? html`
              <ul>
                ${this.contexts.map(({ $id, name}) => html`<li>
                <cm-context-link id=${$id} name=${name} ?editable=${this.editing} @click=${this.editing ? ()=>{} : this.handleLoadContext}
                    @change-context=${this.handleChangeContext} @delete-context=${this.handleDeleteContext}></cm-context-link>
                </li>`)}
              </ul>
              `
            : nothing
          }
          ${
            this.showHint && !this.creating
            ? html`<p class="hint">You have no contexts. Use the create button below to add one.</p>`
            : nothing
          }
          <div slot="footer">
            ${(this.cantEdit || this.editing || this.creating) ? nothing : html`<sl-icon-button name="pencil-square" label="Edit Context" @click=${this.handleEdit}></sl-icon-button>`}
            ${(this.editing || this.creating) ? nothing : html`<sl-icon-button name="plus-square" label="Add Context" class="action" @click=${this.handleCreate}></sl-icon-button>`}
            ${(this.editing) ? html`<sl-button size="small" class="action" @click=${this.handleDoneEditing}>Done</sl-button>` : nothing}
            ${(this.creating)
              ? html`
                <form @submit=${this.handleCreateContext}>
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
          </div>
        </sl-drawer>
      </div>
    `;
  }
}

customElements.define('cm-contexts', CosmoContexts);
