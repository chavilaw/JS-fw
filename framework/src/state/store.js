export function createStore(initialState = {}) {
  let state = initialState;
  const listeners = new Set();

  function get() {
    return state;
  }

  function set(updater) {
    const nextState =
      typeof updater === "function"
        ? updater(state)
        : updater;

    state = nextState;
    listeners.forEach((fn) => fn(state));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { get, set, subscribe };
}
