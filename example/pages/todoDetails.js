

import { h } from "../../framework/src/index.js";

export function TodoDetailsPage(store, params) {
  const state = store.get();
  const id = String(params.id || "");

  const todo = (state.todos || []).find((t) => String(t.id) === id);

  if (!todo) {
    return h("div", {}, [
      h("h2", {}, ["Todo details"]),
      h("p", {}, ["Todo not found. Load todos first from the Todos page."]),
      h("a", { href: "#/todos", class: "back-link" }, ["← Back to Todos"]),
    ]);
  }

  return h("div", {}, [
    h("h2", {}, ["Todo details"]),
    h("div", { style: { marginTop: "20px" } }, [
      h("p", { style: { marginBottom: "12px" } }, [
        h("strong", {}, ["ID: "]),
        String(todo.id),
      ]),
      h("p", { style: { marginBottom: "12px" } }, [
        h("strong", {}, ["Title: "]),
        todo.title,
      ]),
      h("p", { style: { marginBottom: "12px" } }, [
        h("strong", {}, ["Status: "]),
        todo.completed ? "Completed" : "Active",
      ]),
    ]),
    h("a", { href: "#/todos", class: "back-link" }, ["← Back to Todos"]),
  ]);
}
