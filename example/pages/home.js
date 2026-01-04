import { h } from "../../framework/src/index.js";

export function HomePage() {
  return h("div", {}, [
    h("h2", {}, ["Home"]),
    h("p", {}, ["This is a single-page application (SPA) powered by our custom framework."]),
  ]);
}
