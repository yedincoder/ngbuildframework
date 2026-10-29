
// ========================================
// NgBuild Mobile UI Integration
// ========================================

export function createMobileUI(options = {}) {
  const { screenManager, root } = options;

  if (
    !screenManager ||
    typeof screenManager.getCurrent !== 'function' ||
    typeof screenManager.subscribe !== 'function' ||
    typeof screenManager.refresh !== 'function'
  ) {
    throw new TypeError('Invalid mobile screen manager');
  }

  if (
    !root ||
    typeof root.replaceChildren !== 'function'
  ) {
    throw new TypeError('Invalid mobile UI root element');
  }

  let mounted = false;
  let unsubscribeScreen = null;
  let currentScreen = null;

  // ========================================
  // Render Screen Content
  // ========================================

  function renderContent(content) {
    // Clear existing screen.
    root.replaceChildren();

    if (content === null || content === undefined) {
      return;
    }

    // Support DOM elements and DocumentFragment.
    if (
      typeof content === 'object' &&
      typeof content.nodeType === 'number'
    ) {
      root.replaceChildren(content);
      return;
    }

    // Render plain text safely, without HTML parsing.
    if (
      typeof content === 'string' ||
      typeof content === 'number' ||
      typeof content === 'boolean'
    ) {
      root.textContent = String(content);
      return;
    }

    throw new TypeError(
      'Mobile screen content must be text or a DOM Node'
    );
  }

  // ========================================
  // Render Active Screen
  // ========================================

  function render(screen = screenManager.getCurrent()) {
    if (!mounted) {
      throw new Error('Mobile UI is not mounted');
    }

    renderContent(screen.content);

    currentScreen = screen;

    return currentScreen;
  }

  // ========================================
  // Mount UI
  // ========================================

  function mount() {
    if (mounted) {
      return getCurrent();
    }

    mounted = true;

    unsubscribeScreen = screenManager.subscribe(event => {
      render(event.screen);
    });

    try {
      return render();
    } catch (error) {
      unsubscribeScreen();
      unsubscribeScreen = null;
      mounted = false;
      currentScreen = null;

      throw error;
    }
  }

  // ========================================
  // Update UI
  // ========================================

  function update() {
    if (!mounted) {
      throw new Error('Mobile UI is not mounted');
    }

    // Screen Manager emits a refresh event.
    // The subscribed handler renders the new content.
    screenManager.refresh();

    return currentScreen;
  }

  // ========================================
  // Unmount UI
  // ========================================

  function unmount() {
    if (!mounted) {
      return;
    }

    unsubscribeScreen?.();
    unsubscribeScreen = null;

    mounted = false;
    currentScreen = null;

    root.replaceChildren();
  }

  // ========================================
  // UI Information
  // ========================================

  function getCurrent() {
    return currentScreen;
  }

  function isMounted() {
    return mounted;
  }

  // ========================================
  // Public Mobile UI API
  // ========================================

  return {
    screenManager,
    root,

    mount,
    render,
    update,
    unmount,

    getCurrent,
    isMounted
  };
}
