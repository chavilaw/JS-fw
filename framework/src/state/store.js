export function createStore(initialState = {}, options = {}) {
  const { persistKey } = options;

  let state = initialState;
  const listeners = new Set();

  // Load persisted state once (if enabled)
  if (persistKey) {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) {
        const persisted = JSON.parse(raw);
        // Merge persisted over defaults
        state = { ...initialState, ...persisted };
      }
    } catch (err) {
      // If localStorage is blocked/corrupted, don't crash the app
      console.warn("Store persistence load failed:", err);
    }
  }

  function get() {
    return state;
  }

  function save(nextState) {
    if (!persistKey) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify(nextState));
    } catch (err) {
      console.warn("Store persistence save failed:", err);
    }
  }

  function set(updater) {
    const nextState =
      typeof updater === "function"
        ? updater(state)
        : updater;

    state = nextState;

    // Persist first (so it always matches what listeners see)
    save(state);

    // Notify subscribers
    listeners.forEach((fn) => fn(state));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return { get, set, subscribe };
}

// Note: persistence is optional and can be enabled by passing a persistKey 
// in app.js we create persisKey = "example-state" to enable it
