# How to Implement Your App with MiniFW

**For Reviewers:** This guide will help you implement your application using the MiniFW framework.

For detailed API documentation, see [`framework/README.md`](framework/README.md).

## 📋 Quick Overview

MiniFW uses a simple pattern:
1. **Define state** - What data your app needs
2. **Define routes** - What pages/views to show
3. **Define methods** - What happens when users interact
4. **Render views** - Return HTML strings or DOM elements

---

## 🚀 Implementation Workflow

### 1. Set Up Project

**Copy framework:**
```bash
cp framework/mini-fw.js your-project/js/
```

**Create HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  <script src="js/mini-fw.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

**Create app skeleton:**
```javascript
MiniFW.createApp({
  root: "#app",
  initialState: {},
  routes: {},
  methods: {}
});
```

### 2. Plan Your State

Think about what data your app needs:
- User data (user, isLoggedIn)
- App data (items, posts, todos)
- UI state (loading, error, currentView)
- Form data (input values, selections)

### 3. Create Routes

Each route is a function that returns the view:
```javascript
routes: {
  "#/": (state) => `<h1>Home</h1>`,
  "#/about": (state) => `<h1>About</h1>`,
  "#/404": () => `<h1>Not Found</h1>`
}
```

### 4. Add Methods

Methods handle user interactions:
```javascript
methods: {
  handleClick(event, state, setState) {
    setState({ clicked: true });
  }
}
```

### 5. Bind Events

Use `data-event` attributes:
```html
<button data-event="click:handleClick">Click Me</button>
```

### 6. Add Components (if needed)

Create reusable components:
```javascript
function ItemCard(props, state, setState) {
  return MiniFW.createElement('div', null, props.title);
}
```

### 7. Add API Calls (if needed)

Use the HTTP client:
```javascript
async loadData(event, state, setState) {
  const data = await MiniFW.http.get('/api/data');
  setState({ data });
}
```

---

## 🔄 Converting Existing Code

### From Vanilla JavaScript

**Before:**
```javascript
let items = [];
const button = document.querySelector('#load-btn');
button.addEventListener('click', async () => {
  const response = await fetch('/api/items');
  items = await response.json();
  render();
});

function render() {
  const container = document.querySelector('#container');
  container.innerHTML = items.map(item => `<div>${item.name}</div>`).join('');
}
```

**After:**
```javascript
MiniFW.createApp({
  root: "#app",
  initialState: { items: [] },
  routes: {
    "#/": (state) => `
      <button data-event="click:loadItems">Load Items</button>
      <div id="container">
        ${state.items.map(item => `<div>${item.name}</div>`).join('')}
      </div>
    `
  },
  methods: {
    async loadItems(event, state, setState) {
      const items = await MiniFW.http.get('/api/items');
      setState({ items }); // UI updates automatically!
    }
  }
});
```

**Key Changes:**
- Move data to `initialState`
- Move event handlers to `methods`
- Move rendering to `routes`
- Use `setState` instead of manual DOM updates

### From jQuery

**Before:**
```javascript
$('#button').on('click', function() {
  $.get('/api/data', function(data) {
    $('#container').html(data.map(item => `<div>${item}</div>`));
  });
});
```

**After:**
```javascript
methods: {
  async loadData(event, state, setState) {
    const data = await MiniFW.http.get('/api/data');
    setState({ items: data });
  }
}

routes: {
  "#/": (state) => `
    <button data-event="click:loadData">Load</button>
    <div id="container">
      ${state.items.map(item => `<div>${item}</div>`).join('')}
    </div>
  `
}
```

### From React/Vue (Conceptual)

**React:**
```jsx
function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**MiniFW:**
```javascript
MiniFW.createApp({
  initialState: { count: 0 },
  routes: {
    "#/": (state) => `
      <button data-event="click:increment">${state.count}</button>
    `
  },
  methods: {
    increment(event, state, setState) {
      setState({ count: state.count + 1 });
    }
  }
});
```

---

## 📝 Implementation Checklist

Use this checklist when implementing your app:

- [ ] Framework file included in HTML
- [ ] Root element (`#app`) exists
- [ ] `MiniFW.createApp()` called
- [ ] Initial state defined (all data your app needs)
- [ ] At least one route defined
- [ ] Methods defined for all user interactions
- [ ] Events bound with `data-event` attributes
- [ ] API calls use `MiniFW.http` (if needed)
- [ ] Navigation uses `MiniFW.navigate()` (if needed)
- [ ] Components created for reusable UI (if needed)
- [ ] Error handling implemented (try/catch for async)
- [ ] Loading states handled (show feedback during async ops)
- [ ] 404 route defined (fallback for unknown routes)

---

## 🎯 Common Implementation Patterns

### Pattern 1: Loading States
```javascript
methods: {
  async loadData(event, state, setState) {
    setState({ loading: true });
    try {
      const data = await MiniFW.http.get('/api/data');
      setState({ data, loading: false });
    } catch (error) {
      setState({ error: error.message, loading: false });
    }
  }
}

routes: {
  "#/": (state) => {
    if (state.loading) return '<div>Loading...</div>';
    if (state.error) return `<div>Error: ${state.error}</div>`;
    return `<div>${state.data}</div>`;
  }
}
```

### Pattern 2: Form Handling
```javascript
methods: {
  handleSubmit(event, state, setState) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    // Process data...
  }
}

routes: {
  "#/": (state) => `
    <form data-event="submit:handleSubmit" data-prevent-default="true">
      <input name="email" type="email" />
      <button type="submit">Submit</button>
    </form>
  `
}
```

### Pattern 3: Conditional Rendering
```javascript
routes: {
  "#/": (state) => `
    ${state.isLoggedIn 
      ? `<div>Welcome, ${state.user.name}!</div>`
      : `<div>Please log in</div>`
    }
  `
}
```

### Pattern 4: Lists with Components
```javascript
function ItemCard(props, state, setState) {
  return MiniFW.createElement('div', { className: 'card' },
    MiniFW.createElement('h2', null, props.title),
    MiniFW.createElement('button', {
      'data-event': 'click:deleteItem',
      'data-id': props.id
    }, 'Delete')
  );
}

routes: {
  "#/": (state) => {
    const items = state.items.map(item => 
      ItemCard({ id: item.id, title: item.title }, state, setState)
    );
    return MiniFW.createElement('div', null, ...items);
  }
}
```

---

## 🆘 Quick Troubleshooting

**Nothing renders:**
- Check browser console for errors
- Verify framework script is loaded
- Ensure root element exists: `<div id="app"></div>`

**Events don't work:**
- Check `data-event` format: `"click:methodName"`
- Verify method exists in `methods` object
- Check browser console for errors

**State doesn't update:**
- Always use `setState()`, never mutate state directly
- Check that `setState` is actually being called

**Routes don't work:**
- Routes must start with `#/`
- Check hash in URL: `http://localhost:8000/#/`
- Ensure route key matches exactly (including `#`)

**API calls fail:**
- Check CORS settings on server
- Verify URL is correct
- Check Network tab in browser dev tools

For more troubleshooting help, see `REVIEW_GUIDE.md`.

---

## 📚 Next Steps

1. **Start Simple**: Begin with one route and one method
2. **Add Features Gradually**: Add routes, methods, and components one at a time
3. **Test Frequently**: Check browser console for errors
4. **Reference Examples**: 
   - `getting-started-example/` - Simple examples
   - `example/frontend/app.js` - Complete Todo app
5. **Read Documentation**: 
   - `framework/README.md` - Full API reference
   - `QUICK_REFERENCE.md` - Quick code patterns

---

## 💡 Implementation Tips

- **Keep state flat**: Avoid deeply nested state objects
- **Use components**: Break UI into reusable pieces
- **Handle errors**: Always wrap async operations in try/catch
- **Show loading states**: Give users feedback during async operations
- **Test routes**: Navigate between pages to ensure routing works
- **Use browser dev tools**: Console and Network tabs are your friends

Good luck implementing your app! 🚀
