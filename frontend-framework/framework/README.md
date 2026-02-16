# MiniFW - A Minimal Front-End Framework

MiniFW is a lightweight, modern front-end framework built from scratch with JavaScript. It provides essential features for building interactive web applications without the complexity of larger frameworks.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

MiniFW is designed to be:
- **Lightweight**: Minimal overhead, fast performance
- **Simple**: Easy to learn and use
- **Flexible**: Works with your existing code
- **Modern**: Uses modern JavaScript features

### Key Features

- ✅ **State Management**: Reactive state updates with automatic UI re-rendering
- ✅ **State Persistence**: Optional localStorage storage between sessions
- ✅ **Routing**: Hash-based routing with programmatic navigation
- ✅ **DOM Manipulation**: Declarative element creation and manipulation
- ✅ **Component System**: Reusable components with props
- ✅ **Event Handling**: Comprehensive event system with delegation
- ✅ **HTTP Client**: Built-in HTTP request abstraction
- ✅ **Performance**: Optimized rendering with lazy loading support

---

## Architecture

### Design Principles

1. **Framework, Not Library**: MiniFW controls the application lifecycle
2. **Declarative UI**: Describe what you want, not how to do it
3. **Reactive Updates**: UI automatically updates when state changes
4. **Component-Based**: Build reusable, composable components

### Core Components

```
┌─────────────────────────────────────┐
│         MiniFW Framework            │
├─────────────────────────────────────┤
│  State Management                   │
│  ├─ Global State                    │
│  ├─ Reactive Updates                │
│  └─ State Callbacks                 │
├─────────────────────────────────────┤
│  Routing                            │
│  ├─ Hash-based Routing              │
│  ├─ Programmatic Navigation         │
│  └─ Route Parameters                │
├─────────────────────────────────────┤
│  DOM Manipulation                   │
│  ├─ createElement                   │
│  ├─ Attribute/Style APIs            │
│  └─ Component Rendering             │
├─────────────────────────────────────┤
│  Event System                       │
│  ├─ Event Delegation                │
│  ├─ Multiple Event Types            │
│  └─ Event Control (prevent/stop)    │
├─────────────────────────────────────┤
│  HTTP Client                        │
│  ├─ GET, POST, PUT, DELETE, PATCH   │
│  ├─ Request/Response Handling       │
│  └─ Error Handling                  │
└─────────────────────────────────────┘
```

---

## Installation

### Option 1: Direct Download

1. Download `mini-fw.js` from the framework directory
2. Include it in your HTML:

```html
<script src="path/to/mini-fw.js"></script>
```

### Option 2: Copy to Your Project

```bash
cp framework/mini-fw.js your-project/js/
```

### Requirements

- Modern browser with ES6+ support
- No build tools required (works directly in the browser)

---

## Getting Started

### 1. Basic Setup

Create an HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My MiniFW App</title>
</head>
<body>
  <div id="app"></div>
  <script src="mini-fw.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

### 2. Create Your App

In `app.js`:

```javascript
MiniFW.createApp({
  root: "#app",
  initialState: {
    message: "Hello, MiniFW!"
  },
  routes: {
    "#/": (state) => `
      <h1>${state.message}</h1>
      <button data-event="click:handleClick">Click Me</button>
    `,
    "#/404": () => `<h1>Page Not Found</h1>`
  },
  methods: {
    handleClick(event, state, setState) {
      setState({ message: "Button clicked!" });
    }
  }
});
```

### 3. Run It

You can run your MiniFW app in several ways:

#### Option 1: Using a Local Server (Recommended)

**Using Python:**
```bash
# Navigate to your project directory
cd your-project

# Start a local server (Python 3)
python3 -m http.server 8000

# Then open in browser:
# http://localhost:8000/index.html
```

**Using Node.js:**
```bash
# Install http-server globally (one time)
npm install -g http-server

# Start server
http-server -p 8000

# Or use npx (no installation needed)
npx http-server -p 8000
```

#### Option 2: Direct File Access

Simply double-click the HTML file or open it directly in your browser:
- **Windows/Mac**: Double-click `index.html`
- **Linux**: Right-click → Open with → Browser

**Note**: Some features (like HTTP requests) may not work with `file://` protocol due to browser security restrictions. Use a local server for full functionality.

#### Option 3: Using VS Code Live Server

If you use VS Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

That's it! Your app should now be running.

---

## Core Concepts

### State Management

State is the single source of truth for your application data. When state changes, the UI automatically updates.

```javascript
MiniFW.createApp({
  initialState: {
    count: 0,
    todos: []
  },
  // ... rest of config
});
```

**Updating State:**

```javascript
methods: {
  increment(event, state, setState) {
    setState({ count: state.count + 1 });
  }
}
```

**State is Immutable**: Always use `setState` to update. Never mutate state directly.

#### Persisting State Between Sessions

Turn on persistence with the `persistState` option. MiniFW will automatically hydrate from and save to `localStorage` after every state change:

```javascript
MiniFW.createApp({
  root: "#app",
  initialState: { todos: [], filter: "all" },
  persistState: {
    storageKey: "my-todo-app",
    whitelist: ["todos", "filter"]
  },
  // ...routes and methods
});
```

`persistState` accepts:
- `true` – enables persistence with an auto-generated key (`MiniFW:#app`)
- `string` – uses the provided key
- `object` – fine-grained control via:
  - `storageKey`/`key`: storage key name
  - `whitelist`/`blacklist`: choose which state fields sync
  - `serialize`/`deserialize`: custom (de)serialization functions
  - `storage`: alternate storage provider (defaults to `localStorage`)

Keys starting with `_` and any functions are never persisted to avoid leaking internal references.

### Routing

Routes map URLs to views. MiniFW uses hash-based routing (`#/path`).

```javascript
routes: {
  "#/": (state) => `<div>Home Page</div>`,
  "#/about": (state) => `<div>About Page</div>`,
  "#/users/:id": (state) => {
    const params = MiniFW.getRouteParams("#/users/:id");
    return `<div>User ID: ${params.id}</div>`;
  },
  "#/404": () => `<div>Not Found</div>`
}
```

**Programmatic Navigation:**

```javascript
// In a method
MiniFW.navigate("/about");

// Or get app instance
const app = MiniFW.createApp({...});
app.navigate("/users/123");
```

### Components

Components are reusable pieces of UI. Define them as functions:

```javascript
function TodoItem(props, state, setState) {
  return MiniFW.createElement('li', { className: 'todo-item' },
    MiniFW.createElement('span', null, props.text),
    MiniFW.createElement('button', {
      'data-event': 'click:deleteTodo',
      'data-id': props.id
    }, 'Delete')
  );
}

// Use in routes
routes: {
  "#/": (state) => {
    const items = state.todos.map(todo => 
      TodoItem({ text: todo.text, id: todo.id }, state, setState)
    );
    return MiniFW.createElement('ul', null, ...items);
  }
}
```

**Or use the createComponent helper:**

```javascript
const TodoItem = MiniFW.createComponent('TodoItem', (props, state, setState) => {
  return MiniFW.createElement('div', { className: 'todo' },
    props.text
  );
});
```

### Event Handling

MiniFW supports comprehensive event handling:

```html
<!-- In your HTML string or component -->
<button data-event="click:handleClick">Click</button>
<input data-event="input:handleInput" />
<form data-event="submit:handleSubmit" data-prevent-default="true">
```

**Event Format**: `data-event="eventType:handlerName"`

**Supported Events**: All standard DOM events (click, input, submit, change, keydown, etc.)

**Event Control**:
- `data-prevent-default="true"` - Prevents default browser behavior
- `data-stop-propagation="true"` - Stops event bubbling

**Handler Signature**:

```javascript
methods: {
  handleClick(event, state, setState) {
    // event - the native DOM event
    // state - current application state
    // setState - function to update state
    console.log('Clicked!', event.target);
  }
}
```

### DOM Manipulation

MiniFW provides a declarative API for creating and manipulating DOM elements:

```javascript
// Create element
const div = MiniFW.createElement('div', { id: 'myDiv', className: 'container' },
  'Hello World'
);

// Set attributes
MiniFW.setAttribute(div, 'data-id', '123');

// Set styles
MiniFW.setStyle(div, {
  color: 'red',
  fontSize: '16px',
  backgroundColor: '#f0f0f0'
});

// Append children
MiniFW.appendChild(div, MiniFW.createElement('span', null, 'Child'));
```

**In Components**:

```javascript
function MyComponent(props, state, setState) {
  return MiniFW.createElement('div', 
    { 
      className: 'my-component',
      style: { padding: '10px' }
    },
    MiniFW.createElement('h1', null, props.title),
    MiniFW.createElement('p', null, props.content)
  );
}
```

### HTTP Requests

MiniFW includes a built-in HTTP client:

```javascript
// GET request
const data = await MiniFW.http.get('/api/users');

// POST request
const result = await MiniFW.http.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
});

// With options
const response = await MiniFW.http.get('/api/data', {
  headers: { 'Authorization': 'Bearer token' },
  timeout: 5000
});
```

**Available Methods**:
- `MiniFW.http.get(url, options)`
- `MiniFW.http.post(url, body, options)`
- `MiniFW.http.put(url, body, options)`
- `MiniFW.http.delete(url, options)`
- `MiniFW.http.patch(url, body, options)`

**Error Handling**:

```javascript
try {
  const data = await MiniFW.http.get('/api/data');
} catch (error) {
  console.error('Request failed:', error);
}
```

---

## API Reference

### MiniFW.createApp(config)

Creates and initializes a MiniFW application.

**Parameters:**
- `config.root` (string) - CSS selector for root element
- `config.initialState` (object) - Initial application state
- `config.routes` (object) - Route definitions (path -> view function)
- `config.methods` (object) - Event handler methods
- `config.onInit` (function) - Initialization callback
- `config.components` (object) - Component definitions
- `config.persistState` (boolean|string|object) - Enable automatic localStorage persistence

**Returns:** App instance with navigation methods

**Example:**

```javascript
const app = MiniFW.createApp({
  root: "#app",
  initialState: { count: 0 },
  routes: { "#/": (state) => `<div>Count: ${state.count}</div>` },
  methods: {
    increment: (e, state, setState) => setState({ count: state.count + 1 })
  }
});

// Use app instance
app.navigate("/about");
```

### MiniFW.createElement(tag, props, ...children)

Creates a DOM element.

**Parameters:**
- `tag` (string|function) - HTML tag name or component function
- `props` (object) - Element properties/attributes
- `...children` - Child elements or text nodes

**Returns:** DOM Element

**Example:**

```javascript
const el = MiniFW.createElement('div', 
  { id: 'myDiv', className: 'container' },
  MiniFW.createElement('h1', null, 'Title'),
  'Some text'
);
```

### MiniFW.createComponent(name, renderFn)

Creates a reusable component.

**Parameters:**
- `name` (string) - Component name
- `renderFn` (function) - Render function `(props, state, setState) => element`

**Returns:** Component function

### MiniFW.setAttribute(element, name, value)

Sets an attribute on an element.

### MiniFW.setStyle(element, styles)

Sets CSS styles on an element. Accepts object or string.

### MiniFW.http

HTTP client with methods: `get`, `post`, `put`, `delete`, `patch`

### MiniFW.navigate(path, replace)

Navigates to a new route programmatically.

**Parameters:**
- `path` (string) - Route path
- `replace` (boolean) - Replace current history entry

### MiniFW.getCurrentRoute()

Returns the current route hash.

### MiniFW.getRouteParams(pattern)

Extracts route parameters from current route.

**Example:**

```javascript
// Route: #/users/123
const params = MiniFW.getRouteParams("#/users/:id");
// Returns: { id: "123" }
```

### MiniFW.renderLazyList(items, renderItem, container, options)

Renders a large list efficiently with lazy loading.

**Parameters:**
- `items` (array) - Array of items to render
- `renderItem` (function) - Function to render each item
- `container` (element) - Container element
- `options` (object) - Configuration (itemHeight, containerHeight, buffer)

---

## Best Practices

### 1. State Management

✅ **Do:**
```javascript
setState({ count: state.count + 1 });
```

❌ **Don't:**
```javascript
state.count++; // Never mutate state directly
```

### 2. Component Organization

✅ **Do:** Keep components small and focused

```javascript
function Button(props, state, setState) {
  return MiniFW.createElement('button', 
    { 'data-event': `click:${props.onClick}` },
    props.label
  );
}
```

### 3. Event Handling

✅ **Do:** Use descriptive handler names

```javascript
methods: {
  handleSubmitForm: (e, state, setState) => { ... },
  handleDeleteItem: (e, state, setState) => { ... }
}
```

### 4. Routing

✅ **Do:** Always provide a 404 route

```javascript
routes: {
  "#/": (state) => `...`,
  "#/404": () => `<h1>Page Not Found</h1>`
}
```

### 5. Performance

✅ **Do:** Use lazy rendering for large lists

```javascript
const fragment = MiniFW.renderLazyList(
  items,
  (item, index) => MiniFW.createElement('div', null, item.name),
  container,
  { itemHeight: 50, containerHeight: 400 }
);
```

### 6. Error Handling

✅ **Do:** Wrap async operations in try/catch

```javascript
methods: {
  async loadData(e, state, setState) {
    try {
      const data = await MiniFW.http.get('/api/data');
      setState({ data });
    } catch (error) {
      console.error('Failed to load data:', error);
      setState({ error: error.message });
    }
  }
}
```

### 7. Security

✅ **Do:** Sanitize user input before rendering

```javascript
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// In your view
routes: {
  "#/": (state) => `<div>${escapeHtml(state.userInput)}</div>`
}
```

---

## Examples

### Example 1: Counter App

```javascript
MiniFW.createApp({
  root: "#app",
  initialState: { count: 0 },
  routes: {
    "#/": (state) => `
      <div>
        <h1>Count: ${state.count}</h1>
        <button data-event="click:increment">+</button>
        <button data-event="click:decrement">-</button>
        <button data-event="click:reset">Reset</button>
      </div>
    `
  },
  methods: {
    increment: (e, state, setState) => setState({ count: state.count + 1 }),
    decrement: (e, state, setState) => setState({ count: state.count - 1 }),
    reset: (e, state, setState) => setState({ count: 0 })
  }
});
```

### Example 2: Todo List with Components

```javascript
// Define TodoItem component
function TodoItem(props, state, setState) {
  return MiniFW.createElement('li', { className: 'todo-item' },
    MiniFW.createElement('span', null, props.text),
    MiniFW.createElement('button', {
      'data-event': 'click:deleteTodo',
      'data-id': props.id
    }, 'Delete')
  );
}

MiniFW.createApp({
  root: "#app",
  initialState: { todos: [], input: '' },
  routes: {
    "#/": (state) => {
      const items = state.todos.map(todo => 
        TodoItem({ text: todo.text, id: todo.id }, state, setState)
      );
      
      return MiniFW.createElement('div', null,
        MiniFW.createElement('h1', null, 'Todo List'),
        MiniFW.createElement('input', {
          id: 'todo-input',
          placeholder: 'New todo',
          'data-event': 'input:updateInput'
        }),
        MiniFW.createElement('button', {
          'data-event': 'click:addTodo'
        }, 'Add'),
        MiniFW.createElement('ul', null, ...items)
      );
    }
  },
  methods: {
    updateInput: (e, state, setState) => {
      setState({ input: e.target.value });
    },
    addTodo: async (e, state, setState) => {
      const input = document.querySelector('#todo-input');
      if (!input.value.trim()) return;
      
      try {
        const todos = await MiniFW.http.post('/api/todos', {
          text: input.value
        });
        input.value = '';
        setState({ todos, input: '' });
      } catch (error) {
        console.error('Failed to add todo:', error);
      }
    },
    deleteTodo: async (e, state, setState) => {
      const id = e.target.dataset.id;
      try {
        const todos = await MiniFW.http.delete(`/api/todos/${id}`);
        setState({ todos });
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  }
});
```

### Example 3: User Profile with Route Parameters

```javascript
MiniFW.createApp({
  root: "#app",
  initialState: { user: null, loading: true },
  routes: {
    "#/users/:id": async (state) => {
      const params = MiniFW.getRouteParams("#/users/:id");
      if (!state.user || state.user.id !== params.id) {
        // Load user data
        try {
          const user = await MiniFW.http.get(`/api/users/${params.id}`);
          setState({ user, loading: false });
        } catch (error) {
          return `<div>Error loading user: ${error.message}</div>`;
        }
      }
      
      if (state.loading) return '<div>Loading...</div>';
      
      return `
        <div>
          <h1>${state.user.name}</h1>
          <p>Email: ${state.user.email}</p>
          <button data-event="click:goBack">Back</button>
        </div>
      `;
    }
  },
  methods: {
    goBack: (e, state, setState) => {
      MiniFW.goBack();
    }
  }
});
```

---

## Performance Tips

1. **Use Lazy Rendering**: For lists with 100+ items, use `renderLazyList`
2. **Component Caching**: Components are automatically cached
3. **Minimize Re-renders**: Framework only re-renders when HTML changes
4. **Debounce Input**: For search/filter inputs, debounce the handlers

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires ES6+ support

---

## License

This framework is provided as-is for educational and project purposes.

---

## Contributing

When extending MiniFW, consider:
- Maintaining backward compatibility
- Adding comprehensive examples
- Documenting new features
- Testing across browsers

---

## Need Help?

Check the example project in the `example/` directory for a complete working application.
