import { h } from "../../framework/src/index.js";

export function AboutPage() {
  return h("div", {}, [
    h("h2", {}, ["About"]),
    h("p", {}, ["Hash routing, delegated events, reactive state, and persistence."]),
  ]);
}
