import { h } from "../../framework/src/index.js";

// local draft text (so typing does NOT rerender on every character)
let draftTitle = "";

function makeId() {
  // simple ID: time + random
  return Date.now() + Math.floor(Math.random() * 1000);
}

export function TodosPage(store) {
  const state = store.get();
  const todos = state.todos || [];

  return h("div", {}, [
    h("h2", {}, ["Todos"]),

    // user input + form submission
    h(
      "form",
      {
        style: { marginBottom: "12px" },
        on: {
          submit: (e) => {
            e.preventDefault();
            e.stopPropagation();

            const title = (draftTitle || "").trim();
            if (!title) return;

            const newTodo = {
              id: makeId(),
              title,
              completed: false,
            };

            store.set((s) => ({
              ...s,
              todos: [newTodo, ...(s.todos || [])],
            }));

            draftTitle = "";
          },
        },
      },
      [
        h("input", {
          type: "text",
          placeholder: "Add a new todo",
          defaultValue: draftTitle,
          style: { padding: "6px", minWidth: "260px" },
          on: {
            input: (e) => {
              draftTitle = e.target.value;
            },
          },
        }),
        h(
          "button",
          { type: "submit", style: { marginLeft: "8px" } },
          ["Add"]
        ),
      ]
    ),

    // empty state
    todos.length === 0
      ? h("p", {}, ["No todos yet. Add one above!"])
      : h(
          "ul",
          {},
          todos.map((t) =>
            h("li", { style: { marginBottom: "6px" } }, [
              // link to details page if you have dynamic routes
              h("a", { href: "#/todos/" + t.id }, [t.title]),

              // toggle complete
              h(
                "button",
                {
                  style: { marginLeft: "8px" },
                  on: {
                    click: (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      store.set((s) => ({
                        ...s,
                        todos: s.todos.map((x) =>
                          x.id === t.id ? { ...x, completed: !x.completed } : x
                        ),
                      }));
                    },
                  },
                },
                [t.completed ? "Mark active" : "Mark done"]
              ),

              // delete
              h(
                "button",
                {
                  style: { marginLeft: "8px" },
                  on: {
                    click: (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      store.set((s) => ({
                        ...s,
                        todos: s.todos.filter((x) => x.id !== t.id),
                      }));
                    },
                  },
                },
                ["Delete"]
              ),
            ])
          )
        ),
  ]);
}
