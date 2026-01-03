import { pipeline } from "stream";

function setProperty(el, props) {
    for (const [key, value] of Object.entries(props)) {
        if (key === "style" && value && typeof value === "object") {
            Object.assign(el.style, value);
            continue
        }

        if (key === "class" || key === "className") {
        el.className = value ?? "";
        continue;
        }

        // OOPS this is temporarty have to change to satifyi the "not just addEventlistener"
        if (key === "on" && typeof value === "object") {
        for (const [eventName, handler] of Object.entries(value)) {
            if (typeof handler === "function") {
            el.addEventListener(eventName, handler);
            }
        }
            continue;
        }

        // boolean attributes
        if (typeof value === "boolean") {
        if (value) {
            el.setAttribute(key, "");
        } else {
            el.removeAttribute(key);
        }
        continue;
        }   


        // normal attributes
        if (value != null && value !== undefined) {
            el.setAttribute(key, String(value));
        }
    }
}

function createDomNode(vnode) {
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
    return createDomNode(rendered);
  }

  // Element: type is a string like 'div'
  const el = document.createElement(vnode.type);

  setProperty(el, vnode.props || {});

  for (const child of vnode.children || []) {
    el.appendChild(createDomNode(child));
  }

  return el;
}

// mount(vnode, container): renders vnode inside container
export function mount(vnode, container) {
  if (!(container instanceof Element)) {
    throw new Error("mount(): container must be a DOM Element");
  }

  // Simple render strategy for now: clear and re-render
  container.innerHTML = "";
  container.appendChild(createDomNode(vnode));
}