
import {
  createFramework
} from '@yedincoder/ngbuildframework/core';

import {
  createState
} from '@yedincoder/ngbuildframework/web';

// ========================================
// NgBuild Web Starter
// ========================================

const framework = createFramework();

framework.initialize();

const state = createState({
  count: 0
});

const root = document.getElementById('app');

function getCount() {
  return state.get().count;
}

function render() {
  root.replaceChildren();

  const title = document.createElement('h1');
  title.textContent = 'NgBuild Web Starter';

  const description = document.createElement('p');
  description.textContent =
    'One Framework. Web, API & Mobile.';

  const counter = document.createElement('p');
  counter.textContent = `Count: ${getCount()}`;

  const button = document.createElement('button');
  button.textContent = 'Increment';

  button.addEventListener('click', () => {
    state.set({
      count: getCount() + 1
    });

    render();
  });

  root.append(title, description, counter, button);
}

render();
