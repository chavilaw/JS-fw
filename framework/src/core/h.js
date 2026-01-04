
export function h(type, props = {}, ...children) {
  const flatChildren = children
    .flat(Infinity)
    .filter((c) => c !== null && c !== undefined && c !== false && c !== true);

  return {
    type,              
    props: props || {},
    children: flatChildren,
  };
}

// in the framework this is used to create elements
// in other frameworks this is called createElement
// but h is a common convention in many virtual DOM libraries
// this return plain JS object (UI blueprint)
// which will be later converted to real DOM elements in the renderer