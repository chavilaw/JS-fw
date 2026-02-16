const MiniFW = (() => {
  // ============================================================================
  // INTERNAL STATE & VARIABLES
  // ============================================================================
  // These variables maintain the framework's internal state
  let state = {};                    // Application state
  let rootEl;                         // Root DOM element where app renders
  let prevVDOM = null;                // Previous virtual DOM for comparison
  let eventListeners = new Map();    // Track event listeners for cleanup
  let componentCache = new Map();     // Cache for component instances
  let navigationHistory = [];        // Navigation history stack
  let currentHistoryIndex = -1;       // Current position in history

  // ============================================================================
  // DOM MANIPULATION API
  // ============================================================================
  // Provides declarative API for creating and manipulating DOM elements
  // Key methods: createElement, setStyle, setAttribute, appendChild
  const DIRECT_PROP_ATTRIBUTES = new Set(['value', 'checked', 'selected', 'disabled']);
  const DOM = {
    createElement(tag, props = {}, ...children) {
      if (typeof tag === 'function') {
        // Component - will be handled by createApp's component system
        return tag(props, state, null); // setState not available here, components should use it from props
      }
      
      const el = document.createElement(tag);
      
      // Set attributes
      if (props) {
        Object.keys(props).forEach(key => {
          if (key === 'key') return; // Internal use
          if (key === 'style' && typeof props[key] === 'object') {
            this.setStyle(el, props[key]);
          } else if (key.startsWith('on') && typeof props[key] === 'function') {
            // Event handler
            const eventType = key.substring(2).toLowerCase();
            el.addEventListener(eventType, props[key]);
          } else if (key === 'className' || key === 'class') {
            el.className = props[key];
          } else if (key === 'innerHTML') {
            el.innerHTML = props[key];
          } else {
            this.setAttribute(el, key, props[key]);
          }
        });
      }
      
      // Append children
      this.appendChildren(el, children);
      
      return el;
    },

    appendChildren(parent, children) {
      children.forEach(child => {
        if (child === null || child === undefined) return;
        if (typeof child === 'string' || typeof child === 'number') {
          parent.appendChild(document.createTextNode(String(child)));
        } else if (child instanceof Node) {
          parent.appendChild(child);
        } else if (Array.isArray(child)) {
          this.appendChildren(parent, child);
        }
      });
    },

    setAttribute(el, name, value) {
      if (value === null || value === undefined) {
        el.removeAttribute(name);
        if (DIRECT_PROP_ATTRIBUTES.has(name) && name in el) {
          el[name] = name === 'checked' ? false : '';
        }
        return;
      }

      if (DIRECT_PROP_ATTRIBUTES.has(name) && name in el) {
        el[name] = value;
        if (typeof value === 'boolean') {
          el.toggleAttribute(name, value);
        } else {
          el.setAttribute(name, String(value));
        }
        return;
      }

      el.setAttribute(name, String(value));
    },

    setStyle(el, styles) {
      if (typeof styles === 'string') {
        el.style.cssText = styles;
      } else if (styles && typeof styles === 'object') {
        Object.keys(styles).forEach(key => {
          const cssKey = key.startsWith('--') ? key : key.replace(/([A-Z])/g, '-$1').toLowerCase();
          const value = styles[key];
          if (value !== null && value !== undefined) {
            el.style.setProperty(cssKey, String(value));
          }
        });
      }
    },

    // Helper to convert style object to CSS string for use in HTML strings
    styleObjectToCss(styles) {
      if (typeof styles === 'string') {
        return styles;
      }
      if (!styles || typeof styles !== 'object') {
        return '';
      }
      return Object.keys(styles).map(key => {
        const cssKey = key.startsWith('--') ? key : key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const value = styles[key];
        if (value === null || value === undefined) {
          return '';
        }
        return `${cssKey}: ${String(value)}`;
      }).filter(Boolean).join('; ');
    },

    appendChild(parent, child) {
      if (child instanceof Node) {
        parent.appendChild(child);
      } else if (typeof child === 'string') {
        parent.appendChild(document.createTextNode(child));
      }
    },

    removeChild(parent, child) {
      if (parent && child && parent.contains(child)) {
        parent.removeChild(child);
      }
    }
  };

  // ============================================================================
  // COMPONENT SYSTEM
  // ============================================================================
  // Creates reusable component functions
  // Components are functions that take (props, state, setState) and return DOM
  function createComponent(name, renderFn) {
    return function(props, state, setState) {
      return renderFn(props, state, setState);
    };
  }

  // ============================================================================
  // HTTP CLIENT API
  // ============================================================================
  // Built-in HTTP client for making API requests
  // Supports: GET, POST, PUT, DELETE, PATCH
  // Features: Automatic JSON handling, timeout support, error handling
  const http = {
    async request(url, options = {}) {
      const {
        method = 'GET',
        headers = {},
        body = null,
        timeout = 30000
      } = options;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: body ? JSON.stringify(body) : null,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
        return await response.text();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    },

    get(url, options = {}) {
      return this.request(url, { ...options, method: 'GET' });
    },

    post(url, body, options = {}) {
      return this.request(url, { ...options, method: 'POST', body });
    },

    put(url, body, options = {}) {
      return this.request(url, { ...options, method: 'PUT', body });
    },

    delete(url, options = {}) {
      return this.request(url, { ...options, method: 'DELETE' });
    },

    patch(url, body, options = {}) {
      return this.request(url, { ...options, method: 'PATCH', body });
    }
  };

  // ============================================================================
  // NAVIGATION API (ROUTING)
  // ============================================================================
  // Hash-based routing system for single-page applications
  // Features: navigate, goBack, goForward, route parameters
  const navigation = {
    navigate(path, replace = false) {
      const fullPath = path.startsWith('#') ? path : `#${path}`;
      if (replace) {
        window.location.replace(fullPath);
        if (currentHistoryIndex >= 0) {
          navigationHistory[currentHistoryIndex] = fullPath;
        }
      } else {
        window.location.hash = fullPath;
        navigationHistory.push(fullPath);
        currentHistoryIndex = navigationHistory.length - 1;
      }
    },

    goBack() {
      if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        window.location.hash = navigationHistory[currentHistoryIndex];
      } else {
        window.history.back();
      }
    },

    goForward() {
      if (currentHistoryIndex < navigationHistory.length - 1) {
        currentHistoryIndex++;
        window.location.hash = navigationHistory[currentHistoryIndex];
      } else {
        window.history.forward();
      }
    },

    getCurrentRoute() {
      return window.location.hash || '#/';
    },

    getRouteParams(routePattern) {
      const current = this.getCurrentRoute();
      const pattern = routePattern.replace(/:[^/]+/g, '([^/]+)');
      const regex = new RegExp(`^#?${pattern}$`);
      const match = current.match(regex);
      
      if (!match) return null;
      
      const paramNames = routePattern.match(/:[^/]+/g) || [];
      const params = {};
      paramNames.forEach((name, index) => {
        params[name.substring(1)] = match[index + 1];
      });
      return params;
    }
  };

  // ============================================================================
  // PERFORMANCE: LAZY RENDERING
  // ============================================================================
  // Optimizes rendering of large lists by only rendering visible items
  // Used for lists with 100+ items to improve performance
  function renderLazyList(items, renderItem, container, options = {}) {
    const {
      itemHeight = 50,
      containerHeight = 400,
      buffer = 5
    } = options;

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, (options.scrollTop || 0) / itemHeight - buffer);
    const endIndex = Math.min(items.length, startIndex + visibleCount + buffer * 2);

    const visibleItems = items.slice(startIndex, endIndex);
    const fragment = document.createDocumentFragment();

    visibleItems.forEach((item, index) => {
      const actualIndex = startIndex + index;
      const el = renderItem(item, actualIndex);
      fragment.appendChild(el);
    });

    // Set container height for scrolling
    container.style.height = `${items.length * itemHeight}px`;
    container.style.overflow = 'auto';
    container.style.position = 'relative';

    return fragment;
  }

  // ============================================================================
  // APP CONFIGURATION VARIABLES
  // ============================================================================
  let methods = {};  // Event handler methods defined by user
  let routes = {};    // Route definitions (path -> view function)

  // ============================================================================
  // MAIN APP CREATION FUNCTION
  // ============================================================================
  // This is the core of the framework - initializes the application
  // Handles: State management, routing, event binding, rendering
  function createApp({ root, initialState, methods: appMethods, routes: appRoutes, onInit, components = {}, persistState }) {
    state = { ...initialState };
    rootEl = document.querySelector(root);
    methods = appMethods || {};
    routes = appRoutes || {};
    const persistence = initPersistence(persistState, root);

    if (!rootEl) {
      throw new Error(`Root element "${root}" not found`);
    }

    hydrateStateFromStorage();

    // Initialize navigation history
    navigationHistory = [navigation.getCurrentRoute()];
    currentHistoryIndex = 0;

    // Register components
    Object.keys(components).forEach(name => {
      componentCache.set(name, components[name]);
    });

    window.addEventListener("hashchange", update);
    
    // Handle async onInit properly
    if (onInit) {
      const initResult = onInit(state, setState);
      if (initResult && typeof initResult.then === 'function') {
        initResult.then(() => {
          update();
          persistStateSnapshot();
        }).catch((error) => {
          console.error('[MiniFW] onInit error:', error);
          update();
          persistStateSnapshot();
        });
      } else {
        // onInit is synchronous
        update();
        persistStateSnapshot();
      }
    } else {
      update();
      persistStateSnapshot();
    }

    // ========================================================================
    // STATE MANAGEMENT: setState FUNCTION
    // ========================================================================
    // Core reactive state update mechanism
    // When called, merges new state and triggers UI re-render
    // This is what makes the framework "reactive"
    function setState(newState) {
      const oldState = { ...state };
      state = { ...state, ...newState };
      
      // Trigger reactive updates
      update();
      
      // Call state change callbacks if registered
      if (state._callbacks) {
        state._callbacks.forEach(callback => {
          callback(state, oldState);
        });
      }

      persistStateSnapshot();
    }

    // ========================================================================
    // EVENT SYSTEM: EVENT HANDLER CREATION
    // ========================================================================
    // Creates event handlers that respect preventDefault and stopPropagation
    // Wraps user-defined methods with proper context (state, setState)
    function createEventHandler(el, handlerName) {
      return (e) => {
        // Prevent default if data-prevent-default is set
        if (el.dataset.preventDefault === 'true') {
          e.preventDefault();
        }
        
        // Stop propagation if data-stop-propagation is set
        if (el.dataset.stopPropagation === 'true') {
          e.stopPropagation();
        }
        
        // Call handler with proper context
        if (methods[handlerName]) {
          methods[handlerName](e, state, setState);
        }
      };
    }

    // ========================================================================
    // EVENT SYSTEM: EVENT BINDING
    // ========================================================================
    // Binds events to DOM elements using data-event attributes
    // Supports: data-event, data-event-{type}, data-action (legacy)
    // Automatically cleans up old listeners to prevent memory leaks
    function bindEvents() {
      // Clean up old listeners
      eventListeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      eventListeners.clear();

      // Bind events using data-event attribute
      rootEl.querySelectorAll("[data-event]").forEach(el => {
        const eventData = el.dataset.event;
        const [eventType, handlerName] = eventData.split(':');
        
        if (eventType && handlerName) {
          const handler = createEventHandler(el, handlerName);
          el.addEventListener(eventType, handler);
          eventListeners.set(el, { element: el, type: eventType, handler });
        }
      });

      // Support data-event-{eventType} format for multiple events on same element
      rootEl.querySelectorAll("[data-event-keydown], [data-event-keyup], [data-event-focus], [data-event-blur], [data-event-change], [data-event-submit]").forEach(el => {
        // Get all data-event-* attributes
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('data-event-')) {
            const eventType = attr.name.replace('data-event-', '');
            const handlerName = attr.value;
            
            if (eventType && handlerName && methods[handlerName]) {
              const handler = createEventHandler(el, handlerName);
              el.addEventListener(eventType, handler);
              // Store with unique key for multiple events on same element
              const key = `${el}_${eventType}`;
              eventListeners.set(key, { element: el, type: eventType, handler });
            }
          }
        });
      });

      // Support for data-action (backward compatibility)
      rootEl.querySelectorAll("[data-action]").forEach(el => {
        const action = el.dataset.action;
        const handler = (e) => {
          e.preventDefault();
          if (methods[action]) {
            methods[action](e, state, setState);
          }
        };
        el.addEventListener('click', handler);
        eventListeners.set(el, { element: el, type: 'click', handler });
      });
    }

    // ========================================================================
    // RENDERING: UPDATE FUNCTION
    // ========================================================================
    // Core rendering function - called on state changes and route changes
    // 1. Gets current route
    // 2. Calls route handler to get view
    // 3. Compares with previous render (performance optimization)
    // 4. Updates DOM only if changed
    // 5. Re-binds events
    function update() {
      const route = navigation.getCurrentRoute();
      
      // Update state to reflect current route
      if (state._currentRoute !== route) {
        state._currentRoute = route;
        // Extract route params if route has parameters
        const routeKeys = Object.keys(routes);
        state._routeParams = {};
        state._routePattern = route;
        
        for (const routePattern of routeKeys) {
          if (routePattern.includes(':')) {
            const params = navigation.getRouteParams(routePattern);
            if (params) {
              state._routeParams = params;
              state._routePattern = routePattern;
              break;
            }
          }
        }
      }
      
      // Try to find matching route: exact match first, then parameterized routes, then 404
      let view = routes[route];
      
      if (!view) {
        // Try to match parameterized routes
        const routeKeys = Object.keys(routes);
        for (const routePattern of routeKeys) {
          if (routePattern.includes(':')) {
            const params = navigation.getRouteParams(routePattern);
            if (params) {
              view = routes[routePattern];
              break;
            }
          }
        }
      }
      
      // Fallback to 404
      if (!view) {
        view = routes["#/404"] || routes["/404"];
      }
      
      if (!view) {
        console.warn(`No route handler found for: ${route}`);
        return;
      }

      let result;
      try {
        // Pass both state and setState to view functions
        // Support both old signature (state) and new signature (state, setState)
        if (view.length === 2) {
          result = view(state, setState);
        } else {
          result = view(state);
        }
      } catch (error) {
        console.error('Error rendering view:', error);
        // Use DOM.createElement directly since we're inside the IIFE
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'padding: 1rem; background-color: #ff4444; color: white; border-radius: 4px;';
        errorDiv.textContent = `Error rendering view: ${error.message}`;
        result = errorDiv;
      }

      // Handle both HTML strings and DOM elements
      let shouldUpdate = false;
      let newContent = null;
      
      if (result instanceof Node) {
        // DOM element - serialize to HTML for comparison
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(result.cloneNode(true));
        const newHTML = tempDiv.innerHTML;
        shouldUpdate = newHTML !== prevVDOM;
        if (shouldUpdate) {
          prevVDOM = newHTML;
          newContent = result; // Store the actual element
        }
      } else {
        // HTML string
        const html = String(result);
        shouldUpdate = html !== prevVDOM;
        if (shouldUpdate) {
          prevVDOM = html;
          newContent = html;
        }
      }

      // Performance: Only update if changed
      if (shouldUpdate) {
        // Clear component cache on route change
        componentCache.clear();
        
        if (newContent instanceof Node) {
          rootEl.innerHTML = '';
          rootEl.appendChild(newContent);
        } else {
          rootEl.innerHTML = newContent;
        }
        bindEvents();
      }
    }

    function hydrateStateFromStorage() {
      if (!persistence.enabled) {
        return;
      }
      try {
        const raw = persistence.storage.getItem(persistence.key);
        if (!raw) {
          return;
        }
        const restored = persistence.deserialize(raw);
        if (restored && typeof restored === 'object') {
          state = { ...state, ...restored };
        }
      } catch (error) {
        console.warn('[MiniFW] Failed to hydrate state:', error);
      }
    }

    function persistStateSnapshot() {
      if (!persistence.enabled) {
        return;
      }
      try {
        const snapshot = sanitizeStateForPersistence(state, persistence);
        const serialized = persistence.serialize(snapshot);
        persistence.storage.setItem(persistence.key, serialized);
      } catch (error) {
        console.warn('[MiniFW] Failed to persist state:', error);
      }
    }

    // ========================================================================
    // APP INSTANCE PUBLIC API
    // ========================================================================
    // Methods returned to the user when they call createApp
    // These allow programmatic control of the app instance
    return {
      setState,
      navigate: navigation.navigate,
      goBack: navigation.goBack,
      goForward: navigation.goForward,
      getState: () => ({ ...state }),
      getRoute: navigation.getCurrentRoute,
      getRouteParams: navigation.getRouteParams
    };
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  // Security: HTML escaping for XSS protection
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================================================
  // FRAMEWORK PUBLIC API
  // ============================================================================
  // Everything exposed to users of the framework
  // This is what you access via MiniFW.*
  return {
    createApp,
    createElement: DOM.createElement.bind(DOM),
    createComponent,
    setAttribute: DOM.setAttribute.bind(DOM),
    setStyle: DOM.setStyle.bind(DOM),
    styleObjectToCss: DOM.styleObjectToCss.bind(DOM),
    appendChild: DOM.appendChild.bind(DOM),
    removeChild: DOM.removeChild.bind(DOM),
    http,
    navigate: navigation.navigate,
    goBack: navigation.goBack,
    goForward: navigation.goForward,
    getCurrentRoute: navigation.getCurrentRoute,
    getRouteParams: navigation.getRouteParams,
    renderLazyList,
    escapeHtml
  };
})();

function initPersistence(option, rootSelector) {
  if (!option) {
    return { enabled: false };
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    console.warn('[MiniFW] Persistence requested but localStorage is unavailable.');
    return { enabled: false };
  }

  const defaultConfig = {
    enabled: true,
    storage: window.localStorage,
    key: `MiniFW:${rootSelector}`,
    whitelist: null,
    blacklist: null,
    serialize: JSON.stringify,
    deserialize: JSON.parse
  };

  if (option === true) {
    return defaultConfig;
  }

  if (typeof option === 'string') {
    return { ...defaultConfig, key: option };
  }

  if (typeof option === 'object') {
    const resolved = {
      enabled: option.enabled !== false,
      storage: option.storage || window.localStorage,
      key: option.storageKey || option.key || defaultConfig.key,
      whitelist: option.whitelist || null,
      blacklist: option.blacklist || null,
      serialize: option.serialize || JSON.stringify,
      deserialize: option.deserialize || JSON.parse
    };

    if (!resolved.enabled) {
      return { enabled: false };
    }

    return resolved;
  }

  return { enabled: false };
}

function sanitizeStateForPersistence(source, config) {
  const snapshot = {};
  const keys = Object.keys(source || {});

  keys.forEach(key => {
    if (key.startsWith('_')) {
      return;
    }

    if (config.whitelist && !config.whitelist.includes(key)) {
      return;
    }

    if (config.blacklist && config.blacklist.includes(key)) {
      return;
    }

    const value = source[key];

    if (typeof value === 'function') {
      return;
    }

    if (typeof Node !== 'undefined' && value instanceof Node) {
      return;
    }

    snapshot[key] = value;
  });

  return snapshot;
}
