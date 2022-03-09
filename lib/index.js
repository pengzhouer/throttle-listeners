"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function throttleListeners(listeners, getState, stateUpdate) {
  var throttle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (callback) {
    return callback;
  };
  var values = listeners.map(function (l) {
    return l.getDefaultValue();
  });
  var combinedValue = getState.apply(void 0, _toConsumableArray(values));
  var realCombinedValue = combinedValue;
  stateUpdate(combinedValue);
  var debounceCallback = throttle(function (v) {
    if (realCombinedValue === undefined || v !== realCombinedValue) {
      realCombinedValue = v;
      stateUpdate(v);
    }
  });
  var listenerCallbacks = [];

  var createListenerCallback = function createListenerCallback(i) {
    var callback = function callback(v) {
      values[i] = v;
      var newCombinedValue = getState.apply(void 0, _toConsumableArray(values));

      if (newCombinedValue !== combinedValue) {
        combinedValue = newCombinedValue;
        debounceCallback(combinedValue);
      }
    };

    return callback;
  };

  for (var i = 0; i < listeners.length; i++) {
    listeners[i].addListener(createListenerCallback(i));
  }

  return function () {
    for (var _i = 0; _i < listeners.length; _i++) {
      listeners[_i].removeListener(listenerCallbacks[_i]);
    }
  };
}

var _default = throttleListeners;
exports["default"] = _default;