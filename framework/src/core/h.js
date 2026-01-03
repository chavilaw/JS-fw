
export function h(tag, props, ...children) {
    const flatChildren = children.flat(Infinity).filter((c) => c != null && c !== false && c !== true);

    return {
        type,
        props: props || {},
        children: flatChildren,
    };
}

// in Dot.js this is used to create elements
// in other frameworks this is called createElement
// but h is a common convention in many virtual DOM libraries
// this return plain JS object (UI blueprint)
// which will be later converted to real DOM elements in the renderer