# MiniFW Example Project - Todo Application

This is a complete example application demonstrating all features of the MiniFW framework.

## Features Demonstrated

- ✅ **State Management**: Global state with reactive updates
- ✅ **Routing**: Hash-based routing with 404 handling
- ✅ **Components**: Reusable TodoItem and TodoInput components
- ✅ **DOM Manipulation**: Using createElement API
- ✅ **Event Handling**: Multiple event types (click, input, keydown)
- ✅ **HTTP Requests**: Using MiniFW.http for API calls
- ✅ **Error Handling**: Try/catch with user-friendly error messages
- ✅ **Loading States**: UI feedback during async operations

## Project Structure

```
example/
├── backend/
│   ├── server.js          # Express.js backend API
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── index.html         # HTML entry point
│   ├── app.js             # Application code
│   └── style.css          # Styling (optional, using inline styles in app.js)
└── README.md              # This file
```

## Requirements

- Node.js (v18 or newer)
- npm

## How to Run

### 1. Start the Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd example/backend
npm install
node server.js
```

The backend will start on `http://localhost:3000`

### 2. Start the Frontend

The backend server also serves the frontend files. Simply open your browser and navigate to:

```
http://localhost:3000
```

Or if you prefer a separate frontend server, you can use any static file server:

```bash
# Using Python
cd example/frontend
python3 -m http.server 8080

# Using Node.js http-server
npx http-server example/frontend -p 8080
```

Then open `http://localhost:8080` in your browser.

## API Endpoints

The backend provides the following REST API:

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
  - Body: `{ "text": "Todo text" }`
- `DELETE /api/todos/:id` - Delete a todo by index

## Application Features

### Adding Todos

1. Type a todo in the input field
2. Click "Add Todo" or press Enter
3. The todo is saved to the backend and appears in the list

### Deleting Todos

1. Click the "Delete" button next to any todo
2. The todo is removed from the backend and the UI updates

### Error Handling

If the backend is unavailable or an error occurs:
- Error messages are displayed to the user
- The application continues to function
- Loading states provide visual feedback

## Code Highlights

### Component Definition

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
```

### HTTP Requests

```javascript
// GET request
const todos = await MiniFW.http.get("http://localhost:3000/api/todos");

// POST request
const todos = await MiniFW.http.post("http://localhost:3000/api/todos", {
  text: input.value.trim()
});

// DELETE request
const todos = await MiniFW.http.delete(`http://localhost:3000/api/todos/${id}`);
```

### Event Handling

```javascript
methods: {
  updateInput(event, state, setState) {
    setState({ input: event.target.value });
  },
  
  handleKeyDown(event, state, setState) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTodo(event, state, setState);
    }
  }
}
```

### State Management

```javascript
// Update state
setState({ todos, loading: false });

// Access state in views
routes: {
  "#/": (state) => {
    // state.todos, state.loading, etc. are available
  }
}
```

## Framework Features Used

This example demonstrates:

1. **createElement API**: Building UI declaratively
2. **Components**: Reusable, composable UI pieces
3. **State Management**: Reactive state updates
4. **Routing**: Hash-based navigation
5. **Event System**: Multiple event types with proper handling
6. **HTTP Client**: Built-in HTTP abstraction
7. **Error Handling**: Graceful error management
8. **Loading States**: User feedback during operations

### Optional Persistence Toggle

The Todo app ships with persistence disabled by default, but the code needed is already in place. To enable local persistence, remove the block comment that wraps the `persistState` option inside [example/frontend/app.js](example/frontend/app.js#L100-L108). Replacing:

```javascript
  // Remove the comment here to activate persistence
  /* persistState: {
    storageKey: "mini-fw-example-todos",
    whitelist: ["todos", "input"]
  },
  */
```

hydrates previously saved todos from `localStorage` and keeps new changes in sync. Keeping the lines commented restores the original stateless behavior.

## Troubleshooting

### Backend not starting

- Ensure port 3000 is not in use
- Check that Node.js is installed: `node --version`
- Install dependencies: `cd backend && npm install`

### CORS errors

The backend includes CORS middleware. If you see CORS errors:
- Ensure the backend is running
- Check that you're accessing from the correct origin

### Todos not saving

- Check browser console for errors
- Verify backend is running on port 3000
- Check network tab in browser dev tools

## Next Steps

Try extending this example:

1. Add todo editing functionality
2. Add todo completion status
3. Add filtering (all/active/completed)
4. Add local storage persistence
5. Add route parameters (e.g., `#/todo/:id`)
6. Implement lazy rendering for large todo lists

## Learn More

See the framework documentation in `framework/README.md` for complete API reference and examples.
