/**
 * This is a partial (and more efficient) implementation of the event emitter.
 * It attempts to maintain a one-to-one mapping between events and listeners, skipping an array lookup.
 * Only if there are multiple listeners, they are combined in an array.
 *
 * Copyright Metrological, 2017
 */
class EventEmitter {

    constructor() {
        // This is set (and kept) to true when events are used at all.
        this._hasEventListeners = false
    }

    on(name, listener) {
        if (!this._hasEventListeners) {
            this._eventFunction = {}
            this._eventListeners = {}
            this._hasEventListeners = true
        }

        const current = this._eventFunction[name]
        if (!current) {
            this._eventFunction[name] = listener
        } else {
            if (this._eventFunction[name] !== EventEmitter.combiner) {
                this._eventListeners[name] = [this._eventFunction[name], listener]
                this._eventFunction[name] = EventEmitter.combiner
            } else {
                this._eventListeners[name].push(listener)
            }
        }
    }

    has(name, listener) {
        if (this._hasEventListeners) {
            const current = this._eventFunction[name]
            if (current) {
                if (current === EventEmitter.combiner) {
                    const listeners = this._eventListeners[name]
                    let index = listeners.indexOf(listener)
                    return (index >= 0)
                } else if (this._eventFunction[name] === listener) {
                    return true
                }
            }
        }
        return false;
    }

    off(name, listener) {
        if (this._hasEventListeners) {
            const current = this._eventFunction[name]
            if (current) {
                if (current === EventEmitter.combiner) {
                    const listeners = this._eventListeners[name]
                    let index = listeners.indexOf(listener)
                    if (index >= 0) {
                        listeners.splice(index, 1)
                    }
                    if (listeners.length === 1) {
                        this._eventFunction[name] = listeners[0]
                        this._eventListeners[name] = undefined
                    }
                } else if (this._eventFunction[name] === listener) {
                    this._eventFunction[name] = undefined
                }
            }
        }
    }

    removeListener(name, listener) {
        this.off(name, listener)
    }

    emit(name, arg1, arg2, arg3) {
        if (this._hasEventListeners) {
            const func = this._eventFunction[name]
            if (func) {
                if (func === EventEmitter.combiner) {
                    func(this, name, arg1, arg2, arg3)
                } else {
                    func(arg1, arg2, arg3)
                }
            }
        }
    }

}

EventEmitter.combiner = function(object, name, arg1, arg2, arg3) {
    const listeners = object._eventListeners[name]
    if (listeners) {
        // Because listener may detach itself while being invoked, we use a forEach instead of for loop.
        listeners.forEach((listener) => {
            listener(arg1, arg2, arg3)
        })
    }
}

/*M¬*/
//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = EventEmitter;
}
/*¬M*/
