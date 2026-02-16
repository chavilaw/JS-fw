# MiniFW - A Minimal Front-End Framework

MiniFW is a lightweight, modern front-end framework built from scratch with JavaScript. It provides essential features for building interactive web applications without the complexity of larger frameworks.

## 📁 Project Structure

```
frontend_framework/
├── framework/
│   ├── mini-fw.js          # The framework code
│   └── README.md           # Complete API documentation
├── getting-started-example/ # Simple examples for learning
│   ├── simple/             # Basic example
│   └── better/             # Enhanced example
├── example/                # Complete Todo app example
│   ├── frontend/           # Frontend code
│   └── backend/            # Backend server
├── docs/                   # Internal documentation (for you)
│   ├── REVIEW_GUIDE.md
│   ├── HOW_TO_DEMONSTRATE.md
│   ├── QUICK_REFERENCE.md
│   └── FRAMEWORK_STRUCTURE.md
└── HOW_TO_IMPLEMENT.md     # Guide for reviewers
```

## 🚀 Quick Start

### For Reviewers

1. **Read the implementation guide:**
   - [`HOW_TO_IMPLEMENT.md`](HOW_TO_IMPLEMENT.md) - Step-by-step guide to implement your app

2. **Check out the examples:**
   - [`getting-started-example/`](getting-started-example/) - Simple examples
   - [`example/`](example/) - Complete Todo app

3. **Reference the API:**
   - [`framework/README.md`](framework/README.md) - Complete API documentation

### For You (During Review)

1. **Internal guides** (in `docs/` folder):
   - `REVIEW_GUIDE.md` - Complete review guide
   - `QUICK_REFERENCE.md` - Quick cheat sheet
   - `HOW_TO_DEMONSTRATE.md` - Feature demonstration guide
   - `FRAMEWORK_STRUCTURE.md` - Framework code navigation

## 📚 Documentation

### Public Documentation (for reviewers)
- **[HOW_TO_IMPLEMENT.md](HOW_TO_IMPLEMENT.md)** - How to implement an app with MiniFW
- **[framework/README.md](framework/README.md)** - Complete API reference and documentation
- **[getting-started-example/README.md](getting-started-example/README.md)** - Example documentation

### Internal Documentation (for you)
- **[docs/README.md](docs/README.md)** - Overview of internal guides

## 🎯 Key Features

- ✅ **State Management** - Reactive state updates with automatic UI re-rendering
- ✅ **State Persistence** - Optional localStorage hydration to survive page reloads
- ✅ **Routing** - Hash-based routing with programmatic navigation
- ✅ **DOM Manipulation** - Declarative element creation and manipulation
- ✅ **Component System** - Reusable components with props
- ✅ **Event Handling** - Comprehensive event system with delegation
- ✅ **HTTP Client** - Built-in HTTP request abstraction
- ✅ **Performance** - Optimized rendering with lazy loading support

## 📖 Getting Started

See [`framework/README.md`](framework/README.md) for complete documentation, or check out the examples in [`getting-started-example/`](getting-started-example/).

## 💡 Example Usage

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
    `
  },
  methods: {
    handleClick(event, state, setState) {
      setState({ message: "Button clicked!" });
    }
  }
});
```

---

**Note:** This framework was built as a learning project to understand how front-end frameworks work under the hood.
