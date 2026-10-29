
import {
  createMobileRuntime,
  createMobileNavigation,
  createMobileScreenManager,
  createMobileUI
} from '@yedincoder/ngbuildframework/mobile';

// ========================================
// NgBuild Mobile Starter
// ========================================

const runtime = createMobileRuntime();

const navigation = createMobileNavigation({
  initialRoute: '/home'
});

const screens = createMobileScreenManager({
  navigation
});

const root = document.getElementById('app');

// ========================================
// Screen Renderer
// ========================================

function createScreen(titleText, message) {
  const container = document.createElement('section');

  const title = document.createElement('h1');
  title.textContent = titleText;

  const description = document.createElement('p');
  description.textContent = message;

  const homeButton = document.createElement('button');
  homeButton.textContent = 'Home';

  homeButton.addEventListener('click', () => {
    navigation.reset('/home');
  });

  const profileButton = document.createElement('button');
  profileButton.textContent = 'Profile';

  profileButton.addEventListener('click', () => {
    navigation.push('/profile');
  });

  const backButton = document.createElement('button');
  backButton.textContent = 'Back';

  backButton.addEventListener('click', () => {
    navigation.back();
  });

  container.append(
    title,
    description,
    homeButton,
    profileButton,
    backButton
  );

  return container;
}

// ========================================
// Register Screens
// ========================================

screens.register('/home', () => {
  return createScreen(
    'NgBuild Mobile',
    `Platform: ${runtime.platform}`
  );
});

screens.register('/profile', () => {
  return createScreen(
    'Profile',
    'Welcome to NgBuild Mobile Starter'
  );
});

// ========================================
// Mount UI
// ========================================

const ui = createMobileUI({
  screenManager: screens,
  root
});

ui.mount();

console.log('[NgBuild Mobile Starter] Ready');
