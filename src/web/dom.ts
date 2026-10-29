
import {
  render
} from '../core/renderer.js';

import type {
  Child
} from '../core/renderer.js';

export function mount(
  node: Child,
  target: Element
): void {
  target.innerHTML = render(node);
}

export function update(
  node: Child,
  target: Element
): void {
  const html = render(node);

  if (target.innerHTML === html) {
    return;
  }

  target.innerHTML = html;
}

export function unmount(
  target: Element
): void {
  target.replaceChildren();
}
