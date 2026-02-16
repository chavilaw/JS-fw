MiniFW.createApp({
  root: "#app",
  initialState: {
    message: "Hello, MiniFW!",
    counter: 0,
    name: ""
  },
  persistState: true,
  routes: {
    "#/": (state) => `
      <nav>
        <a href="#/">Home</a>
        <a href="#/about">About</a>
        <a href="#/counter">Counter</a>
      </nav>
      <h1>${state.message}</h1>
      <p>Welcome to MiniFW! This is the home page.</p>
      <button data-event="click:handleClick">Click Me</button>
    `,
    "#/about": (state) => `
      <nav>
        <a href="#/">Home</a>
        <a href="#/about">About</a>
        <a href="#/counter">Counter</a>
      </nav>
      <h1>About Page</h1>
      <p>This is the about page. MiniFW is a lightweight front-end framework.</p>
      <p>Current message: <strong>${state.message}</strong></p>
      <button data-event="click:goHome">Go Home</button>
    `,
    "#/counter": (state) => `
      <nav>
        <a href="#/">Home</a>
        <a href="#/about">About</a>
        <a href="#/counter">Counter</a>
      </nav>
      <h1>Counter Example</h1>
      <div class="counter">Count: ${state.counter}</div>
      <button data-event="click:increment">Increment</button>
      <button data-event="click:decrement">Decrement</button>
      <button data-event="click:reset">Reset</button>
      <hr style="margin: 2rem 0;">
      <h2>Name Input Example</h2>
      <input 
        type="text" 
        placeholder="Enter your name" 
        data-event="input:updateName"
        value="${state.name}"
      />
      <p>Hello, <strong>${state.name || 'stranger'}</strong>!</p>
    `,
    "#/404": () => `
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button data-event="click:goHome">Go Home</button>
    `
  },
  methods: {
    handleClick(event, state, setState) {
      setState({ message: "Button clicked! " + new Date().toLocaleTimeString() });
    },
    increment(event, state, setState) {
      setState({ counter: state.counter + 1 });
    },
    decrement(event, state, setState) {
      setState({ counter: state.counter - 1 });
    },
    reset(event, state, setState) {
      setState({ counter: 0 });
    },
    updateName(event, state, setState) {
      setState({ name: event.target.value });
    },
    goHome(event, state, setState) {
      MiniFW.navigate("/");
    }
  }
});
