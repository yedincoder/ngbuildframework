
export type StateListener<T> = (
  value: T,
  previousValue: T
) => void;

export interface State<T> {
  get(): T;
  set(value: T | ((previous: T) => T)): void;
  subscribe(listener: StateListener<T>): () => void;
}

export function createState<T>(
  initialValue: T
): State<T> {
  let value = initialValue;

  const listeners = new Set<StateListener<T>>();

  return {
    get(): T {
      return value;
    },

    set(nextValue): void {
      const previousValue = value;

      const updatedValue =
        typeof nextValue === 'function'
          ? (nextValue as (previous: T) => T)(previousValue)
          : nextValue;

      if (Object.is(previousValue, updatedValue)) {
        return;
      }

      value = updatedValue;

      for (const listener of [...listeners]) {
        listener(value, previousValue);
      }
    },

    subscribe(listener): () => void {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }
  };
}
