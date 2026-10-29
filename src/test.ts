
import {
  element,
  component,
  render
} from './index.js';

import {
  mount,
  unmount
} from './web/index.js';

function Header(props: { title: string }) {
  return element(
    'header',
    { class: 'header' },
    element('h1', {}, props.title)
  );
}

const page = element(
  'main',
  { class: 'container' },

  component(Header, {
    title: 'NgBuild Web'
  }),

  element(
    'p',
    {},
    'DOM Rendering berhasil'
  )
);

// Simulasi target DOM untuk pengujian Node.js
let html = '';

const target = {
  get innerHTML() {
    return html;
  },

  set innerHTML(value: string) {
    html = value;
  },

  replaceChildren() {
    html = '';
  }
} as Element;

// Test 1: Core Renderer
console.log(
  'Renderer:',
  render(page)
);

// Test 2: Mount
mount(page, target);

console.log(
  'Mounted:',
  target.innerHTML
);

// Test 3: Unmount
unmount(target);

console.log(
  'Unmounted:',
  target.innerHTML === ''
);

// Test 4: Mount kembali
mount(
  element('h1', {}, 'NgBuild Web Ready'),
  target
);

console.log(
  'Remounted:',
  target.innerHTML
);
