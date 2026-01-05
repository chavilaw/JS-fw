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

  function normalizePath(path) {
  if (!path) return "/";
  // Remove trailing slash except for "/"
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
  }
  // in dynamic routing, we need to find the best match for the current path
  function matchRoute(pattern, path) {
  // wildcard
  if (pattern === "*") return { params: {} };

  pattern = normalizePath(pattern);
  path = normalizePath(path);

  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};

  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const v = pathParts[i];

    // dynamic param
    if (p.startsWith(":")) {
      const key = p.slice(1);
      params[key] = decodeURIComponent(v);
      continue;
    }

    // static segment must match
    if (p !== v) return null;
  }

  return { params };
  }


  //failsafe normalize URL to include hash if missing
  function normalizeURL() {
    // If we already have a hash route, nothing to normalize
    if (location.hash) return;

    // Take whatever comes after "/example" and treat it as the route path
    const afterExample = location.pathname.split("/example")[1] || "/";
    const path = afterExample.startsWith("/") ? afterExample : "/" + afterExample;

    // Force canonical SPA URL so the base path becomes "/example/"
    // This prevents "/example/about#/todos" style URLs
    location.replace("/example/#" + path);
  }


  function start() {
    normalizeURL();
    window.addEventListener("hashchange", notify);
    notify();
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

  // this is in the dynamic routing to get the best match
  function getMatch() {
  const path = normalizePath(currentPath);

  // Try all patterns except "*" first
  for (const [pattern, component] of Object.entries(routes)) {
    if (pattern === "*") continue;
    const matched = matchRoute(pattern, path);
    if (matched) {
      return { component, params: matched.params, path };
    }
  }

  // Fallback to wildcard if exists
  if (routes["*"]) {
    return { component: routes["*"], params: {}, path };
  }

  return { component: null, params: {}, path };
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
    getMatch,
    attachLinkInterceptor,
  };
}


// hash-based router allows navigation via URL hash changes
// e.g., example.com/#/home, example.com/#/about
// this is useful for this framework because we are specifically looking for a client-side routing solution
//  without server-side routing support. This keeps routing logic inside the framework