/* look up step 5 in "Build a Frontend Web Framework" for more 
(here did differently than in the book) but basically same way trying to overwrite that when 
user clicks a link, the framework’s router prevents the default
behavior of reloading the page,instead, it renders the component that’s configured
for the new route */

# Dot.js — Tiny Frontend Framework & Example App

> Lightweight, dependency-free UI framework for small SPAs. Designed for clarity, teachability, and practical defaults.

This repository contains a small framework (`frontend-framework/framework/src`) and an example Single-Page Application (`frontend-framework/example`) that demonstrates hash routing, delegated events, a reactive state store with optional persistence, and a tiny HTTP client. The example app is intentionally simple so you can read, modify, and extend the framework.

---

# Table of contents

- [Goals & design principles](#goals--design-principles)
- [Architecture overview](#architecture-overview)
- [Installation](#installation)
- [Getting started (quickstart)](#getting-started-quickstart)
- [Core features and API](#core-features-and-api)
  - [`h()` — virtual node factory](#h---virtual-node-factory)
  - [`mount()` — renderer](#mount---renderer)
  - [Event delegation](#event-delegation)
  - [`createStore()` — reactive state store](#createstore---reactive-state-store)
  - [`createHashRouter()` — hash-based router](#createhashrouter---hash-based-router)
  - [`createHTTPClient()` — simple HTTP wrapper](#createhttpclient---simple-http-wrapper)
- [Example: building a Todos page](#example-building-a-todos-page)
- [Architecture & design details](#architecture--design-details)
- [Best practices](#best-practices)

---

# Goals & design principles

Dot.js is small by design. The framework is intended to:

- Be explicit and readable — application code should be straightforward to follow.
- Keep the mental model minimal: a tiny vnode format, a simple renderer, a reactive store, delegated events, and a router.
- Favor clarity over magic: components are plain functions, state updates are explicit, and side effects are obvious.
- Be practical for small SPAs and demos; it's not a production-ready replacement for full frameworks but a teaching-quality minimal framework.

Design principles:

- **Composability:** small primitives combine to build higher-level features.
- **Single responsibility:** each module (render, store, router, http, delegation) has a focused API.
- **Explicitness:** state changes via `store.set`, events via `on: {}`, and routing via `navigate()`.
- **Determinism:** no hidden async rendering — the app rerenders on store or route changes.

---

# Architecture overview

At a high level:

```
App (example/app.js)
├─ uses framework/src/index.js -> imports primitives
│  ├─ core/h.js        (create vnode)
│  ├─ core/mount.js    (vnode -> DOM renderer)
│  ├─ events/delegation.js  (register handlers + root listeners)
│  ├─ state/store.js   (reactive store with optional persistence)
│  ├─ router/hashRouter.js  (hash routing with dynamic segments)
│  └─ http/httpClient.js   (fetch wrapper)
└─ pages/ (Home, Todos, About, etc.)
```

The renderer (`mount`) accepts a vnode tree and a container element and creates DOM nodes. Components are functions that return vnodes. The renderer supports delegated events by adding `data-dot-on<event>` attributes and ensuring a single root listener per event type.

---

# Installation

This project ships as plain ES modules under `frontend-framework/framework/src`. For development you can either use the provided Go server or any static server that serves the `example` directory.

Requirements:
- Node (optional) or Go to run the included server for convenience
- Browser that supports ES modules (modern browsers)

Options:

1. **Run with the included Go server (recommended for demo):**

```bash
go run .
# open http://localhost:8080/example/
```

2. **Use a bundler / dev server (optional):**

You can copy the `framework/src` files into an npm project and import them, or configure an ES module dev server.

---

# Getting started (quickstart)

1. Open `frontend-framework/example/index.html` in the browser (via a server).
2. `app.js` imports the framework primitives and mounts the `App` component into `<div id="app"></div>`.
3. Use the navigation links to switch pages. Add todos and refresh the page — the store persists to `localStorage` when enabled.

If you cloned the repo:

```bash
# Run example server
go run .
# visit http://localhost:8080/example/
```

---

# Core features and API

The following subsections explain each feature and provide short usage examples based on the example app.

## `h()` — virtual node factory

File: `framework/src/core/h.js`

`h(type, props = {}, ...children)` returns a simple vnode object:

```js
h('div', { id: 'root', style: { padding: '12px' } }, [
  h('h1', {}, ['Hello']),
  h(MyComponent, { someProp: 123 }),
])
```

`type` can be a string (HTML tag) or a component function. Children may be strings, numbers, or nested vnodes. The vnode structure is intentionally tiny: `{ type, props, children }`.


## `mount()` — renderer

File: `framework/src/core/mount.js`

`mount(vnode, container)` converts the vnode into DOM. Important details:

- Text nodes create `Text` nodes.
- If `vnode.type` is a function it is invoked with `vnode.props`.
- `props.style` is applied to `el.style`.
- `props.class` / `className` sets `el.className`.
- `props.on` is an object mapping event names to handlers (delegated).

Example:

```js
import { h, mount } from './framework/src/index.js';

function App() {
  return h('div', {}, [h('p', {}, ['Count: 0'])]);
}

mount(App(), document.getElementById('app'));
```

The current `mount` implementation replaces the container contents on every render — it's simple and reliable for small apps.

## Event delegation

File: `framework/src/events/delegation.js`

To avoid adding many DOM listeners, event handlers are registered centrally. `mount` calls `registerEventHandler(handler)` for each handler and sets `data-dot-on<event>` on the element. `ensureRootListener(rootEl, eventName)` attaches one listener to the root container which dispatches to handlers by id.

Handler wrapper: the framework passes a wrapped event object with `preventDefault()` and `stopPropagation()` that also sets an internal `_stopped` flag; if a handler calls `stopPropagation()` the delegator stops walking up the DOM.

Example usage from `app.js`:

```js
h('button', { on: { click: (e) => store.set(s => ({ ...s, count: s.count + 1 })) } }, ['+1'])
```

## `createStore()` — reactive state store

File: `framework/src/state/store.js`

API:

```js
const store = createStore({ count: 0, todos: [] }, { persistKey: 'example-state' });
store.get();
store.set(updaterOrNewState);
const unsubscribe = store.subscribe(fn);
```

- `set` accepts either a full new state object or an updater function: `s => ({ ...s, count: s.count + 1 })`.
- When `persistKey` is provided, the store rehydrates from `localStorage` on creation and saves the state on every `set()`.

Best practice: keep state flat and immutable; return new objects from `set`.

## `createHashRouter()` — hash-based router

File: `framework/src/router/hashRouter.js`

API:

```js
const router = createHashRouter({
  '/': () => HomePage(),
  '/todos': () => TodosPage(store),
  '/todos/:id': ({ params }) => TodoDetailsPage(store, params),
  '*': () => NotFoundPage(),
});

router.start();
const match = router.getMatch();
router.attachLinkInterceptor(document.getElementById('app'));
```

Routing supports dynamic segments (`:id`) and a wildcard `*`. `attachLinkInterceptor(rootEl)` intercepts internal `#/` links so navigation stays client-side.

## `createHTTPClient()` — simple HTTP wrapper

File: `framework/src/http/httpClient.js`

Usage:

```js
const api = createHTTPClient({ baseURL: '/api' });
const res = await api.get('/todo');
await api.post('/items', { title: 'hello' });
```

It wraps `fetch`, sets `Content-Type: application/json`, serializes request bodies, and attempts to parse JSON responses.

---

# Example: building a Todos page

This repository already includes a complete example at `frontend-framework/example/pages/todos.js`. The flow is:

1. A `draftTitle` variable holds the input text to avoid rerendering on every keystroke.
2. On form submit, a new todo object is created and `store.set` is used to prepend it to `state.todos`.
3. Each todo renders:
   - A link to `#/todos/{id}` (dynamic route),
   - A button to toggle completion, which calls `store.set(s => ({ ...s, todos: s.todos.map(...) }))`,
   - A button to delete, which filters `todos`.

Key code excerpt:

```js
// adding a todo
const newTodo = { id: makeId(), title, completed: false };
store.set(s => ({ ...s, todos: [newTodo, ...(s.todos || [])] }));
```

---

# Architecture & design details

### Rendering model

- The framework uses a **functional component** model: components are functions that return vnodes.
- The renderer is synchronous and idempotent: calling `mount(App(), container)` clears the container and builds fresh DOM. This is simple and predictable for small apps.
- Event delegation reduces DOM listener overhead and lets the renderer remain naive (no diffing) while remaining reasonably efficient.

### Routing

- Hash-based routing (`#/path`) is used for maximum compatibility with static file serving.
- `matchRoute` compares path segments and extracts dynamic params. It requires equal segment counts — this keeps the implementation tiny and predictable.

### State & persistence

- `createStore` merges persisted state over initial defaults to avoid losing newly added defaults when state was saved earlier.
- Persistence uses `localStorage` and is optional.

### Event system

- Handlers are stored in a map keyed by string IDs. DOM elements carry the handler id in `data-dot-on<event>`. The root listener looks up the handler id and invokes the handler with a wrapped event.

---

# Best practices

Use these rules when building apps with Dot.js:

- **Keep state shape predictable:** prefer simple plain objects and arrays. Avoid nested mutable objects; replace with new objects on updates.

- **Use updater functions with `store.set`** to avoid race conditions:

```js
store.set(prev => ({ ...prev, count: prev.count + 1 }));
```

- **Avoid heavy per-keystroke state updates**. For inputs where you don't want re-renders on every character (like the Todos example), keep a module-level `draft` variable and only commit on submit.

- **Favor pure components**: components should avoid side effects. If side effects are necessary (HTTP, timers), do them in event handlers rather than in render.

- **Accessibility:** always provide accessible labels and keyboard interaction for interactive controls. Use `aria-` attributes and semantic HTML when possible.

- **Routing semantics:** keep navigation links as `href="#/path"` so the router can intercept; also provide `rel="noopener"` / appropriate attributes for external links.

- **Testable code:** keep your route matching and store manipulations in small testable functions. `matchRoute` and `createStore` are ideal unit test targets.

- **Performance tip:** for larger apps, replace the naive mount (replace-all) with a minimal diff/patch algorithm or a keyed list helper for long lists.


