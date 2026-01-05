

import { h } from "../../framework/src/index.js";

export function TodoDetailsPage(store, params) {
  const state = store.get();
  const id = String(params.id || "");

  const todo = (state.todos || []).find((t) => String(t.id) === id);

  if (!todo) {
    return h("div", {}, [
      h("h2", {}, ["Todo details"]),
      h("p", {}, ["Todo not found. Load todos first from the Todos page."]),
      h("a", { href: "#/todos" }, ["Back to Todos"]),
    ]);
  }

  return h("div", {}, [
    h("h2", {}, ["Todo details"]),
    h("p", {}, ["ID: " + String(todo.id)]),
    h("p", {}, ["Title: " + todo.title]),
    h("a", { href: "#/todos" }, ["Back to Todos"]),
  ]);
}
