
import { LitElement, html, css } from 'lit';

export class CosmoIdentitySwitcher extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
      #root {
        display: flex;
      }
      sl-avatar {
        width: var(--sl-spacing-3x-large);
        height: var(--sl-spacing-3x-large);
        margin-right: var(--sl-spacing-small);
      }
      sl-avatar::part(base) {
        background: var(--cm-electric-blue);
      }
      #details {
        flex-grow: 1;
        margin-top: var(--sl-spacing-2x-small);
      }
      #details sl-skeleton:first-child {
        width: 70%;
        --color: #666;
      }
      #details sl-skeleton:last-child {
        width: 90%;
      }
      #details sl-skeleton:not(:first-child) {
        height: var(--sl-spacing-2x-small);
        margin-top: var(--sl-spacing-2x-small);
        --color: var(--cm-mid-grey);;
      }
      #details sl-skeleton:not(:first-child)::part(base) {
        min-height: var(--sl-spacing-2x-small);
      }
      sl-skeleton {
        opacity: 0.8;
      }
    `
  ];
  render () {
    return html`
      <div id="root">
        <div id="avatar">
          <sl-avatar label="This could be YOU!"></sl-avatar>
        </div>
        <div id="details">
          <sl-skeleton></sl-skeleton>
          <sl-skeleton></sl-skeleton>
          <sl-skeleton></sl-skeleton>
        </div>
      </div>
    `;
  }
}

customElements.define('cm-identity-switcher', CosmoIdentitySwitcher);
