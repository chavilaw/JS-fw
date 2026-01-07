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
        class: "form-group",
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
          on: {
            input: (e) => {
              draftTitle = e.target.value;
            },
          },
        }),
        h("button", { type: "submit" }, ["Add"]),
      ]
    ),

    // empty state
    todos.length === 0
      ? h("div", { class: "empty-state" }, [
          h("p", {}, ["No todos yet. Add one above!"]),
        ])
      : h(
          "ul",
          { class: "todo-list" },
          todos.map((t) =>
            h(
              "li",
              {
                class: "todo-item" + (t.completed ? " completed" : ""),
              },
              [
                h("div", { class: "todo-title" }, [
                  h("a", { href: "#/todos/" + t.id }, [t.title]),
                ]),
                h("div", { class: "todo-actions" }, [
                  // toggle complete
                  h(
                    "button",
                    {
                      class: (t.completed ? "secondary" : "success") + " small",
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
                      class: "danger small",
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
                ]),
              ]
            )
          )
        ),
  ]);
}
