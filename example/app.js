import { h, mount } from "../framework/src/index.js";

let count = 0;

function App() {
  return h("div", { class: "card", style: { border: "1px solid #ccc", padding: "12px", borderRadius: "8px" } }, [
    h("p", {}, ["Count: ", String(count)]),
    h(
      "button",
      {
        on: {
          click: (e) => {
            e.preventDefault();
            count++;
            rerender();
          },
        },
      },
      ["+1"]
    ),
  ]);
}

function rerender() {
  const root = document.getElementById("app");
  mount(App(), root);
}

rerender();
