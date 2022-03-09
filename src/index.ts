type Listener<T> = {
    getDefaultValue: () => T,
    addListener: (callback: (v: T) => void) => void,
    removeListener: (callback: (v: T) => void) => void,
}

function throttleListeners<T>(
    listeners: Listener<any>[], 
    getState: (...params) => T,
    stateUpdate: (state: T) => void,
    throttle: (callback: (state: T) => void) => (state: T) => void = (callback) => callback
) {
    let values = listeners.map(l => l.getDefaultValue())
    let combinedValue = getState(...values)
    let realCombinedValue = combinedValue
    stateUpdate(combinedValue)
    let debounceCallback = throttle((v) => {
        if (realCombinedValue === undefined || v !== realCombinedValue) {
            realCombinedValue = v
            stateUpdate(v)
        }
    })
    let listenerCallbacks = []
    let createListenerCallback = (i: number) => {
        let callback = (v) => {
            values[i] = v
            let newCombinedValue = getState(...values)
            if (newCombinedValue !== combinedValue) {
                combinedValue = newCombinedValue
                debounceCallback(combinedValue)
            }
        }
        return callback
    }
    for (let i = 0; i < listeners.length; i++) {
        listeners[i].addListener(createListenerCallback(i))
    }
    return () => {
        for (let i = 0; i < listeners.length; i++) {
            listeners[i].removeListener(listenerCallbacks[i])
        }
    }
}

export default throttleListeners