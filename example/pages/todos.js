import { h } from "../../framework/src/index.js";

export function TodosPage(store) {
  const state = store.get();

  // If not loaded, show a button to load from server
  if (!state.todosLoaded) {
    return h("div", {}, [
      h("h2", {}, ["Todos"]),
      h("p", {}, ["Todos not loaded yet."]),
      h(
        "button",
        {
          on: {
            click: async (e) => {
              e.preventDefault();

              const res = await fetch("/api/todos");
              const data = await res.json();

              store.set((s) => ({
                ...s,
                todos: data,
                todosLoaded: true,
              }));
            },
          },
        },
        ["Load todos from API"]
      ),
    ]);
  }

  const todos = state.todos || [];

  return h("div", {}, [
    h("h2", {}, ["Todos"]),
    h("ul", {}, todos.map((t) => h("li", {}, [t.title]))),
    h(
      "button",
      {
        style: { marginTop: "12px" },
        on: {
          click: (e) => {
            e.preventDefault();
            store.set((s) => ({ ...s, todosLoaded: false }));
          },
        },
      },
      ["Clear loaded todos"]
    ),
  ]);
}
