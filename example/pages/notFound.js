import { h } from "../../framework/src/index.js";

export function NotFoundPage() {
  return h("div", {}, [
    h("h2", {}, ["404"]),
    h("p", {}, ["Page not found."]),
  ]);
}


