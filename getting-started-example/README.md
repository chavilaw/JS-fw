# Getting Started Examples

Simple examples demonstrating how to use the MiniFW framework.

## 🚀 Quick Start

**Run the examples:**
```bash
# From the project root directory
python3 -m http.server 8000

# Then open in browser:
# Basic: http://localhost:8000/getting-started-example/simple/basic-example.html
# Enhanced: http://localhost:8000/getting-started-example/better/enhanced-example.html
```

**Or simply:** Double-click the HTML files directly in your browser.

## Differences: Basic vs Enhanced

| Feature | Basic Example | Enhanced Example |
|---------|--------------|------------------|
| **Routes** | 2 routes (home, 404) | 4 routes (home, about, counter, 404) |
| **State Properties** | 1 (`message`) | 3 (`message`, `counter`, `name`) |
| **Navigation** | None | Navigation menu with links |
| **Interactive Features** | 1 button | Counter buttons + input field |
| **Event Handlers** | 1 method | 6 methods |
| **Complexity** | Minimal - perfect for learning | More features - shows real-world usage |

**Basic Example** = Simple "Hello World" style app - great for understanding the basics  
**Enhanced Example** = More complete app - shows routing, multiple interactions, and real-time updates

## Examples

### 1. Basic Example (`simple/basic-example.html` + `simple/app.js`)

A minimal example that matches the Getting Started guide exactly.

**What it demonstrates:**
- Basic setup with HTML and framework script
- Initial state management
- Simple routing
- Event handling with `data-event` attributes
- Reactive state updates

**How to run:**
```bash
# From the project root directory
python3 -m http.server 8000

# Then open in browser:
# http://localhost:8000/getting-started-example/simple/basic-example.html
```

**Or:** Double-click `simple/basic-example.html` to open directly.

**Try it:**
1. Click the "Click Me" button - the message will change!
2. The state is reactive, so any change to `state.message` automatically updates the UI

### 2. Enhanced Example (`better/enhanced-example.html` + `better/enhanced-app.js`)

A more comprehensive example showing additional features.

**What it demonstrates:**
- Multiple routes and navigation
- Counter with increment/decrement/reset
- Input handling and real-time updates
- Programmatic navigation with `MiniFW.navigate()`
- Multiple state properties

**How to run:**
```bash
# From the project root directory
python3 -m http.server 8000

# Then open in browser:
# http://localhost:8000/getting-started-example/better/enhanced-example.html
```

**Or:** Double-click `better/enhanced-example.html` to open directly.

**Try it:**
1. Navigate between pages using the navigation links
2. Try the counter (increment/decrement/reset)
3. Type in the name input to see real-time updates

## Key Concepts Demonstrated

### State Management
```javascript
initialState: {
  message: "Hello, MiniFW!",
  counter: 0
}
```

### Routes
```javascript
routes: {
  "#/": (state) => `<h1>${state.message}</h1>`,
  "#/about": (state) => `<h1>About</h1>`
}
```

### Event Handling
```html
<button data-event="click:handleClick">Click Me</button>
```

```javascript
methods: {
  handleClick(event, state, setState) {
    setState({ message: "Updated!" });
  }
}
```

### Reactive Updates
When you call `setState()`, the UI automatically re-renders with the new state. No manual DOM manipulation needed!
