import { ensureRootListener, registerEventHandler } from "../events/delegation.js";

function setProps(el, props, rootEl) {
  for (const [key, value] of Object.entries(props)) {
    if (key === "style" && value && typeof value === "object") {
        Object.assign(el.style, value);
        continue
    }

    if (key === "class" || key === "className") {
    el.className = value ?? "";
    continue;
    }

    // here we use the createFrameworkEvent function from delegation.js instead of just addEventlistener
    if (key === "on" && value && typeof value === "object") {
      // delegated events live on the ROOT container and not each element
      for (const [eventName, handler] of Object.entries(value)) {
        if (typeof handler === "function") {
        const id = registerEventHandler(handler);
        el.setAttribute("data-dot-on" + eventName, id);
        ensureRootListener(rootEl, eventName);
        }
      }
      continue;
    }

    if (typeof value === "boolean") {
      if (value) el.setAttribute(key, "");
      else el.removeAttribute(key);
      continue;
    }

    if (value !== undefined && value !== null) {
      el.setAttribute(key, String(value));
    }
  }
}

// here we pass rootEl and use it to setup event delegation
// vnode: virtual DOM node to convert to real DOM 
function createDomNode(vnode, rootEl) {
  // Text nodes
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  // Safety: if vnode is missing, render empty text
  if (!vnode) {
    return document.createTextNode("");
  }

  // Component: type is a function
  if (typeof vnode.type === "function") {
    const rendered = vnode.type(vnode.props || {});
    return createDomNode(rendered, rootEl);
  }

  
  const el = document.createElement(vnode.type);

  setProps(el, vnode.props || {}, rootEl);

  for (const child of vnode.children || []) {
    el.appendChild(createDomNode(child, rootEl));
  }

  return el;
}

// mount(vnode, container): renders vnode inside container
export function mount(vnode, container) {
  if (!(container instanceof Element)) {
    throw new Error("mount(): container must be a DOM Element");
  }

  // Render strategy: clear container and append new content
  container.innerHTML = "";
  container.appendChild(createDomNode(vnode, container));
}