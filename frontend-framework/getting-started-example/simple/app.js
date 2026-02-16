MiniFW.createApp({
  root: "#app",
  initialState: {
    message: "Hello, MiniFW!"
  },
  persistState: true,
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
