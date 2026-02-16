const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '2rem' },
  title: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    color: '#00d4ff',
    fontWeight: '300',
    letterSpacing: '2px',
    borderBottom: '2px solid #00d4ff',
    paddingBottom: '0.75rem'
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: '#ff4444',
    color: 'white',
    marginBottom: '1rem',
    borderRadius: '4px'
  },
  loading: { color: '#00d4ff', marginBottom: '1rem' },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '0.75rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#e0e0e0',
    fontFamily: "'Courier New', monospace",
    fontSize: '1rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#00d4ff',
    border: 'none',
    color: '#0f0f0f',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.95rem'
  },
  deleteButton: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.85rem',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '1rem'
  },
  todoItem: {
    padding: '1rem',
    marginBottom: '0.5rem',
    backgroundColor: '#1a1a1a',
    borderLeft: '3px solid #00d4ff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  emptyState: { color: '#666', fontStyle: 'italic', marginTop: '2rem' }
};

// Define reusable TodoItem component
function TodoItem(props, state, setState) {
  return MiniFW.createElement('li', { 
    className: 'todo-item',
    style: {
      ...styles.todoItem,
      opacity: props.completed ? 0.6 : 1,
      textDecoration: props.completed ? 'line-through' : 'none'
    }
  },
    MiniFW.createElement('span', { 
      style: { flex: 1, color: '#e0e0e0', cursor: 'pointer' },
      'data-event': 'click:toggleTodo',
      'data-id': props.id
    }, props.text),
    MiniFW.createElement('button', {
      'data-event': 'click:toggleTodo',
      'data-id': props.id,
      'data-prevent-default': 'true',
      style: {
        ...styles.button,
        backgroundColor: props.completed ? '#666' : '#00d4ff',
        padding: '0.4rem 0.8rem',
        fontSize: '0.85rem',
        marginRight: '0.5rem'
      }
    }, props.completed ? 'Mark Active' : 'Mark Done'),
    MiniFW.createElement('button', {
      'data-event': 'click:viewTodo',
      'data-id': props.id,
      'data-prevent-default': 'true',
      style: {
        ...styles.button,
        backgroundColor: '#333',
        padding: '0.4rem 0.8rem',
        fontSize: '0.85rem',
        marginRight: '0.5rem'
      }
    }, 'View'),
    MiniFW.createElement('button', {
      'data-event': 'click:deleteTodo',
      'data-id': props.id,
      'data-prevent-default': 'true',
      style: styles.deleteButton
    }, 'Delete')
  );
}

// Define TodoInput component
function TodoInput(props, state, setState) {
  return MiniFW.createElement('div', { 
    style: { marginBottom: '1rem' }
  },
    MiniFW.createElement('input', {
      id: 'todo-input',
      placeholder: 'New todo',
      'data-event': 'input:updateInput',
      'data-event-keydown': 'keydown:handleKeyDown',
      style: styles.input
    }),
    MiniFW.createElement('button', {
      'data-event': 'click:addTodo',
      'data-prevent-default': 'true',
      style: styles.button
    }, 'Add Todo')
  );
}

MiniFW.createApp({
  root: "#app",
  initialState: { // state management - initial state of the app
    todos: [],
    input: "",
    loading: false,
    error: null,
    filter: "all", // all, active, completed
    viewMode: "list" // list, grid
  },
  // State persistence - automatically saves and restores state from localStorage
  persistState: {
    storageKey: "mini-fw-example-todos",
    whitelist: ["todos", "input", "filter", "viewMode"]
  },

  // http request - load todos from the backend
  async onInit(state, setState) {
    const hasHydratedTodos = Array.isArray(state.todos) && state.todos.length > 0;

    if (hasHydratedTodos) {
      // Already have todos from local persistence; skip network fetch to avoid overwriting
      setState({ loading: false });
      return;
    }

    try {
      setState({ loading: true });
      const todos = await MiniFW.http.get("http://localhost:3000/api/todos");
      setState({ todos, loading: false });
    } catch (error) {
      console.error('Failed to load todos:', error);
      setState({ error: error.message, loading: false });
    }
  },

  routes: {
    "#/": (state, setState) => {
      // Filter todos based on current filter
      const filteredTodos = state.todos.filter(todo => {
        if (state.filter === "active") return !todo.completed;
        if (state.filter === "completed") return todo.completed;
        return true;
      });

      // Use components for better organization
      const todoItems = filteredTodos.map((todo, index) => 
        TodoItem({ text: todo.text, id: todo.id || index, completed: todo.completed }, state, setState)
      );

      return MiniFW.createElement('div', { style: styles.container },
        // Navigation showing current route
        MiniFW.createElement('nav', {
          style: { marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #333' }
        },
          MiniFW.createElement('a', {
            href: '#/',
            'data-event': 'click:navigateHome',
            style: {
              color: state._currentRoute === '#/' ? '#00d4ff' : '#888',
              marginRight: '1rem',
              textDecoration: 'none',
              fontWeight: state._currentRoute === '#/' ? 'bold' : 'normal'
            }
          }, 'Home'),
          MiniFW.createElement('a', {
            href: '#/about',
            'data-event': 'click:navigateAbout',
            style: {
              color: state._currentRoute === '#/about' ? '#00d4ff' : '#888',
              marginRight: '1rem',
              textDecoration: 'none',
              fontWeight: state._currentRoute === '#/about' ? 'bold' : 'normal'
            }
          }, 'About'),
          MiniFW.createElement('span', {
            style: { color: '#666', fontSize: '0.9rem', marginLeft: '1rem' }
          }, `Route: ${state._currentRoute || '#/'}`)
        ),
        
        MiniFW.createElement('h1', { style: styles.title }, 'ToDo App'),
        
        // Show error if any
        state.error ? MiniFW.createElement('div', {
          style: styles.errorBox
        }, `Error: ${state.error}`) : null,
        
        // Show loading state
        state.loading ? MiniFW.createElement('div', {
          style: styles.loading
        }, 'Loading todos...') : null,
        
        // Filter buttons
        MiniFW.createElement('div', {
          style: { marginBottom: '1rem', display: 'flex', gap: '0.5rem' }
        },
          MiniFW.createElement('button', {
            'data-event': 'click:setFilterAll',
            style: {
              ...styles.button,
              backgroundColor: state.filter === 'all' ? '#00d4ff' : '#333',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem'
            }
          }, 'All'),
          MiniFW.createElement('button', {
            'data-event': 'click:setFilterActive',
            style: {
              ...styles.button,
              backgroundColor: state.filter === 'active' ? '#00d4ff' : '#333',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem'
            }
          }, 'Active'),
          MiniFW.createElement('button', {
            'data-event': 'click:setFilterCompleted',
            style: {
              ...styles.button,
              backgroundColor: state.filter === 'completed' ? '#00d4ff' : '#333',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem'
            }
          }, 'Completed')
        ),
        
        // Todo input component
        TodoInput({}, state, setState),
        
        // Todo list
        MiniFW.createElement('ul', {
          style: { listStyle: 'none', padding: 0 }
        }, ...todoItems),
        
        // Empty state
        filteredTodos.length === 0 && !state.loading ? 
          MiniFW.createElement('p', {
            style: styles.emptyState
          }, state.filter === 'all' ? 'No todos yet. Add one above!' : `No ${state.filter} todos.`) : null,
        
        // Stats
        state.todos.length > 0 ? MiniFW.createElement('div', {
          style: { marginTop: '2rem', padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '4px', fontSize: '0.9rem', color: '#888' }
        },
          `Total: ${state.todos.length} | `,
          `Active: ${state.todos.filter(t => !t.completed).length} | `,
          `Completed: ${state.todos.filter(t => t.completed).length}`
        ) : null
      );
    },
    
    "#/about": (state, setState) => {
      return MiniFW.createElement('div', { style: styles.container },
        // Navigation
        MiniFW.createElement('nav', {
          style: { marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #333' }
        },
          MiniFW.createElement('a', {
            href: '#/',
            'data-event': 'click:navigateHome',
            style: {
              color: '#888',
              marginRight: '1rem',
              textDecoration: 'none'
            }
          }, 'Home'),
          MiniFW.createElement('a', {
            href: '#/about',
            'data-event': 'click:navigateAbout',
            style: {
              color: '#00d4ff',
              marginRight: '1rem',
              textDecoration: 'none',
              fontWeight: 'bold'
            }
          }, 'About'),
          MiniFW.createElement('span', {
            style: { color: '#666', fontSize: '0.9rem', marginLeft: '1rem' }
          }, `Route: ${state._currentRoute || '#/about'}`)
        ),
        
        MiniFW.createElement('h1', { style: styles.title }, 'About This App'),
        MiniFW.createElement('div', {
          style: { lineHeight: '1.8', color: '#e0e0e0' }
        },
          MiniFW.createElement('p', null, 'This Todo app demonstrates all features of the MiniFW framework:'),
          MiniFW.createElement('ul', {
            style: { marginLeft: '2rem', marginTop: '1rem' }
          },
            MiniFW.createElement('li', null, '✅ State Management - Reactive state updates'),
            MiniFW.createElement('li', null, '✅ State Persistence - Automatic localStorage sync'),
            MiniFW.createElement('li', null, '✅ Routing - Hash-based navigation with route state'),
            MiniFW.createElement('li', null, '✅ Components - Reusable UI components'),
            MiniFW.createElement('li', null, '✅ Event Handling - Multiple event types'),
            MiniFW.createElement('li', null, '✅ HTTP Client - API integration'),
            MiniFW.createElement('li', null, '✅ DOM Manipulation - Declarative element creation'),
            MiniFW.createElement('li', null, '✅ Style Manipulation - Dynamic styling')
          ),
          MiniFW.createElement('p', {
            style: { marginTop: '2rem', padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '4px' }
          }, `Current route: ${state._currentRoute || '#/about'}`),
          MiniFW.createElement('button', {
            'data-event': 'click:goHome',
            style: { ...styles.button, marginTop: '1rem' }
          }, 'Go Home')
        )
      );
    },
    
    "#/todo/:id": (state, setState) => {
      // Route with parameters - demonstrates route params
      const params = state._routeParams || {};
      const todoId = parseInt(params.id);
      const todo = state.todos.find(t => (t.id || 0) === todoId);
      
      return MiniFW.createElement('div', { style: styles.container },
        MiniFW.createElement('nav', {
          style: { marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #333' }
        },
          MiniFW.createElement('a', {
            href: '#/',
            'data-event': 'click:navigateHome',
            style: { color: '#888', marginRight: '1rem', textDecoration: 'none' }
          }, '← Back to Home')
        ),
        
        todo ? MiniFW.createElement('div', null,
          MiniFW.createElement('h1', { style: styles.title }, `Todo #${todoId}`),
          MiniFW.createElement('div', {
            style: { padding: '1.5rem', backgroundColor: '#1a1a1a', borderRadius: '4px', marginBottom: '1rem' }
          },
            MiniFW.createElement('p', {
              style: { fontSize: '1.2rem', marginBottom: '1rem', color: '#e0e0e0' }
            }, todo.text),
            MiniFW.createElement('p', {
              style: { color: '#888', fontSize: '0.9rem' }
            }, `Status: ${todo.completed ? 'Completed' : 'Active'}`)
          ),
          MiniFW.createElement('p', {
            style: { color: '#666', fontSize: '0.85rem' }
          }, `Route params: ${JSON.stringify(state._routeParams)}`)
        ) : MiniFW.createElement('div', null,
          MiniFW.createElement('h1', { style: styles.title }, 'Todo Not Found'),
          MiniFW.createElement('p', { style: { color: '#888' } }, `No todo found with ID: ${todoId}`)
        )
      );
    },
    
    "#/404": (state, setState) => {
      return MiniFW.createElement('div', {
        style: { textAlign: 'center', padding: '2rem' }
      },
        MiniFW.createElement('h1', { style: { color: '#00d4ff' } }, '404 - Page Not Found'),
        MiniFW.createElement('p', {
          style: { color: '#888', marginBottom: '2rem' }
        }, `The route "${state._currentRoute || 'unknown'}" was not found.`),
        MiniFW.createElement('button', {
          'data-event': 'click:goHome',
          style: styles.button
        }, 'Go Home')
      );
    }
  },

  methods: (() => {
    // Create a closure to allow methods to reference each other
    const methods = {
      updateInput(event, state, setState) {
        setState({ input: event.target.value }); // Update the input state with the new value
      },

      handleKeyDown(event, state, setState) {
        // Handle Enter key to add todo
        if (event.key === 'Enter') {
          event.preventDefault();
          methods.addTodo(event, state, setState);
        }
      },

      async addTodo(event, state, setState) {
        const input = document.querySelector("#todo-input");
        if (!input || !input.value.trim()) return;

        try {
          setState({ loading: true, error: null });
          const newTodo = {
            text: input.value.trim(),
            completed: false,
            id: state.todos.length > 0 ? Math.max(...state.todos.map(t => t.id || 0)) + 1 : 0
          };
          const todos = await MiniFW.http.post("http://localhost:3000/api/todos", newTodo);
          
          input.value = "";
          input.focus();
          setState({ todos, input: "", loading: false }); // Update the state with the new todos and reset the input and loading state
        } catch (error) {
          console.error('Failed to add todo:', error);
          setState({ error: `Failed to add todo: ${error.message}`, loading: false });
        }
      },

    async toggleTodo(event, state, setState) {
      const id = parseInt(event.target.dataset.id);
      if (isNaN(id)) return;

      try {
        const todo = state.todos.find(t => (t.id || 0) === id);
        if (!todo) return;

        const updatedTodo = { ...todo, completed: !todo.completed };
        const todos = await MiniFW.http.put(`http://localhost:3000/api/todos/${id}`, updatedTodo);
        setState({ todos, loading: false });
      } catch (error) {
        console.error('Failed to toggle todo:', error);
        // Fallback to local update if API fails
        const todos = state.todos.map(t => 
          (t.id || 0) === id ? { ...t, completed: !t.completed } : t
        );
        setState({ todos, error: `Failed to update todo: ${error.message}` });
      }
    },

    viewTodo(event, state, setState) {
      const id = parseInt(event.target.dataset.id);
      if (isNaN(id)) return;
      MiniFW.navigate(`/todo/${id}`);
    },

    async deleteTodo(event, state, setState) {
      const id = parseInt(event.target.dataset.id);
      if (isNaN(id)) return;

      try {
        setState({ loading: true, error: null }); 
        const todos = await MiniFW.http.delete(`http://localhost:3000/api/todos/${id}`);
        setState({ todos, loading: false });
      } catch (error) {
        console.error('Failed to delete todo:', error);
        setState({ error: `Failed to delete todo: ${error.message}`, loading: false });
      }
    },

    setFilterAll(event, state, setState) {
      setState({ filter: 'all' });
    },

    setFilterActive(event, state, setState) {
      setState({ filter: 'active' });
    },

    setFilterCompleted(event, state, setState) {
      setState({ filter: 'completed' });
    },

    navigateHome(event, state, setState) {
      event.preventDefault();
      MiniFW.navigate("/");
    },

    navigateAbout(event, state, setState) {
      event.preventDefault();
      MiniFW.navigate("/about");
    },

    goHome(event, state, setState) {
      MiniFW.navigate("/");
    }
    };
    return methods;
  })(),
});
