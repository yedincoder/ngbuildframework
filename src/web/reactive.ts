
import {
  mount,
  update
} from './dom.js';

import type {
  Child
} from '../core/renderer.js';

import type {
  State
} from './state.js';

export interface ReactiveLifecycle {
  onMount?: () => void;
  onUpdate?: () => void;
  onUnmount?: () => void;
}

export function mountReactive<T>(
  target: Element,
  component: () => Child,
  state: State<T>,
  lifecycle?: ReactiveLifecycle
): () => void;

export function mountReactive(
  target: Element,
  component: () => Child,
  states: State<unknown>[],
  lifecycle?: ReactiveLifecycle
): () => void;

export function mountReactive<T>(
  target: Element,
  component: () => Child,
  stateOrStates: State<T> | State<unknown>[],
  lifecycle: ReactiveLifecycle = {}
): () => void {
  const states = Array.isArray(stateOrStates)
    ? stateOrStates
    : [stateOrStates];

  let mounted = false;

  // Initial render
  mount(component(), target);

  try {
    lifecycle.onMount?.();
  } catch (error) {
    // Mount failed: clear rendered content.
    target.replaceChildren();
    throw error;
  }

  mounted = true;

  const unsubscribers: Array<() => void> = [];

  try {
    for (const state of states) {
      const unsubscribe = state.subscribe(() => {
        if (!mounted) {
          return;
        }

        update(component(), target);
        lifecycle.onUpdate?.();
      });

      unsubscribers.push(unsubscribe);
    }
  } catch (error) {
    mounted = false;

    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }

    target.replaceChildren();
    throw error;
  }

  // Idempotent cleanup
  return () => {
    if (!mounted) {
      return;
    }

    mounted = false;

    // Unsubscribe before invoking user lifecycle.
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }

    // Even if this throws, subscriptions are removed.
    lifecycle.onUnmount?.();
  };
}
