var assert = require('assert');
let throttleListeners = require('../lib/index').default
let EventEmitter = require('eventemitter3')
let debounce = require('throttle-debounce').debounce

let eventemitter = new EventEmitter()

describe('throttleListeners', function () {
    it('when don\'t throttle, state should corresponding to throttled state', async function () {
        let triggeredState = []
        throttleListeners(
            [
                {getDefaultValue: () => 6, addListener: (callback) => eventemitter.on('a', callback), removeListener: (callback) => eventemitter.removeListener('a', callback)},
                {getDefaultValue: () => 6, addListener: (callback) => eventemitter.on('b', callback), removeListener: (callback) => eventemitter.removeListener('b', callback)},
            ],
            (a, b) => {
                return a + b > 10
            },
            (state) => triggeredState.push(state),
        )
        eventemitter.emit('a', 2) // 2, 6
        eventemitter.emit('b', 9) // 2, 9
        eventemitter.emit('a', 4) // 4, 9
        eventemitter.emit('b', 3) // 4, 3
        eventemitter.emit('a', 8) // 8, 3
        eventemitter.emit('b', 2) // 8, 2
        eventemitter.emit('a', 5) // 5, 2
        eventemitter.emit('b', 8) // 5, 8
        eventemitter.emit('a', 1) // 1, 8
        assert.deepEqual(triggeredState, [true, false, true, false, true, false, true, false])
    });
    it('when debounce, state should be debounced', async function () {
        let triggeredState = []
        throttleListeners(
            [
                {getDefaultValue: () => 6, addListener: (callback) => eventemitter.on('a', callback), removeListener: (callback) => eventemitter.removeListener('a', callback)},
                {getDefaultValue: () => 6, addListener: (callback) => eventemitter.on('b', callback), removeListener: (callback) => eventemitter.removeListener('b', callback)},
            ],
            (a, b) => {
                return a + b > 10
            },
            (state) => triggeredState.push(state),
            callback => debounce(1000, false, callback)
        )
        eventemitter.emit('a', 2) // 2, 6
        await delay(1000)
        eventemitter.emit('b', 9) // 2, 9
        eventemitter.emit('a', 4) // 4, 9
        await delay(1000)
        eventemitter.emit('b', 3) // 4, 3
        eventemitter.emit('a', 8) // 8, 3
        await delay(400)
        eventemitter.emit('b', 2) // 8, 2
        await delay(400)
        eventemitter.emit('a', 5) // 5, 2
        await delay(400)
        eventemitter.emit('b', 8) // 5, 8
        await delay(400)
        eventemitter.emit('a', 1) // 1, 8
        await delay(1000)
        assert.deepEqual(triggeredState, [true, false, true, false])
    });
    it('when removeListener, stateUpdate should not be triggered', async function () {
        let triggeredState = []
        let removeListeners = throttleListeners(
            [
                {getDefaultValue: () => 6, addListener: (callback) => eventemitter.on('a', callback), removeListener: (callback) => eventemitter.removeListener('a', callback)},
                {getDefaultValue: () => 6, addListener: (callback) => eventemitter.on('b', callback), removeListener: (callback) => eventemitter.removeListener('b', callback)},
            ],
            (a, b) => {
                return a + b > 10
            },
            (state) => triggeredState.push(state),
            callback => debounce(1000, false, callback)
        )
        eventemitter.emit('a', 2) // 2, 6
        await delay(1000)
        eventemitter.emit('b', 9) // 2, 9
        eventemitter.emit('a', 4) // 4, 9
        removeListeners()
        await delay(1000)
        eventemitter.emit('a', 8) // 8, 3
        eventemitter.emit('b', 2) // 8, 2
        eventemitter.emit('a', 5) // 5, 2
        eventemitter.emit('b', 8) // 5, 8
        eventemitter.emit('a', 1) // 1, 8
        await delay(1000)
        assert.deepEqual(triggeredState, [true, false, true])
    });
});

function delay(time) {
    return new Promise((resolve, reject) => setTimeout(resolve, time))
}