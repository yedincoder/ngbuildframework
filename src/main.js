
import {
  element,
  component,
  render
} from './core/renderer.ts';

import {
  Router,
  mountReactive,
  createState,
  unmount
} from './web/index.ts';

// ========================================
// Page Components
// ========================================

function Navigation() {
  return element(
    'nav',
    { class: 'navigation' },

    element(
      'a',
      { href: '/', 'data-ng-link': true },
      'Beranda'
    ),

    ' | ',

    element(
      'a',
      { href: '/about', 'data-ng-link': true },
      'About'
    ),

    ' | ',

    element(
      'a',
      { href: '/contact', 'data-ng-link': true },
      'Contact'
    ),

    ' | ',

    element(
      'a',
      { href: '/unknown', 'data-ng-link': true },
      '404 Test'
    )
  );
}

function Page(props) {
  return element(
    'main',
    { class: 'container' },

    element('h1', {}, props.title),

    component(Navigation, {}),

    element('p', {}, props.content)
  );
}

function HomePage() {
  return component(Page, {
    title: 'NgBuild Web',
    content: 'Web Integration Test'
  });
}

function AboutPage() {
  return component(Page, {
    title: 'About',
    content: 'Halaman Tentang NgBuild Web'
  });
}

function ContactPage() {
  return component(Page, {
    title: 'Contact',
    content: 'Halaman Kontak'
  });
}

function NotFoundPage() {
  return component(Page, {
    title: '404 - Not Found',
    content: 'Halaman tidak ditemukan'
  });
}

// ========================================
// Router
// ========================================

const router = new Router();

router.register({
  path: '/',
  component: HomePage
});

router.register({
  path: '/about',
  component: AboutPage
});

router.register({
  path: '/contact',
  component: ContactPage
});

router.setNotFound(NotFoundPage);

// ========================================
// Browser Application
// ========================================

const app = document.getElementById('app');

if (!app) {
  throw new Error('App container not found');
}

router.render(window.location.pathname, app);

router.listen(app);

app.addEventListener('click', event => {
  const link = event.target.closest?.(
    'a[data-ng-link]'
  );

  if (!link || !app.contains(link)) {
    return;
  }

  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const path = link.getAttribute('href');

  if (!path) {
    return;
  }

  event.preventDefault();

  router.navigate(path, app);

  console.log(
    '[Navigation]',
    window.location.pathname
  );
});

// ========================================
// Test Helpers
// ========================================

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function test(name, callback) {
  try {
    callback();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (error) {
    failed++;
    console.error(`[FAIL] ${name}`, error);
  }
}

// ========================================
// Web Integration Tests
// ========================================

console.log('=== NgBuild Web Integration Test ===');

// ----------------------------------------
// Test 1: Renderer
// ----------------------------------------

test('Core Renderer', () => {
  const html = render(
    element(
      'div',
      { class: 'test' },
      element('h1', {}, 'NgBuild Web'),
      element('p', {}, 'Renderer OK')
    )
  );

  assert(
    html.includes('<h1>NgBuild Web</h1>'),
    'Renderer failed'
  );

  assert(
    html.includes('Renderer OK'),
    'Nested element failed'
  );
});

// ----------------------------------------
// Test 2: HTML Escaping
// ----------------------------------------

test('HTML Escaping', () => {
  const html = render(
    element('p', {}, '<script>alert(1)</script>')
  );

  assert(
    !html.includes('<script>'),
    'Unsafe HTML not escaped'
  );

  assert(
    html.includes('&lt;script&gt;'),
    'Escaping failed'
  );
});

// ----------------------------------------
// Test 3: Route Registration
// ----------------------------------------

test('Route Registration', () => {
  assert(router.has('/'), 'Home missing');
  assert(router.has('/about'), 'About missing');
  assert(router.has('/contact'), 'Contact missing');
});

// ----------------------------------------
// Test 4: Route Rendering
// ----------------------------------------

const routeTarget = document.createElement('div');

test('Route Rendering', () => {
  router.render('/about', routeTarget);

  assert(
    routeTarget.textContent.includes(
      'Halaman Tentang NgBuild Web'
    ),
    'About page not rendered'
  );
});

// ----------------------------------------
// Test 5: Not Found
// ----------------------------------------

test('404 Not Found', () => {
  router.render('/unknown', routeTarget);

  assert(
    routeTarget.textContent.includes(
      '404 - Not Found'
    ),
    '404 page missing'
  );
});

// ----------------------------------------
// Test 6-8: Browser Navigation
// ----------------------------------------

const originalUrl =
  window.location.pathname +
  window.location.search +
  window.location.hash;

let stopTestListening = null;

try {
  test('Browser Navigation', () => {
    router.navigate('/about', routeTarget);

    assert(
      window.location.pathname === '/about',
      'Browser URL not updated'
    );

    assert(
      routeTarget.textContent.includes('About'),
      'Navigation did not render page'
    );
  });

  test('Same Route Navigation', () => {
    const before = window.history.length;

    router.navigate('/about', routeTarget);

    assert(
      window.history.length === before,
      'Duplicate history entry'
    );
  });

  test('Popstate Navigation', () => {
    stopTestListening = router.listen(routeTarget);

    window.history.replaceState(
      null,
      '',
      '/contact'
    );

    window.dispatchEvent(
      new PopStateEvent('popstate')
    );

    assert(
      window.location.pathname === '/contact',
      'Popstate URL mismatch'
    );

    assert(
      routeTarget.textContent.includes(
        'Halaman Kontak'
      ),
      'Popstate did not render Contact'
    );
  });
} finally {
  if (stopTestListening) {
    stopTestListening();
  }

  // Pulihkan URL dan halaman aplikasi.
  window.history.replaceState(
    null,
    '',
    originalUrl
  );

  router.render(
    window.location.pathname,
    app
  );

  unmount(routeTarget);
}

// ----------------------------------------
// Reactive Component Test Setup
// ----------------------------------------

const reactiveTarget = document.createElement('div');

const name = createState('Yedin');
const role = createState('Developer');

const lifecycleEvents = [];

let renderCount = 0;
let cleanupReactive = null;

function Profile() {
  renderCount++;

  return element(
    'section',
    { class: 'profile' },

    element(
      'p',
      { class: 'profile-name' },
      name.get()
    ),

    element(
      'p',
      { class: 'profile-role' },
      role.get()
    )
  );
}

const lifecycle = {
  onMount() {
    lifecycleEvents.push('mount');
  },

  onUpdate() {
    lifecycleEvents.push('update');
  },

  onUnmount() {
    lifecycleEvents.push('unmount');
  }
};

function mountProfile() {
  if (cleanupReactive) {
    cleanupReactive();
    cleanupReactive = null;
  }

  cleanupReactive = mountReactive(
    reactiveTarget,
    Profile,
    [name, role],
    lifecycle
  );
}

function unmountProfile() {
  if (cleanupReactive) {
    cleanupReactive();
    cleanupReactive = null;
  }

  unmount(reactiveTarget);
}

// ----------------------------------------
// Test 9: Reactive Mount
// ----------------------------------------

test('Reactive Component Mount', () => {
  mountProfile();

  assert(
    renderCount === 1,
    'Initial render count incorrect'
  );

  assert(
    reactiveTarget.textContent.includes('Yedin'),
    'Initial state missing'
  );

  assert(
    lifecycleEvents[0] === 'mount',
    'onMount not called'
  );
});

// ----------------------------------------
// Test 10: Name Update
// ----------------------------------------

test('Reactive Name Update', () => {
  const before = renderCount;

  name.set('NgBuild Developer');

  assert(
    renderCount - before === 1,
    'Name update rendered more than once'
  );

  assert(
    reactiveTarget.querySelector(
      '.profile-name'
    )?.textContent === 'NgBuild Developer',
    'Name DOM not updated'
  );

  assert(
    reactiveTarget.querySelector(
      '.profile-role'
    )?.textContent === 'Developer',
    'Role changed unexpectedly'
  );
});

// ----------------------------------------
// Test 11: Role Update
// ----------------------------------------

test('Reactive Role Update', () => {
  const before = renderCount;

  role.set('Administrator');

  assert(
    renderCount - before === 1,
    'Role update rendered more than once'
  );

  assert(
    reactiveTarget.querySelector(
      '.profile-role'
    )?.textContent === 'Administrator',
    'Role DOM not updated'
  );
});

// ----------------------------------------
// Test 12: Same Value
// ----------------------------------------

test('Same State Value Ignored', () => {
  const before = renderCount;

  name.set('NgBuild Developer');
  role.set('Administrator');

  assert(
    renderCount === before,
    'Unchanged state triggered rendering'
  );
});

// ----------------------------------------
// Test 13: Lifecycle
// ----------------------------------------

test('Component Lifecycle', () => {
  assert(
    lifecycleEvents[0] === 'mount',
    'Mount event missing'
  );

  assert(
    lifecycleEvents.filter(
      event => event === 'update'
    ).length === 2,
    'Update event count incorrect'
  );
});

// ----------------------------------------
// Test 14: Unmount Cleanup
// ----------------------------------------

test('Unmount Cleanup', () => {
  unmountProfile();

  const before = renderCount;

  name.set('After Unmount');
  role.set('Inactive');

  assert(
    renderCount === before,
    'Component rendered after unmount'
  );

  assert(
    reactiveTarget.childNodes.length === 0,
    'DOM not cleared'
  );

  assert(
    lifecycleEvents.filter(
      event => event === 'unmount'
    ).length === 1,
    'Unmount lifecycle incorrect'
  );
});

// ----------------------------------------
// Test 15: Remount
// ----------------------------------------

test('Remount Restores State', () => {
  mountProfile();

  assert(
    reactiveTarget.textContent.includes(
      'After Unmount'
    ),
    'Latest name not restored'
  );

  assert(
    reactiveTarget.textContent.includes(
      'Inactive'
    ),
    'Latest role not restored'
  );

  assert(
    lifecycleEvents.filter(
      event => event === 'mount'
    ).length === 2,
    'Remount lifecycle incorrect'
  );
});

// ----------------------------------------
// Test 16: Duplicate Subscription
// ----------------------------------------

test('No Duplicate Subscriptions', () => {
  mountProfile();
  mountProfile();

  const before = renderCount;

  name.set('Final Name');

  assert(
    renderCount - before === 1,
    'Duplicate subscription detected'
  );
});

// ----------------------------------------
// Test 17: Final Cleanup
// ----------------------------------------

test('Final Cleanup', () => {
  unmountProfile();

  const before = renderCount;

  name.set('Cleanup Verified');

  assert(
    renderCount === before,
    'Subscription remained active'
  );

  assert(
    reactiveTarget.innerHTML === '',
    'DOM not cleared'
  );
});

// ========================================
// Final Integration Result
// ========================================

console.log('');
console.log('=== WEB INTEGRATION RESULT ===');
console.log('Passed:', passed);
console.log('Failed:', failed);
console.log('Total:', passed + failed);

if (failed === 0) {
  console.log(
    'NgBuild Web Foundation: ALL TESTS PASSED'
  );
} else {
  console.error(
    'NgBuild Web Foundation: TESTS FAILED'
  );
}

console.log(
  '[NgBuild Web] Current route:',
  window.location.pathname
);
