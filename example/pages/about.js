import { h } from "../../framework/src/index.js";

export function AboutPage() {
  return h("div", {}, [
    h("h2", {}, ["About"]),
    h("p", {}, [
      "This example demonstrates the core features of the Dot.js framework:",
    ]),
    h("ul", { style: { paddingLeft: "20px", color: "var(--text-secondary)" } }, [
      h("li", {}, ["Hash-based routing for navigation"]),
      h("li", {}, ["Event delegation for efficient event handling"]),
      h("li", {}, ["Reactive state management with persistence"]),
      h("li", {}, ["HTTP client for API requests"]),
      h("li", {}, ["Component-based architecture"]),
    ]),
  ]);
}
