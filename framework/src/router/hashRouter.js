// framework/src/router/hashRouter.js

export function createHashRouter(routes) {
  let currentPath = getPath();
  const listeners = new Set();

  function getPath() {
    return location.hash.replace("#", "") || "/";
  }

  function notify() {
    currentPath = getPath();
    listeners.forEach((fn) => fn(currentPath));
  }

  function start() {
    window.addEventListener("hashchange", notify);
    notify(); // initial
  }

  function navigate(path) {
    if (!path.startsWith("/")) path = "/" + path;
    if (location.hash === "#" + path) return;
    location.hash = path;
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function getComponent() {
    return routes[currentPath] || routes["*"] || null;
  }

  // Framework-controlled navigation: intercept internal hash links
  function attachLinkInterceptor(rootEl) {
    rootEl.addEventListener("click", (e) => {
      const anchor = e.target instanceof Element ? e.target.closest("a") : null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("#/")) return;

      e.preventDefault();
      e.stopPropagation();

      navigate(href.slice(1)); // "#/todos" -> "/todos"
    });
  }

  return {
    start,
    navigate,
    subscribe,
    getPath: () => currentPath,
    getComponent,
    attachLinkInterceptor,
  };
}


// hash-based router allows navigation via URL hash changes
// e.g., example.com/#/home, example.com/#/about
// this is useful for this framework because we are specifically looking for a client-side routing solution
//  without server-side routing support. This keeps routing logic inside the framework rather than relying on the browser.