// framework/src/events/delegation.js

let nextHandlerId = 1;

// handler store to keep track of event handlers
const handlerStore = new Map();

// root element to attach delegated event listeners
const rootListeners = new WeakMap();

// register an event handler and return its unique ID
// this is done to avoid attaching multiple listeners to individual elements
export function registerEventHandler(fn) {
    const id = String(nextHandlerId++);
    handlerStore.set(id, fn);
    return id;
}

// ensure root listener for event type exists
// this is done to delegate events from child elements to the root
export function ensureRootListener(rootEl, eventType) {
    let perRoot = rootListeners.get(rootEl);
    if (!perRoot) {
        perRoot = new Map();
        rootListeners.set(rootEl, perRoot);
    }

    // if listener already exists, do nothing
    if (perRoot.has(eventType)) return;

    // create and attach the listener to delegate events
    const listener = (nativeEvent) => {
        dispatchDelegatedEvent(rootEl, eventType, nativeEvent);
    };

    // finally here we attach the listener
    rootEl.addEventListener(eventType, listener);
    perRoot.set(eventType, listener);
}


// dispatch the event to the correct handler based on data-handler-id
/* this function is called when a delegated event is triggered and it looks
data-dot-onclick= "handlerId" this is what makes the difference of it being just addEventlistener*/

function dispatchDelegatedEvent(rootEl, eventType, nativeEvent) {
    const attrName = "data-dot-on" + eventType;

    // framewoerk event wrapper to control stop + prevent 
    const e = createFrameworkEvent(nativeEvent);

    let el = nativeEvent.target;

    // from the target element, bubble up to find the handler
    // meaning we look for the attribute in the target and its parents
    while (el && el instanceof Element) {
        // only Elements have getAttribute
        if (el instanceof Element) {
            const handlerId = el.getAttribute(attrName);
            if (handlerId) {
                const handler = handlerStore.get(handlerId);
                if (typeof handler === "function") {
                    handler(e);
                    if (e._stopped) return; //here i the framework level stop propagation
                }
            }    
        }
    
        if (el === rootEl) break;
        el = el.parentElement;
    }
}


function createFrameworkEvent(nativeEvent) {
    // here wrap native event to add stopPropagation and preventDefault control
    return {
        nativeEvent,
        target : nativeEvent.target,
        currentTarget : nativeEvent.currentTarget,
        get type() {
            return nativeEvent.type;
        },
        preventDefault() {
            nativeEvent.preventDefault();
        },
        stopPropagation() {
            nativeEvent.stopPropagation();
            this._stopped = true; // custom flag to indicate stopping at framework level
        },

        _stopped: false,
    };
}