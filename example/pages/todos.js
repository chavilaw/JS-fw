import { h } from "../../framework/src/index.js";

export function TodosPage(store, api) {
  const state = store.get();

  if (!state.todosLoaded) {
    return h("div", {}, [
      h("h2", {}, ["Todos"]),
      h(
        "button",
        {
          on: {
            click: async (e) => {
              e.preventDefault();

              const todos = await api.get("/todos");

              store.set((s) => ({
                ...s,
                todos,
                todosLoaded: true,
              }));
            },
          },
        },
        ["Load todos from server"]
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
