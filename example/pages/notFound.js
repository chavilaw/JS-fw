import { h } from "../../framework/src/index.js";

export function NotFoundPage() {
  return h("div", { class: "not-found" }, [
    h("h2", {}, ["404"]),
    h("p", {}, ["Page not found."]),
    h("a", { href: "#/", class: "back-link" }, ["← Back to Home"]),
  ]);
}


