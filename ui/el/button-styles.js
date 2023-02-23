
import { css } from 'lit';

export const actionButton = css`
  sl-button.action::part(base) {
    background-color: var(--cm-street-dark);
    color: white;
  }
  sl-button.action::part(base):hover {
    background-color: var(--cm-street-light);
  }
  sl-button.action::part(base):active {
    background-color: var(--cm-street-light);
  }
  sl-button.action::part(base):focus-visible {
    outline: dashed 1px var(--cm-sky-dark);
    outline-offset: 1px;
  }
`;
