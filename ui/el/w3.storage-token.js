
import { LitElement, html, css } from 'lit';
import { serialize } from '@shoelace-style/shoelace/dist/utilities/form.js';
import { getStore } from '../lib/model.js';
import { saveToken } from '../db/w3.storage-token.js';
import { checkToken } from '../lib/w3.storage.js';
import { actionButton } from './button-styles.js';

export class CosmoW3StorageToken extends LitElement {
  static styles = [
    css`
      sl-dialog::part(close-button) {
        display: none;
      }
      sl-input::part(form-control-help-text) {
        color: var(--cm-sky-dark);
        text-align: left;
        margin: 0.5rem 1rem;
      }
      p {
        margin-top: 0;
      }
      a {
        color: var(--cm-street-medium);
        text-decoration-color: var(--cm-street-light);
        text-decoration-thickness: 1px;
        transition: all .2s;
      }
      a:hover {
        text-decoration-color: var(--cm-sky-dark);
        text-decoration-thickness: 3px;
      }
      form {
        text-align: right;
      }
    `,
    actionButton,
  ];
  static properties = {
    open: { attribute: false },
    loading: { attribute: false },
    help: { attribute: false },
  };
  constructor () {
    super();
    const store = getStore('w3.storage-token');
    this.open = false;
    this.loading = false;
    this.help = '';
    store.subscribe(({ token }) => {
      this.open = !token;
    });
  }
  handleCloseRequest (ev) {
    return ev.preventDefault();
  }
  async handleSetToken (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.loading = true;
    const nope = (help) => {
      this.loading = false;
      this.help = help;
    };
    let { token = '' } = serialize(ev.target);
    token = token.trim();
    if (!token) return nope('No token specified!');
    if (!await checkToken(token)) return nope('Token does not seem to work.');
    await saveToken(token);
  }
  render () {
    return html`
      <div id="root">
        <sl-dialog label="Set up W3.Storage" ?open=${!!this.open} @sl-request-close=${this.handleCloseRequest}>
          <p>
            Cosmopolis requires a W3.Storage token to work.
            Please refer to the <a href="https://web3.storage/docs/how-tos/generate-api-token/">instructions</a> on
            how to <a href="https://web3.storage/tokens/">create a token</a>.
          </p>
          <form @submit=${this.handleSetToken}>
            <sl-input type="text" name="token" id="create-token" placeholder="Token" required autocorrect="off" enterkeyhint="done" help-text=${this.help}></sl-input>
            <br>
            <sl-button type="submit" class="action" ?loading=${this.loading}>
              <sl-icon name="check-lg"></sl-icon>
              Ok
            </sl-button>
          </form>
        </sl-dialog>
      </div>
    `;
  }
}

customElements.define('cm-w3.storage-token', CosmoW3StorageToken);
