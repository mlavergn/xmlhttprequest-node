// compatibility
window['exports'] = {};

// rxjs helpers
const rxjs = 'rxjs';
const rxjsOperators = RegExp('.*/operators.*');
const rxjsObservable = RegExp('.*/observable.*');

window['require'] = function (name) {
  if (name.substr(0, rxjs.length) === rxjs) {
    if (rxjsOperators.test(name)) {
      return Rx.operators;
    } else if (rxjsObservable.test(name)) {
      return Rx.Observable;
    } else {
      return Rx;
    }
  } else {
    return exports;
  }
};

const exports = {};
