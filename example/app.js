import { h, mount, createStore, createHashRouter, createHTTPClient } from "../framework/src/index.js";
import { HomePage } from "./pages/home.js";
import { AboutPage } from "./pages/about.js";
import { NotFoundPage } from "./pages/notFound.js";
import { TodosPage } from "./pages/todos.js";
import { TodoDetailsPage } from "./pages/todoDetails.js";



// Persisted app state 
const store = createStore(
  {
    count: 0,
    todos: [],
  },
  { persistKey: "example-state" }
);

const api = createHTTPClient({
  baseURL: "/api",
});

// Router: path -> component factory
const router = createHashRouter({
  "/": () => HomePage(),
  "/about": () => AboutPage(),
  "/todos": () => TodosPage(store),
  "/todos/:id": ({ params }) => TodoDetailsPage(store, params),
  "*": () => NotFoundPage(),
});

function Nav() {
  return h("nav", {}, [
    h("a", { href: "#/" }, ["Home"]),
    h("a", { href: "#/todos" }, ["Todos"]),
    h("a", { href: "#/about" }, ["About"]),
  ]);
}

function CounterCard() {
  const state = store.get();

  return h("div", { class: "card" }, [
    h("p", {}, ["Simple counter to demonstrate functionality"]),
    h("p", {}, ["Count: ", String(state.count)]),
    h(
      "button",
      {
        on: {
          click: (e) => {
            e.preventDefault();
            store.set((s) => ({ ...s, count: s.count + 1 }));
          },
        },
      },
      ["+1"]
    ),
    h(
      "button",
      {
        class: "secondary",
        style: { marginLeft: "8px" },
        on: {
          click: (e) => {
            e.preventDefault();
            store.set((s) => ({ ...s, count: 0 }));
          },
        },
      },
      ["Reset"]
    ),
  ]);
}

function App() {
  const match = router.getMatch();
  const PageFactory = match.component;

  return h("div", {}, [
    Nav(),
    CounterCard(),
    h("div", { class: "page-content" }, [
      PageFactory ? PageFactory({ params: match.params }) : NotFoundPage(),
    ]),
  ]);
}

function rerender() {
  mount(App(), document.getElementById("app"));
}

// Re-render on state change
store.subscribe(rerender);

// Re-render on route change
router.subscribe(rerender);
router.start();

// Attach link interception once (framework-controlled navigation)
router.attachLinkInterceptor(document.getElementById("app"));

// Initial render
rerender();
