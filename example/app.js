import { h, mount, createStore } from "../framework/src/index.js";

const store = createStore({ count: 0 });

function App() {
  const state = store.get();

  return h("div", {}, [
    h("p", {}, ["Count: ", String(state.count)]),
    h(
      "button",
      {
        on: {
          click: (e) => {
            e.preventDefault();
            store.set((s) => ({ ...s, count: s.count + 1 }));
          },
        },
      },
      ["+1"]
    ),
  ]);
}

function rerender() {
  mount(App(), document.getElementById("app"));
}

store.subscribe(rerender);
rerender();
