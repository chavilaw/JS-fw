// framework/src/index.js

export { h } from "./core/h.js";
export { mount } from "./core/mount.js";
export { createStore } from "./state/store.js";
export { createHashRouter } from "./router/hashRouter.js";
export { createHTTPClient } from "./http/httpClient.js";

/* In this index file, we are re-exporting key functions from different modules of the framework.
- `h`: The hyperscript function for creating virtual DOM elements.
- `mount`: The function to mount the virtual DOM to the actual DOM.
- `createStore`: The function to create a reactive state store.
- `createHashRouter`: The function to create a hash-based router for SPA navigation.
- `createHTTPClient`: The function to create an HTTP client for making API requests.

This allows users of the framework to import these functionalities directly from the main framework module, 
simplifying the import paths and improving usability. */

