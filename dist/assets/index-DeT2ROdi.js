;(function () {
  const n = document.createElement('link').relList
  if (n && n.supports && n.supports('modulepreload')) return
  for (const l of document.querySelectorAll('link[rel="modulepreload"]')) r(l)
  new MutationObserver((l) => {
    for (const o of l)
      if (o.type === 'childList')
        for (const u of o.addedNodes) u.tagName === 'LINK' && u.rel === 'modulepreload' && r(u)
  }).observe(document, { childList: !0, subtree: !0 })
  function t(l) {
    const o = {}
    return (
      l.integrity && (o.integrity = l.integrity),
      l.referrerPolicy && (o.referrerPolicy = l.referrerPolicy),
      l.crossOrigin === 'use-credentials'
        ? (o.credentials = 'include')
        : l.crossOrigin === 'anonymous'
          ? (o.credentials = 'omit')
          : (o.credentials = 'same-origin'),
      o
    )
  }
  function r(l) {
    if (l.ep) return
    l.ep = !0
    const o = t(l)
    fetch(l.href, o)
  }
})()
function of(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, 'default') ? e.default : e
}
var ks = { exports: {} },
  Nl = {},
  Es = { exports: {} },
  A = {}
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Sr = Symbol.for('react.element'),
  uf = Symbol.for('react.portal'),
  sf = Symbol.for('react.fragment'),
  af = Symbol.for('react.strict_mode'),
  cf = Symbol.for('react.profiler'),
  ff = Symbol.for('react.provider'),
  df = Symbol.for('react.context'),
  pf = Symbol.for('react.forward_ref'),
  hf = Symbol.for('react.suspense'),
  mf = Symbol.for('react.memo'),
  yf = Symbol.for('react.lazy'),
  uu = Symbol.iterator
function vf(e) {
  return e === null || typeof e != 'object'
    ? null
    : ((e = (uu && e[uu]) || e['@@iterator']), typeof e == 'function' ? e : null)
}
var Cs = {
    isMounted: function () {
      return !1
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  _s = Object.assign,
  xs = {}
function Mt(e, n, t) {
  ;((this.props = e), (this.context = n), (this.refs = xs), (this.updater = t || Cs))
}
Mt.prototype.isReactComponent = {}
Mt.prototype.setState = function (e, n) {
  if (typeof e != 'object' && typeof e != 'function' && e != null)
    throw Error(
      'setState(...): takes an object of state variables to update or a function which returns an object of state variables.'
    )
  this.updater.enqueueSetState(this, e, n, 'setState')
}
Mt.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, 'forceUpdate')
}
function Ps() {}
Ps.prototype = Mt.prototype
function fi(e, n, t) {
  ;((this.props = e), (this.context = n), (this.refs = xs), (this.updater = t || Cs))
}
var di = (fi.prototype = new Ps())
di.constructor = fi
_s(di, Mt.prototype)
di.isPureReactComponent = !0
var su = Array.isArray,
  Ts = Object.prototype.hasOwnProperty,
  pi = { current: null },
  Ns = { key: !0, ref: !0, __self: !0, __source: !0 }
function Ms(e, n, t) {
  var r,
    l = {},
    o = null,
    u = null
  if (n != null)
    for (r in (n.ref !== void 0 && (u = n.ref), n.key !== void 0 && (o = '' + n.key), n))
      Ts.call(n, r) && !Ns.hasOwnProperty(r) && (l[r] = n[r])
  var s = arguments.length - 2
  if (s === 1) l.children = t
  else if (1 < s) {
    for (var a = Array(s), h = 0; h < s; h++) a[h] = arguments[h + 2]
    l.children = a
  }
  if (e && e.defaultProps) for (r in ((s = e.defaultProps), s)) l[r] === void 0 && (l[r] = s[r])
  return { $$typeof: Sr, type: e, key: o, ref: u, props: l, _owner: pi.current }
}
function gf(e, n) {
  return { $$typeof: Sr, type: e.type, key: n, ref: e.ref, props: e.props, _owner: e._owner }
}
function hi(e) {
  return typeof e == 'object' && e !== null && e.$$typeof === Sr
}
function wf(e) {
  var n = { '=': '=0', ':': '=2' }
  return (
    '$' +
    e.replace(/[=:]/g, function (t) {
      return n[t]
    })
  )
}
var au = /\/+/g
function Ql(e, n) {
  return typeof e == 'object' && e !== null && e.key != null ? wf('' + e.key) : n.toString(36)
}
function Kr(e, n, t, r, l) {
  var o = typeof e
  ;(o === 'undefined' || o === 'boolean') && (e = null)
  var u = !1
  if (e === null) u = !0
  else
    switch (o) {
      case 'string':
      case 'number':
        u = !0
        break
      case 'object':
        switch (e.$$typeof) {
          case Sr:
          case uf:
            u = !0
        }
    }
  if (u)
    return (
      (u = e),
      (l = l(u)),
      (e = r === '' ? '.' + Ql(u, 0) : r),
      su(l)
        ? ((t = ''),
          e != null && (t = e.replace(au, '$&/') + '/'),
          Kr(l, n, t, '', function (h) {
            return h
          }))
        : l != null &&
          (hi(l) &&
            (l = gf(
              l,
              t +
                (!l.key || (u && u.key === l.key) ? '' : ('' + l.key).replace(au, '$&/') + '/') +
                e
            )),
          n.push(l)),
      1
    )
  if (((u = 0), (r = r === '' ? '.' : r + ':'), su(e)))
    for (var s = 0; s < e.length; s++) {
      o = e[s]
      var a = r + Ql(o, s)
      u += Kr(o, n, t, a, l)
    }
  else if (((a = vf(e)), typeof a == 'function'))
    for (e = a.call(e), s = 0; !(o = e.next()).done; )
      ((o = o.value), (a = r + Ql(o, s++)), (u += Kr(o, n, t, a, l)))
  else if (o === 'object')
    throw (
      (n = String(e)),
      Error(
        'Objects are not valid as a React child (found: ' +
          (n === '[object Object]' ? 'object with keys {' + Object.keys(e).join(', ') + '}' : n) +
          '). If you meant to render a collection of children, use an array instead.'
      )
    )
  return u
}
function Nr(e, n, t) {
  if (e == null) return e
  var r = [],
    l = 0
  return (
    Kr(e, r, '', '', function (o) {
      return n.call(t, o, l++)
    }),
    r
  )
}
function Sf(e) {
  if (e._status === -1) {
    var n = e._result
    ;((n = n()),
      n.then(
        function (t) {
          ;(e._status === 0 || e._status === -1) && ((e._status = 1), (e._result = t))
        },
        function (t) {
          ;(e._status === 0 || e._status === -1) && ((e._status = 2), (e._result = t))
        }
      ),
      e._status === -1 && ((e._status = 0), (e._result = n)))
  }
  if (e._status === 1) return e._result.default
  throw e._result
}
var Se = { current: null },
  Gr = { transition: null },
  kf = { ReactCurrentDispatcher: Se, ReactCurrentBatchConfig: Gr, ReactCurrentOwner: pi }
function zs() {
  throw Error('act(...) is not supported in production builds of React.')
}
A.Children = {
  map: Nr,
  forEach: function (e, n, t) {
    Nr(
      e,
      function () {
        n.apply(this, arguments)
      },
      t
    )
  },
  count: function (e) {
    var n = 0
    return (
      Nr(e, function () {
        n++
      }),
      n
    )
  },
  toArray: function (e) {
    return (
      Nr(e, function (n) {
        return n
      }) || []
    )
  },
  only: function (e) {
    if (!hi(e)) throw Error('React.Children.only expected to receive a single React element child.')
    return e
  },
}
A.Component = Mt
A.Fragment = sf
A.Profiler = cf
A.PureComponent = fi
A.StrictMode = af
A.Suspense = hf
A.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = kf
A.act = zs
A.cloneElement = function (e, n, t) {
  if (e == null)
    throw Error(
      'React.cloneElement(...): The argument must be a React element, but you passed ' + e + '.'
    )
  var r = _s({}, e.props),
    l = e.key,
    o = e.ref,
    u = e._owner
  if (n != null) {
    if (
      (n.ref !== void 0 && ((o = n.ref), (u = pi.current)),
      n.key !== void 0 && (l = '' + n.key),
      e.type && e.type.defaultProps)
    )
      var s = e.type.defaultProps
    for (a in n)
      Ts.call(n, a) &&
        !Ns.hasOwnProperty(a) &&
        (r[a] = n[a] === void 0 && s !== void 0 ? s[a] : n[a])
  }
  var a = arguments.length - 2
  if (a === 1) r.children = t
  else if (1 < a) {
    s = Array(a)
    for (var h = 0; h < a; h++) s[h] = arguments[h + 2]
    r.children = s
  }
  return { $$typeof: Sr, type: e.type, key: l, ref: o, props: r, _owner: u }
}
A.createContext = function (e) {
  return (
    (e = {
      $$typeof: df,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: ff, _context: e }),
    (e.Consumer = e)
  )
}
A.createElement = Ms
A.createFactory = function (e) {
  var n = Ms.bind(null, e)
  return ((n.type = e), n)
}
A.createRef = function () {
  return { current: null }
}
A.forwardRef = function (e) {
  return { $$typeof: pf, render: e }
}
A.isValidElement = hi
A.lazy = function (e) {
  return { $$typeof: yf, _payload: { _status: -1, _result: e }, _init: Sf }
}
A.memo = function (e, n) {
  return { $$typeof: mf, type: e, compare: n === void 0 ? null : n }
}
A.startTransition = function (e) {
  var n = Gr.transition
  Gr.transition = {}
  try {
    e()
  } finally {
    Gr.transition = n
  }
}
A.unstable_act = zs
A.useCallback = function (e, n) {
  return Se.current.useCallback(e, n)
}
A.useContext = function (e) {
  return Se.current.useContext(e)
}
A.useDebugValue = function () {}
A.useDeferredValue = function (e) {
  return Se.current.useDeferredValue(e)
}
A.useEffect = function (e, n) {
  return Se.current.useEffect(e, n)
}
A.useId = function () {
  return Se.current.useId()
}
A.useImperativeHandle = function (e, n, t) {
  return Se.current.useImperativeHandle(e, n, t)
}
A.useInsertionEffect = function (e, n) {
  return Se.current.useInsertionEffect(e, n)
}
A.useLayoutEffect = function (e, n) {
  return Se.current.useLayoutEffect(e, n)
}
A.useMemo = function (e, n) {
  return Se.current.useMemo(e, n)
}
A.useReducer = function (e, n, t) {
  return Se.current.useReducer(e, n, t)
}
A.useRef = function (e) {
  return Se.current.useRef(e)
}
A.useState = function (e) {
  return Se.current.useState(e)
}
A.useSyncExternalStore = function (e, n, t) {
  return Se.current.useSyncExternalStore(e, n, t)
}
A.useTransition = function () {
  return Se.current.useTransition()
}
A.version = '18.3.1'
Es.exports = A
var O = Es.exports
const Ef = of(O)
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Cf = O,
  _f = Symbol.for('react.element'),
  xf = Symbol.for('react.fragment'),
  Pf = Object.prototype.hasOwnProperty,
  Tf = Cf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  Nf = { key: !0, ref: !0, __self: !0, __source: !0 }
function Ls(e, n, t) {
  var r,
    l = {},
    o = null,
    u = null
  ;(t !== void 0 && (o = '' + t),
    n.key !== void 0 && (o = '' + n.key),
    n.ref !== void 0 && (u = n.ref))
  for (r in n) Pf.call(n, r) && !Nf.hasOwnProperty(r) && (l[r] = n[r])
  if (e && e.defaultProps) for (r in ((n = e.defaultProps), n)) l[r] === void 0 && (l[r] = n[r])
  return { $$typeof: _f, type: e, key: o, ref: u, props: l, _owner: Tf.current }
}
Nl.Fragment = xf
Nl.jsx = Ls
Nl.jsxs = Ls
ks.exports = Nl
var k = ks.exports,
  go = {},
  Rs = { exports: {} },
  Re = {},
  js = { exports: {} },
  Fs = {}
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ ;(function (e) {
  function n(P, D) {
    var I = P.length
    P.push(D)
    e: for (; 0 < I; ) {
      var Z = (I - 1) >>> 1,
        re = P[Z]
      if (0 < l(re, D)) ((P[Z] = D), (P[I] = re), (I = Z))
      else break e
    }
  }
  function t(P) {
    return P.length === 0 ? null : P[0]
  }
  function r(P) {
    if (P.length === 0) return null
    var D = P[0],
      I = P.pop()
    if (I !== D) {
      P[0] = I
      e: for (var Z = 0, re = P.length, nt = re >>> 1; Z < nt; ) {
        var tn = 2 * (Z + 1) - 1,
          jt = P[tn],
          rn = tn + 1,
          tt = P[rn]
        if (0 > l(jt, I))
          rn < re && 0 > l(tt, jt)
            ? ((P[Z] = tt), (P[rn] = I), (Z = rn))
            : ((P[Z] = jt), (P[tn] = I), (Z = tn))
        else if (rn < re && 0 > l(tt, I)) ((P[Z] = tt), (P[rn] = I), (Z = rn))
        else break e
      }
    }
    return D
  }
  function l(P, D) {
    var I = P.sortIndex - D.sortIndex
    return I !== 0 ? I : P.id - D.id
  }
  if (typeof performance == 'object' && typeof performance.now == 'function') {
    var o = performance
    e.unstable_now = function () {
      return o.now()
    }
  } else {
    var u = Date,
      s = u.now()
    e.unstable_now = function () {
      return u.now() - s
    }
  }
  var a = [],
    h = [],
    w = 1,
    v = null,
    g = 3,
    C = !1,
    x = !1,
    _ = !1,
    H = typeof setTimeout == 'function' ? setTimeout : null,
    m = typeof clearTimeout == 'function' ? clearTimeout : null,
    d = typeof setImmediate < 'u' ? setImmediate : null
  typeof navigator < 'u' &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling)
  function y(P) {
    for (var D = t(h); D !== null; ) {
      if (D.callback === null) r(h)
      else if (D.startTime <= P) (r(h), (D.sortIndex = D.expirationTime), n(a, D))
      else break
      D = t(h)
    }
  }
  function S(P) {
    if (((_ = !1), y(P), !x))
      if (t(a) !== null) ((x = !0), nn(N))
      else {
        var D = t(h)
        D !== null && Rt(S, D.startTime - P)
      }
  }
  function N(P, D) {
    ;((x = !1), _ && ((_ = !1), m(R), (R = -1)), (C = !0))
    var I = g
    try {
      for (y(D), v = t(a); v !== null && (!(v.expirationTime > D) || (P && !Fe())); ) {
        var Z = v.callback
        if (typeof Z == 'function') {
          ;((v.callback = null), (g = v.priorityLevel))
          var re = Z(v.expirationTime <= D)
          ;((D = e.unstable_now()),
            typeof re == 'function' ? (v.callback = re) : v === t(a) && r(a),
            y(D))
        } else r(a)
        v = t(a)
      }
      if (v !== null) var nt = !0
      else {
        var tn = t(h)
        ;(tn !== null && Rt(S, tn.startTime - D), (nt = !1))
      }
      return nt
    } finally {
      ;((v = null), (g = I), (C = !1))
    }
  }
  var z = !1,
    L = null,
    R = -1,
    G = 5,
    B = -1
  function Fe() {
    return !(e.unstable_now() - B < G)
  }
  function On() {
    if (L !== null) {
      var P = e.unstable_now()
      B = P
      var D = !0
      try {
        D = L(!0, P)
      } finally {
        D ? et() : ((z = !1), (L = null))
      }
    } else z = !1
  }
  var et
  if (typeof d == 'function')
    et = function () {
      d(On)
    }
  else if (typeof MessageChannel < 'u') {
    var Ul = new MessageChannel(),
      ee = Ul.port2
    ;((Ul.port1.onmessage = On),
      (et = function () {
        ee.postMessage(null)
      }))
  } else
    et = function () {
      H(On, 0)
    }
  function nn(P) {
    ;((L = P), z || ((z = !0), et()))
  }
  function Rt(P, D) {
    R = H(function () {
      P(e.unstable_now())
    }, D)
  }
  ;((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (P) {
      P.callback = null
    }),
    (e.unstable_continueExecution = function () {
      x || C || ((x = !0), nn(N))
    }),
    (e.unstable_forceFrameRate = function (P) {
      0 > P || 125 < P
        ? console.error(
            'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported'
          )
        : (G = 0 < P ? Math.floor(1e3 / P) : 5)
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return g
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return t(a)
    }),
    (e.unstable_next = function (P) {
      switch (g) {
        case 1:
        case 2:
        case 3:
          var D = 3
          break
        default:
          D = g
      }
      var I = g
      g = D
      try {
        return P()
      } finally {
        g = I
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (P, D) {
      switch (P) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break
        default:
          P = 3
      }
      var I = g
      g = P
      try {
        return D()
      } finally {
        g = I
      }
    }),
    (e.unstable_scheduleCallback = function (P, D, I) {
      var Z = e.unstable_now()
      switch (
        (typeof I == 'object' && I !== null
          ? ((I = I.delay), (I = typeof I == 'number' && 0 < I ? Z + I : Z))
          : (I = Z),
        P)
      ) {
        case 1:
          var re = -1
          break
        case 2:
          re = 250
          break
        case 5:
          re = 1073741823
          break
        case 4:
          re = 1e4
          break
        default:
          re = 5e3
      }
      return (
        (re = I + re),
        (P = {
          id: w++,
          callback: D,
          priorityLevel: P,
          startTime: I,
          expirationTime: re,
          sortIndex: -1,
        }),
        I > Z
          ? ((P.sortIndex = I),
            n(h, P),
            t(a) === null && P === t(h) && (_ ? (m(R), (R = -1)) : (_ = !0), Rt(S, I - Z)))
          : ((P.sortIndex = re), n(a, P), x || C || ((x = !0), nn(N))),
        P
      )
    }),
    (e.unstable_shouldYield = Fe),
    (e.unstable_wrapCallback = function (P) {
      var D = g
      return function () {
        var I = g
        g = D
        try {
          return P.apply(this, arguments)
        } finally {
          g = I
        }
      }
    }))
})(Fs)
js.exports = Fs
var Mf = js.exports
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var zf = O,
  Le = Mf
function E(e) {
  for (
    var n = 'https://reactjs.org/docs/error-decoder.html?invariant=' + e, t = 1;
    t < arguments.length;
    t++
  )
    n += '&args[]=' + encodeURIComponent(arguments[t])
  return (
    'Minified React error #' +
    e +
    '; visit ' +
    n +
    ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
  )
}
var Ds = new Set(),
  rr = {}
function qn(e, n) {
  ;(Et(e, n), Et(e + 'Capture', n))
}
function Et(e, n) {
  for (rr[e] = n, e = 0; e < n.length; e++) Ds.add(n[e])
}
var fn = !(
    typeof window > 'u' ||
    typeof window.document > 'u' ||
    typeof window.document.createElement > 'u'
  ),
  wo = Object.prototype.hasOwnProperty,
  Lf =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  cu = {},
  fu = {}
function Rf(e) {
  return wo.call(fu, e) ? !0 : wo.call(cu, e) ? !1 : Lf.test(e) ? (fu[e] = !0) : ((cu[e] = !0), !1)
}
function jf(e, n, t, r) {
  if (t !== null && t.type === 0) return !1
  switch (typeof n) {
    case 'function':
    case 'symbol':
      return !0
    case 'boolean':
      return r
        ? !1
        : t !== null
          ? !t.acceptsBooleans
          : ((e = e.toLowerCase().slice(0, 5)), e !== 'data-' && e !== 'aria-')
    default:
      return !1
  }
}
function Ff(e, n, t, r) {
  if (n === null || typeof n > 'u' || jf(e, n, t, r)) return !0
  if (r) return !1
  if (t !== null)
    switch (t.type) {
      case 3:
        return !n
      case 4:
        return n === !1
      case 5:
        return isNaN(n)
      case 6:
        return isNaN(n) || 1 > n
    }
  return !1
}
function ke(e, n, t, r, l, o, u) {
  ;((this.acceptsBooleans = n === 2 || n === 3 || n === 4),
    (this.attributeName = r),
    (this.attributeNamespace = l),
    (this.mustUseProperty = t),
    (this.propertyName = e),
    (this.type = n),
    (this.sanitizeURL = o),
    (this.removeEmptyString = u))
}
var de = {}
'children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
  .split(' ')
  .forEach(function (e) {
    de[e] = new ke(e, 0, !1, e, null, !1, !1)
  })
;[
  ['acceptCharset', 'accept-charset'],
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['httpEquiv', 'http-equiv'],
].forEach(function (e) {
  var n = e[0]
  de[n] = new ke(n, 1, !1, e[1], null, !1, !1)
})
;['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (e) {
  de[e] = new ke(e, 2, !1, e.toLowerCase(), null, !1, !1)
})
;['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (e) {
  de[e] = new ke(e, 2, !1, e, null, !1, !1)
})
'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
  .split(' ')
  .forEach(function (e) {
    de[e] = new ke(e, 3, !1, e.toLowerCase(), null, !1, !1)
  })
;['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
  de[e] = new ke(e, 3, !0, e, null, !1, !1)
})
;['capture', 'download'].forEach(function (e) {
  de[e] = new ke(e, 4, !1, e, null, !1, !1)
})
;['cols', 'rows', 'size', 'span'].forEach(function (e) {
  de[e] = new ke(e, 6, !1, e, null, !1, !1)
})
;['rowSpan', 'start'].forEach(function (e) {
  de[e] = new ke(e, 5, !1, e.toLowerCase(), null, !1, !1)
})
var mi = /[\-:]([a-z])/g
function yi(e) {
  return e[1].toUpperCase()
}
'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
  .split(' ')
  .forEach(function (e) {
    var n = e.replace(mi, yi)
    de[n] = new ke(n, 1, !1, e, null, !1, !1)
  })
'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'
  .split(' ')
  .forEach(function (e) {
    var n = e.replace(mi, yi)
    de[n] = new ke(n, 1, !1, e, 'http://www.w3.org/1999/xlink', !1, !1)
  })
;['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
  var n = e.replace(mi, yi)
  de[n] = new ke(n, 1, !1, e, 'http://www.w3.org/XML/1998/namespace', !1, !1)
})
;['tabIndex', 'crossOrigin'].forEach(function (e) {
  de[e] = new ke(e, 1, !1, e.toLowerCase(), null, !1, !1)
})
de.xlinkHref = new ke('xlinkHref', 1, !1, 'xlink:href', 'http://www.w3.org/1999/xlink', !0, !1)
;['src', 'href', 'action', 'formAction'].forEach(function (e) {
  de[e] = new ke(e, 1, !1, e.toLowerCase(), null, !0, !0)
})
function vi(e, n, t, r) {
  var l = de.hasOwnProperty(n) ? de[n] : null
  ;(l !== null
    ? l.type !== 0
    : r || !(2 < n.length) || (n[0] !== 'o' && n[0] !== 'O') || (n[1] !== 'n' && n[1] !== 'N')) &&
    (Ff(n, t, l, r) && (t = null),
    r || l === null
      ? Rf(n) && (t === null ? e.removeAttribute(n) : e.setAttribute(n, '' + t))
      : l.mustUseProperty
        ? (e[l.propertyName] = t === null ? (l.type === 3 ? !1 : '') : t)
        : ((n = l.attributeName),
          (r = l.attributeNamespace),
          t === null
            ? e.removeAttribute(n)
            : ((l = l.type),
              (t = l === 3 || (l === 4 && t === !0) ? '' : '' + t),
              r ? e.setAttributeNS(r, n, t) : e.setAttribute(n, t))))
}
var mn = zf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Mr = Symbol.for('react.element'),
  lt = Symbol.for('react.portal'),
  ot = Symbol.for('react.fragment'),
  gi = Symbol.for('react.strict_mode'),
  So = Symbol.for('react.profiler'),
  Is = Symbol.for('react.provider'),
  Os = Symbol.for('react.context'),
  wi = Symbol.for('react.forward_ref'),
  ko = Symbol.for('react.suspense'),
  Eo = Symbol.for('react.suspense_list'),
  Si = Symbol.for('react.memo'),
  gn = Symbol.for('react.lazy'),
  Bs = Symbol.for('react.offscreen'),
  du = Symbol.iterator
function Ft(e) {
  return e === null || typeof e != 'object'
    ? null
    : ((e = (du && e[du]) || e['@@iterator']), typeof e == 'function' ? e : null)
}
var b = Object.assign,
  Kl
function Ht(e) {
  if (Kl === void 0)
    try {
      throw Error()
    } catch (t) {
      var n = t.stack.trim().match(/\n( *(at )?)/)
      Kl = (n && n[1]) || ''
    }
  return (
    `
` +
    Kl +
    e
  )
}
var Gl = !1
function Yl(e, n) {
  if (!e || Gl) return ''
  Gl = !0
  var t = Error.prepareStackTrace
  Error.prepareStackTrace = void 0
  try {
    if (n)
      if (
        ((n = function () {
          throw Error()
        }),
        Object.defineProperty(n.prototype, 'props', {
          set: function () {
            throw Error()
          },
        }),
        typeof Reflect == 'object' && Reflect.construct)
      ) {
        try {
          Reflect.construct(n, [])
        } catch (h) {
          var r = h
        }
        Reflect.construct(e, [], n)
      } else {
        try {
          n.call()
        } catch (h) {
          r = h
        }
        e.call(n.prototype)
      }
    else {
      try {
        throw Error()
      } catch (h) {
        r = h
      }
      e()
    }
  } catch (h) {
    if (h && r && typeof h.stack == 'string') {
      for (
        var l = h.stack.split(`
`),
          o = r.stack.split(`
`),
          u = l.length - 1,
          s = o.length - 1;
        1 <= u && 0 <= s && l[u] !== o[s];

      )
        s--
      for (; 1 <= u && 0 <= s; u--, s--)
        if (l[u] !== o[s]) {
          if (u !== 1 || s !== 1)
            do
              if ((u--, s--, 0 > s || l[u] !== o[s])) {
                var a =
                  `
` + l[u].replace(' at new ', ' at ')
                return (
                  e.displayName &&
                    a.includes('<anonymous>') &&
                    (a = a.replace('<anonymous>', e.displayName)),
                  a
                )
              }
            while (1 <= u && 0 <= s)
          break
        }
    }
  } finally {
    ;((Gl = !1), (Error.prepareStackTrace = t))
  }
  return (e = e ? e.displayName || e.name : '') ? Ht(e) : ''
}
function Df(e) {
  switch (e.tag) {
    case 5:
      return Ht(e.type)
    case 16:
      return Ht('Lazy')
    case 13:
      return Ht('Suspense')
    case 19:
      return Ht('SuspenseList')
    case 0:
    case 2:
    case 15:
      return ((e = Yl(e.type, !1)), e)
    case 11:
      return ((e = Yl(e.type.render, !1)), e)
    case 1:
      return ((e = Yl(e.type, !0)), e)
    default:
      return ''
  }
}
function Co(e) {
  if (e == null) return null
  if (typeof e == 'function') return e.displayName || e.name || null
  if (typeof e == 'string') return e
  switch (e) {
    case ot:
      return 'Fragment'
    case lt:
      return 'Portal'
    case So:
      return 'Profiler'
    case gi:
      return 'StrictMode'
    case ko:
      return 'Suspense'
    case Eo:
      return 'SuspenseList'
  }
  if (typeof e == 'object')
    switch (e.$$typeof) {
      case Os:
        return (e.displayName || 'Context') + '.Consumer'
      case Is:
        return (e._context.displayName || 'Context') + '.Provider'
      case wi:
        var n = e.render
        return (
          (e = e.displayName),
          e ||
            ((e = n.displayName || n.name || ''),
            (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
          e
        )
      case Si:
        return ((n = e.displayName || null), n !== null ? n : Co(e.type) || 'Memo')
      case gn:
        ;((n = e._payload), (e = e._init))
        try {
          return Co(e(n))
        } catch {}
    }
  return null
}
function If(e) {
  var n = e.type
  switch (e.tag) {
    case 24:
      return 'Cache'
    case 9:
      return (n.displayName || 'Context') + '.Consumer'
    case 10:
      return (n._context.displayName || 'Context') + '.Provider'
    case 18:
      return 'DehydratedFragment'
    case 11:
      return (
        (e = n.render),
        (e = e.displayName || e.name || ''),
        n.displayName || (e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')
      )
    case 7:
      return 'Fragment'
    case 5:
      return n
    case 4:
      return 'Portal'
    case 3:
      return 'Root'
    case 6:
      return 'Text'
    case 16:
      return Co(n)
    case 8:
      return n === gi ? 'StrictMode' : 'Mode'
    case 22:
      return 'Offscreen'
    case 12:
      return 'Profiler'
    case 21:
      return 'Scope'
    case 13:
      return 'Suspense'
    case 19:
      return 'SuspenseList'
    case 25:
      return 'TracingMarker'
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof n == 'function') return n.displayName || n.name || null
      if (typeof n == 'string') return n
  }
  return null
}
function Rn(e) {
  switch (typeof e) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'undefined':
      return e
    case 'object':
      return e
    default:
      return ''
  }
}
function As(e) {
  var n = e.type
  return (e = e.nodeName) && e.toLowerCase() === 'input' && (n === 'checkbox' || n === 'radio')
}
function Of(e) {
  var n = As(e) ? 'checked' : 'value',
    t = Object.getOwnPropertyDescriptor(e.constructor.prototype, n),
    r = '' + e[n]
  if (
    !e.hasOwnProperty(n) &&
    typeof t < 'u' &&
    typeof t.get == 'function' &&
    typeof t.set == 'function'
  ) {
    var l = t.get,
      o = t.set
    return (
      Object.defineProperty(e, n, {
        configurable: !0,
        get: function () {
          return l.call(this)
        },
        set: function (u) {
          ;((r = '' + u), o.call(this, u))
        },
      }),
      Object.defineProperty(e, n, { enumerable: t.enumerable }),
      {
        getValue: function () {
          return r
        },
        setValue: function (u) {
          r = '' + u
        },
        stopTracking: function () {
          ;((e._valueTracker = null), delete e[n])
        },
      }
    )
  }
}
function zr(e) {
  e._valueTracker || (e._valueTracker = Of(e))
}
function $s(e) {
  if (!e) return !1
  var n = e._valueTracker
  if (!n) return !0
  var t = n.getValue(),
    r = ''
  return (
    e && (r = As(e) ? (e.checked ? 'true' : 'false') : e.value),
    (e = r),
    e !== t ? (n.setValue(e), !0) : !1
  )
}
function ll(e) {
  if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u')) return null
  try {
    return e.activeElement || e.body
  } catch {
    return e.body
  }
}
function _o(e, n) {
  var t = n.checked
  return b({}, n, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: t ?? e._wrapperState.initialChecked,
  })
}
function pu(e, n) {
  var t = n.defaultValue == null ? '' : n.defaultValue,
    r = n.checked != null ? n.checked : n.defaultChecked
  ;((t = Rn(n.value != null ? n.value : t)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: t,
      controlled: n.type === 'checkbox' || n.type === 'radio' ? n.checked != null : n.value != null,
    }))
}
function Ws(e, n) {
  ;((n = n.checked), n != null && vi(e, 'checked', n, !1))
}
function xo(e, n) {
  Ws(e, n)
  var t = Rn(n.value),
    r = n.type
  if (t != null)
    r === 'number'
      ? ((t === 0 && e.value === '') || e.value != t) && (e.value = '' + t)
      : e.value !== '' + t && (e.value = '' + t)
  else if (r === 'submit' || r === 'reset') {
    e.removeAttribute('value')
    return
  }
  ;(n.hasOwnProperty('value')
    ? Po(e, n.type, t)
    : n.hasOwnProperty('defaultValue') && Po(e, n.type, Rn(n.defaultValue)),
    n.checked == null && n.defaultChecked != null && (e.defaultChecked = !!n.defaultChecked))
}
function hu(e, n, t) {
  if (n.hasOwnProperty('value') || n.hasOwnProperty('defaultValue')) {
    var r = n.type
    if (!((r !== 'submit' && r !== 'reset') || (n.value !== void 0 && n.value !== null))) return
    ;((n = '' + e._wrapperState.initialValue),
      t || n === e.value || (e.value = n),
      (e.defaultValue = n))
  }
  ;((t = e.name),
    t !== '' && (e.name = ''),
    (e.defaultChecked = !!e._wrapperState.initialChecked),
    t !== '' && (e.name = t))
}
function Po(e, n, t) {
  ;(n !== 'number' || ll(e.ownerDocument) !== e) &&
    (t == null
      ? (e.defaultValue = '' + e._wrapperState.initialValue)
      : e.defaultValue !== '' + t && (e.defaultValue = '' + t))
}
var Vt = Array.isArray
function yt(e, n, t, r) {
  if (((e = e.options), n)) {
    n = {}
    for (var l = 0; l < t.length; l++) n['$' + t[l]] = !0
    for (t = 0; t < e.length; t++)
      ((l = n.hasOwnProperty('$' + e[t].value)),
        e[t].selected !== l && (e[t].selected = l),
        l && r && (e[t].defaultSelected = !0))
  } else {
    for (t = '' + Rn(t), n = null, l = 0; l < e.length; l++) {
      if (e[l].value === t) {
        ;((e[l].selected = !0), r && (e[l].defaultSelected = !0))
        return
      }
      n !== null || e[l].disabled || (n = e[l])
    }
    n !== null && (n.selected = !0)
  }
}
function To(e, n) {
  if (n.dangerouslySetInnerHTML != null) throw Error(E(91))
  return b({}, n, {
    value: void 0,
    defaultValue: void 0,
    children: '' + e._wrapperState.initialValue,
  })
}
function mu(e, n) {
  var t = n.value
  if (t == null) {
    if (((t = n.children), (n = n.defaultValue), t != null)) {
      if (n != null) throw Error(E(92))
      if (Vt(t)) {
        if (1 < t.length) throw Error(E(93))
        t = t[0]
      }
      n = t
    }
    ;(n == null && (n = ''), (t = n))
  }
  e._wrapperState = { initialValue: Rn(t) }
}
function Hs(e, n) {
  var t = Rn(n.value),
    r = Rn(n.defaultValue)
  ;(t != null &&
    ((t = '' + t),
    t !== e.value && (e.value = t),
    n.defaultValue == null && e.defaultValue !== t && (e.defaultValue = t)),
    r != null && (e.defaultValue = '' + r))
}
function yu(e) {
  var n = e.textContent
  n === e._wrapperState.initialValue && n !== '' && n !== null && (e.value = n)
}
function Vs(e) {
  switch (e) {
    case 'svg':
      return 'http://www.w3.org/2000/svg'
    case 'math':
      return 'http://www.w3.org/1998/Math/MathML'
    default:
      return 'http://www.w3.org/1999/xhtml'
  }
}
function No(e, n) {
  return e == null || e === 'http://www.w3.org/1999/xhtml'
    ? Vs(n)
    : e === 'http://www.w3.org/2000/svg' && n === 'foreignObject'
      ? 'http://www.w3.org/1999/xhtml'
      : e
}
var Lr,
  Us = (function (e) {
    return typeof MSApp < 'u' && MSApp.execUnsafeLocalFunction
      ? function (n, t, r, l) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(n, t, r, l)
          })
        }
      : e
  })(function (e, n) {
    if (e.namespaceURI !== 'http://www.w3.org/2000/svg' || 'innerHTML' in e) e.innerHTML = n
    else {
      for (
        Lr = Lr || document.createElement('div'),
          Lr.innerHTML = '<svg>' + n.valueOf().toString() + '</svg>',
          n = Lr.firstChild;
        e.firstChild;

      )
        e.removeChild(e.firstChild)
      for (; n.firstChild; ) e.appendChild(n.firstChild)
    }
  })
function lr(e, n) {
  if (n) {
    var t = e.firstChild
    if (t && t === e.lastChild && t.nodeType === 3) {
      t.nodeValue = n
      return
    }
  }
  e.textContent = n
}
var Yt = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  Bf = ['Webkit', 'ms', 'Moz', 'O']
Object.keys(Yt).forEach(function (e) {
  Bf.forEach(function (n) {
    ;((n = n + e.charAt(0).toUpperCase() + e.substring(1)), (Yt[n] = Yt[e]))
  })
})
function Qs(e, n, t) {
  return n == null || typeof n == 'boolean' || n === ''
    ? ''
    : t || typeof n != 'number' || n === 0 || (Yt.hasOwnProperty(e) && Yt[e])
      ? ('' + n).trim()
      : n + 'px'
}
function Ks(e, n) {
  e = e.style
  for (var t in n)
    if (n.hasOwnProperty(t)) {
      var r = t.indexOf('--') === 0,
        l = Qs(t, n[t], r)
      ;(t === 'float' && (t = 'cssFloat'), r ? e.setProperty(t, l) : (e[t] = l))
    }
}
var Af = b(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  }
)
function Mo(e, n) {
  if (n) {
    if (Af[e] && (n.children != null || n.dangerouslySetInnerHTML != null)) throw Error(E(137, e))
    if (n.dangerouslySetInnerHTML != null) {
      if (n.children != null) throw Error(E(60))
      if (typeof n.dangerouslySetInnerHTML != 'object' || !('__html' in n.dangerouslySetInnerHTML))
        throw Error(E(61))
    }
    if (n.style != null && typeof n.style != 'object') throw Error(E(62))
  }
}
function zo(e, n) {
  if (e.indexOf('-') === -1) return typeof n.is == 'string'
  switch (e) {
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return !1
    default:
      return !0
  }
}
var Lo = null
function ki(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  )
}
var Ro = null,
  vt = null,
  gt = null
function vu(e) {
  if ((e = Cr(e))) {
    if (typeof Ro != 'function') throw Error(E(280))
    var n = e.stateNode
    n && ((n = jl(n)), Ro(e.stateNode, e.type, n))
  }
}
function Gs(e) {
  vt ? (gt ? gt.push(e) : (gt = [e])) : (vt = e)
}
function Ys() {
  if (vt) {
    var e = vt,
      n = gt
    if (((gt = vt = null), vu(e), n)) for (e = 0; e < n.length; e++) vu(n[e])
  }
}
function Xs(e, n) {
  return e(n)
}
function Zs() {}
var Xl = !1
function Js(e, n, t) {
  if (Xl) return e(n, t)
  Xl = !0
  try {
    return Xs(e, n, t)
  } finally {
    ;((Xl = !1), (vt !== null || gt !== null) && (Zs(), Ys()))
  }
}
function or(e, n) {
  var t = e.stateNode
  if (t === null) return null
  var r = jl(t)
  if (r === null) return null
  t = r[n]
  e: switch (n) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
    case 'onMouseEnter':
      ;((r = !r.disabled) ||
        ((e = e.type),
        (r = !(e === 'button' || e === 'input' || e === 'select' || e === 'textarea'))),
        (e = !r))
      break e
    default:
      e = !1
  }
  if (e) return null
  if (t && typeof t != 'function') throw Error(E(231, n, typeof t))
  return t
}
var jo = !1
if (fn)
  try {
    var Dt = {}
    ;(Object.defineProperty(Dt, 'passive', {
      get: function () {
        jo = !0
      },
    }),
      window.addEventListener('test', Dt, Dt),
      window.removeEventListener('test', Dt, Dt))
  } catch {
    jo = !1
  }
function $f(e, n, t, r, l, o, u, s, a) {
  var h = Array.prototype.slice.call(arguments, 3)
  try {
    n.apply(t, h)
  } catch (w) {
    this.onError(w)
  }
}
var Xt = !1,
  ol = null,
  il = !1,
  Fo = null,
  Wf = {
    onError: function (e) {
      ;((Xt = !0), (ol = e))
    },
  }
function Hf(e, n, t, r, l, o, u, s, a) {
  ;((Xt = !1), (ol = null), $f.apply(Wf, arguments))
}
function Vf(e, n, t, r, l, o, u, s, a) {
  if ((Hf.apply(this, arguments), Xt)) {
    if (Xt) {
      var h = ol
      ;((Xt = !1), (ol = null))
    } else throw Error(E(198))
    il || ((il = !0), (Fo = h))
  }
}
function bn(e) {
  var n = e,
    t = e
  if (e.alternate) for (; n.return; ) n = n.return
  else {
    e = n
    do ((n = e), n.flags & 4098 && (t = n.return), (e = n.return))
    while (e)
  }
  return n.tag === 3 ? t : null
}
function qs(e) {
  if (e.tag === 13) {
    var n = e.memoizedState
    if ((n === null && ((e = e.alternate), e !== null && (n = e.memoizedState)), n !== null))
      return n.dehydrated
  }
  return null
}
function gu(e) {
  if (bn(e) !== e) throw Error(E(188))
}
function Uf(e) {
  var n = e.alternate
  if (!n) {
    if (((n = bn(e)), n === null)) throw Error(E(188))
    return n !== e ? null : e
  }
  for (var t = e, r = n; ; ) {
    var l = t.return
    if (l === null) break
    var o = l.alternate
    if (o === null) {
      if (((r = l.return), r !== null)) {
        t = r
        continue
      }
      break
    }
    if (l.child === o.child) {
      for (o = l.child; o; ) {
        if (o === t) return (gu(l), e)
        if (o === r) return (gu(l), n)
        o = o.sibling
      }
      throw Error(E(188))
    }
    if (t.return !== r.return) ((t = l), (r = o))
    else {
      for (var u = !1, s = l.child; s; ) {
        if (s === t) {
          ;((u = !0), (t = l), (r = o))
          break
        }
        if (s === r) {
          ;((u = !0), (r = l), (t = o))
          break
        }
        s = s.sibling
      }
      if (!u) {
        for (s = o.child; s; ) {
          if (s === t) {
            ;((u = !0), (t = o), (r = l))
            break
          }
          if (s === r) {
            ;((u = !0), (r = o), (t = l))
            break
          }
          s = s.sibling
        }
        if (!u) throw Error(E(189))
      }
    }
    if (t.alternate !== r) throw Error(E(190))
  }
  if (t.tag !== 3) throw Error(E(188))
  return t.stateNode.current === t ? e : n
}
function bs(e) {
  return ((e = Uf(e)), e !== null ? ea(e) : null)
}
function ea(e) {
  if (e.tag === 5 || e.tag === 6) return e
  for (e = e.child; e !== null; ) {
    var n = ea(e)
    if (n !== null) return n
    e = e.sibling
  }
  return null
}
var na = Le.unstable_scheduleCallback,
  wu = Le.unstable_cancelCallback,
  Qf = Le.unstable_shouldYield,
  Kf = Le.unstable_requestPaint,
  le = Le.unstable_now,
  Gf = Le.unstable_getCurrentPriorityLevel,
  Ei = Le.unstable_ImmediatePriority,
  ta = Le.unstable_UserBlockingPriority,
  ul = Le.unstable_NormalPriority,
  Yf = Le.unstable_LowPriority,
  ra = Le.unstable_IdlePriority,
  Ml = null,
  be = null
function Xf(e) {
  if (be && typeof be.onCommitFiberRoot == 'function')
    try {
      be.onCommitFiberRoot(Ml, e, void 0, (e.current.flags & 128) === 128)
    } catch {}
}
var Ge = Math.clz32 ? Math.clz32 : qf,
  Zf = Math.log,
  Jf = Math.LN2
function qf(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((Zf(e) / Jf) | 0)) | 0)
}
var Rr = 64,
  jr = 4194304
function Ut(e) {
  switch (e & -e) {
    case 1:
      return 1
    case 2:
      return 2
    case 4:
      return 4
    case 8:
      return 8
    case 16:
      return 16
    case 32:
      return 32
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424
    case 134217728:
      return 134217728
    case 268435456:
      return 268435456
    case 536870912:
      return 536870912
    case 1073741824:
      return 1073741824
    default:
      return e
  }
}
function sl(e, n) {
  var t = e.pendingLanes
  if (t === 0) return 0
  var r = 0,
    l = e.suspendedLanes,
    o = e.pingedLanes,
    u = t & 268435455
  if (u !== 0) {
    var s = u & ~l
    s !== 0 ? (r = Ut(s)) : ((o &= u), o !== 0 && (r = Ut(o)))
  } else ((u = t & ~l), u !== 0 ? (r = Ut(u)) : o !== 0 && (r = Ut(o)))
  if (r === 0) return 0
  if (
    n !== 0 &&
    n !== r &&
    !(n & l) &&
    ((l = r & -r), (o = n & -n), l >= o || (l === 16 && (o & 4194240) !== 0))
  )
    return n
  if ((r & 4 && (r |= t & 16), (n = e.entangledLanes), n !== 0))
    for (e = e.entanglements, n &= r; 0 < n; )
      ((t = 31 - Ge(n)), (l = 1 << t), (r |= e[t]), (n &= ~l))
  return r
}
function bf(e, n) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return n + 250
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return n + 5e3
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1
    default:
      return -1
  }
}
function ed(e, n) {
  for (
    var t = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, o = e.pendingLanes;
    0 < o;

  ) {
    var u = 31 - Ge(o),
      s = 1 << u,
      a = l[u]
    ;(a === -1 ? (!(s & t) || s & r) && (l[u] = bf(s, n)) : a <= n && (e.expiredLanes |= s),
      (o &= ~s))
  }
}
function Do(e) {
  return ((e = e.pendingLanes & -1073741825), e !== 0 ? e : e & 1073741824 ? 1073741824 : 0)
}
function la() {
  var e = Rr
  return ((Rr <<= 1), !(Rr & 4194240) && (Rr = 64), e)
}
function Zl(e) {
  for (var n = [], t = 0; 31 > t; t++) n.push(e)
  return n
}
function kr(e, n, t) {
  ;((e.pendingLanes |= n),
    n !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (n = 31 - Ge(n)),
    (e[n] = t))
}
function nd(e, n) {
  var t = e.pendingLanes & ~n
  ;((e.pendingLanes = n),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.expiredLanes &= n),
    (e.mutableReadLanes &= n),
    (e.entangledLanes &= n),
    (n = e.entanglements))
  var r = e.eventTimes
  for (e = e.expirationTimes; 0 < t; ) {
    var l = 31 - Ge(t),
      o = 1 << l
    ;((n[l] = 0), (r[l] = -1), (e[l] = -1), (t &= ~o))
  }
}
function Ci(e, n) {
  var t = (e.entangledLanes |= n)
  for (e = e.entanglements; t; ) {
    var r = 31 - Ge(t),
      l = 1 << r
    ;((l & n) | (e[r] & n) && (e[r] |= n), (t &= ~l))
  }
}
var V = 0
function oa(e) {
  return ((e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1)
}
var ia,
  _i,
  ua,
  sa,
  aa,
  Io = !1,
  Fr = [],
  _n = null,
  xn = null,
  Pn = null,
  ir = new Map(),
  ur = new Map(),
  Sn = [],
  td =
    'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
      ' '
    )
function Su(e, n) {
  switch (e) {
    case 'focusin':
    case 'focusout':
      _n = null
      break
    case 'dragenter':
    case 'dragleave':
      xn = null
      break
    case 'mouseover':
    case 'mouseout':
      Pn = null
      break
    case 'pointerover':
    case 'pointerout':
      ir.delete(n.pointerId)
      break
    case 'gotpointercapture':
    case 'lostpointercapture':
      ur.delete(n.pointerId)
  }
}
function It(e, n, t, r, l, o) {
  return e === null || e.nativeEvent !== o
    ? ((e = {
        blockedOn: n,
        domEventName: t,
        eventSystemFlags: r,
        nativeEvent: o,
        targetContainers: [l],
      }),
      n !== null && ((n = Cr(n)), n !== null && _i(n)),
      e)
    : ((e.eventSystemFlags |= r),
      (n = e.targetContainers),
      l !== null && n.indexOf(l) === -1 && n.push(l),
      e)
}
function rd(e, n, t, r, l) {
  switch (n) {
    case 'focusin':
      return ((_n = It(_n, e, n, t, r, l)), !0)
    case 'dragenter':
      return ((xn = It(xn, e, n, t, r, l)), !0)
    case 'mouseover':
      return ((Pn = It(Pn, e, n, t, r, l)), !0)
    case 'pointerover':
      var o = l.pointerId
      return (ir.set(o, It(ir.get(o) || null, e, n, t, r, l)), !0)
    case 'gotpointercapture':
      return ((o = l.pointerId), ur.set(o, It(ur.get(o) || null, e, n, t, r, l)), !0)
  }
  return !1
}
function ca(e) {
  var n = Hn(e.target)
  if (n !== null) {
    var t = bn(n)
    if (t !== null) {
      if (((n = t.tag), n === 13)) {
        if (((n = qs(t)), n !== null)) {
          ;((e.blockedOn = n),
            aa(e.priority, function () {
              ua(t)
            }))
          return
        }
      } else if (n === 3 && t.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = t.tag === 3 ? t.stateNode.containerInfo : null
        return
      }
    }
  }
  e.blockedOn = null
}
function Yr(e) {
  if (e.blockedOn !== null) return !1
  for (var n = e.targetContainers; 0 < n.length; ) {
    var t = Oo(e.domEventName, e.eventSystemFlags, n[0], e.nativeEvent)
    if (t === null) {
      t = e.nativeEvent
      var r = new t.constructor(t.type, t)
      ;((Lo = r), t.target.dispatchEvent(r), (Lo = null))
    } else return ((n = Cr(t)), n !== null && _i(n), (e.blockedOn = t), !1)
    n.shift()
  }
  return !0
}
function ku(e, n, t) {
  Yr(e) && t.delete(n)
}
function ld() {
  ;((Io = !1),
    _n !== null && Yr(_n) && (_n = null),
    xn !== null && Yr(xn) && (xn = null),
    Pn !== null && Yr(Pn) && (Pn = null),
    ir.forEach(ku),
    ur.forEach(ku))
}
function Ot(e, n) {
  e.blockedOn === n &&
    ((e.blockedOn = null),
    Io || ((Io = !0), Le.unstable_scheduleCallback(Le.unstable_NormalPriority, ld)))
}
function sr(e) {
  function n(l) {
    return Ot(l, e)
  }
  if (0 < Fr.length) {
    Ot(Fr[0], e)
    for (var t = 1; t < Fr.length; t++) {
      var r = Fr[t]
      r.blockedOn === e && (r.blockedOn = null)
    }
  }
  for (
    _n !== null && Ot(_n, e),
      xn !== null && Ot(xn, e),
      Pn !== null && Ot(Pn, e),
      ir.forEach(n),
      ur.forEach(n),
      t = 0;
    t < Sn.length;
    t++
  )
    ((r = Sn[t]), r.blockedOn === e && (r.blockedOn = null))
  for (; 0 < Sn.length && ((t = Sn[0]), t.blockedOn === null); )
    (ca(t), t.blockedOn === null && Sn.shift())
}
var wt = mn.ReactCurrentBatchConfig,
  al = !0
function od(e, n, t, r) {
  var l = V,
    o = wt.transition
  wt.transition = null
  try {
    ;((V = 1), xi(e, n, t, r))
  } finally {
    ;((V = l), (wt.transition = o))
  }
}
function id(e, n, t, r) {
  var l = V,
    o = wt.transition
  wt.transition = null
  try {
    ;((V = 4), xi(e, n, t, r))
  } finally {
    ;((V = l), (wt.transition = o))
  }
}
function xi(e, n, t, r) {
  if (al) {
    var l = Oo(e, n, t, r)
    if (l === null) (io(e, n, r, cl, t), Su(e, r))
    else if (rd(l, e, n, t, r)) r.stopPropagation()
    else if ((Su(e, r), n & 4 && -1 < td.indexOf(e))) {
      for (; l !== null; ) {
        var o = Cr(l)
        if ((o !== null && ia(o), (o = Oo(e, n, t, r)), o === null && io(e, n, r, cl, t), o === l))
          break
        l = o
      }
      l !== null && r.stopPropagation()
    } else io(e, n, r, null, t)
  }
}
var cl = null
function Oo(e, n, t, r) {
  if (((cl = null), (e = ki(r)), (e = Hn(e)), e !== null))
    if (((n = bn(e)), n === null)) e = null
    else if (((t = n.tag), t === 13)) {
      if (((e = qs(n)), e !== null)) return e
      e = null
    } else if (t === 3) {
      if (n.stateNode.current.memoizedState.isDehydrated)
        return n.tag === 3 ? n.stateNode.containerInfo : null
      e = null
    } else n !== e && (e = null)
  return ((cl = e), null)
}
function fa(e) {
  switch (e) {
    case 'cancel':
    case 'click':
    case 'close':
    case 'contextmenu':
    case 'copy':
    case 'cut':
    case 'auxclick':
    case 'dblclick':
    case 'dragend':
    case 'dragstart':
    case 'drop':
    case 'focusin':
    case 'focusout':
    case 'input':
    case 'invalid':
    case 'keydown':
    case 'keypress':
    case 'keyup':
    case 'mousedown':
    case 'mouseup':
    case 'paste':
    case 'pause':
    case 'play':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'ratechange':
    case 'reset':
    case 'resize':
    case 'seeked':
    case 'submit':
    case 'touchcancel':
    case 'touchend':
    case 'touchstart':
    case 'volumechange':
    case 'change':
    case 'selectionchange':
    case 'textInput':
    case 'compositionstart':
    case 'compositionend':
    case 'compositionupdate':
    case 'beforeblur':
    case 'afterblur':
    case 'beforeinput':
    case 'blur':
    case 'fullscreenchange':
    case 'focus':
    case 'hashchange':
    case 'popstate':
    case 'select':
    case 'selectstart':
      return 1
    case 'drag':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'scroll':
    case 'toggle':
    case 'touchmove':
    case 'wheel':
    case 'mouseenter':
    case 'mouseleave':
    case 'pointerenter':
    case 'pointerleave':
      return 4
    case 'message':
      switch (Gf()) {
        case Ei:
          return 1
        case ta:
          return 4
        case ul:
        case Yf:
          return 16
        case ra:
          return 536870912
        default:
          return 16
      }
    default:
      return 16
  }
}
var En = null,
  Pi = null,
  Xr = null
function da() {
  if (Xr) return Xr
  var e,
    n = Pi,
    t = n.length,
    r,
    l = 'value' in En ? En.value : En.textContent,
    o = l.length
  for (e = 0; e < t && n[e] === l[e]; e++);
  var u = t - e
  for (r = 1; r <= u && n[t - r] === l[o - r]; r++);
  return (Xr = l.slice(e, 1 < r ? 1 - r : void 0))
}
function Zr(e) {
  var n = e.keyCode
  return (
    'charCode' in e ? ((e = e.charCode), e === 0 && n === 13 && (e = 13)) : (e = n),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  )
}
function Dr() {
  return !0
}
function Eu() {
  return !1
}
function je(e) {
  function n(t, r, l, o, u) {
    ;((this._reactName = t),
      (this._targetInst = l),
      (this.type = r),
      (this.nativeEvent = o),
      (this.target = u),
      (this.currentTarget = null))
    for (var s in e) e.hasOwnProperty(s) && ((t = e[s]), (this[s] = t ? t(o) : o[s]))
    return (
      (this.isDefaultPrevented = (
        o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1
      )
        ? Dr
        : Eu),
      (this.isPropagationStopped = Eu),
      this
    )
  }
  return (
    b(n.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0
        var t = this.nativeEvent
        t &&
          (t.preventDefault
            ? t.preventDefault()
            : typeof t.returnValue != 'unknown' && (t.returnValue = !1),
          (this.isDefaultPrevented = Dr))
      },
      stopPropagation: function () {
        var t = this.nativeEvent
        t &&
          (t.stopPropagation
            ? t.stopPropagation()
            : typeof t.cancelBubble != 'unknown' && (t.cancelBubble = !0),
          (this.isPropagationStopped = Dr))
      },
      persist: function () {},
      isPersistent: Dr,
    }),
    n
  )
}
var zt = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now()
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  Ti = je(zt),
  Er = b({}, zt, { view: 0, detail: 0 }),
  ud = je(Er),
  Jl,
  ql,
  Bt,
  zl = b({}, Er, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Ni,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget
    },
    movementX: function (e) {
      return 'movementX' in e
        ? e.movementX
        : (e !== Bt &&
            (Bt && e.type === 'mousemove'
              ? ((Jl = e.screenX - Bt.screenX), (ql = e.screenY - Bt.screenY))
              : (ql = Jl = 0),
            (Bt = e)),
          Jl)
    },
    movementY: function (e) {
      return 'movementY' in e ? e.movementY : ql
    },
  }),
  Cu = je(zl),
  sd = b({}, zl, { dataTransfer: 0 }),
  ad = je(sd),
  cd = b({}, Er, { relatedTarget: 0 }),
  bl = je(cd),
  fd = b({}, zt, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  dd = je(fd),
  pd = b({}, zt, {
    clipboardData: function (e) {
      return 'clipboardData' in e ? e.clipboardData : window.clipboardData
    },
  }),
  hd = je(pd),
  md = b({}, zt, { data: 0 }),
  _u = je(md),
  yd = {
    Esc: 'Escape',
    Spacebar: ' ',
    Left: 'ArrowLeft',
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Del: 'Delete',
    Win: 'OS',
    Menu: 'ContextMenu',
    Apps: 'ContextMenu',
    Scroll: 'ScrollLock',
    MozPrintableKey: 'Unidentified',
  },
  vd = {
    8: 'Backspace',
    9: 'Tab',
    12: 'Clear',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    19: 'Pause',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    45: 'Insert',
    46: 'Delete',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    144: 'NumLock',
    145: 'ScrollLock',
    224: 'Meta',
  },
  gd = { Alt: 'altKey', Control: 'ctrlKey', Meta: 'metaKey', Shift: 'shiftKey' }
function wd(e) {
  var n = this.nativeEvent
  return n.getModifierState ? n.getModifierState(e) : (e = gd[e]) ? !!n[e] : !1
}
function Ni() {
  return wd
}
var Sd = b({}, Er, {
    key: function (e) {
      if (e.key) {
        var n = yd[e.key] || e.key
        if (n !== 'Unidentified') return n
      }
      return e.type === 'keypress'
        ? ((e = Zr(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
        : e.type === 'keydown' || e.type === 'keyup'
          ? vd[e.keyCode] || 'Unidentified'
          : ''
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Ni,
    charCode: function (e) {
      return e.type === 'keypress' ? Zr(e) : 0
    },
    keyCode: function (e) {
      return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0
    },
    which: function (e) {
      return e.type === 'keypress'
        ? Zr(e)
        : e.type === 'keydown' || e.type === 'keyup'
          ? e.keyCode
          : 0
    },
  }),
  kd = je(Sd),
  Ed = b({}, zl, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  xu = je(Ed),
  Cd = b({}, Er, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Ni,
  }),
  _d = je(Cd),
  xd = b({}, zt, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Pd = je(xd),
  Td = b({}, zl, {
    deltaX: function (e) {
      return 'deltaX' in e ? e.deltaX : 'wheelDeltaX' in e ? -e.wheelDeltaX : 0
    },
    deltaY: function (e) {
      return 'deltaY' in e
        ? e.deltaY
        : 'wheelDeltaY' in e
          ? -e.wheelDeltaY
          : 'wheelDelta' in e
            ? -e.wheelDelta
            : 0
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  Nd = je(Td),
  Md = [9, 13, 27, 32],
  Mi = fn && 'CompositionEvent' in window,
  Zt = null
fn && 'documentMode' in document && (Zt = document.documentMode)
var zd = fn && 'TextEvent' in window && !Zt,
  pa = fn && (!Mi || (Zt && 8 < Zt && 11 >= Zt)),
  Pu = ' ',
  Tu = !1
function ha(e, n) {
  switch (e) {
    case 'keyup':
      return Md.indexOf(n.keyCode) !== -1
    case 'keydown':
      return n.keyCode !== 229
    case 'keypress':
    case 'mousedown':
    case 'focusout':
      return !0
    default:
      return !1
  }
}
function ma(e) {
  return ((e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null)
}
var it = !1
function Ld(e, n) {
  switch (e) {
    case 'compositionend':
      return ma(n)
    case 'keypress':
      return n.which !== 32 ? null : ((Tu = !0), Pu)
    case 'textInput':
      return ((e = n.data), e === Pu && Tu ? null : e)
    default:
      return null
  }
}
function Rd(e, n) {
  if (it)
    return e === 'compositionend' || (!Mi && ha(e, n))
      ? ((e = da()), (Xr = Pi = En = null), (it = !1), e)
      : null
  switch (e) {
    case 'paste':
      return null
    case 'keypress':
      if (!(n.ctrlKey || n.altKey || n.metaKey) || (n.ctrlKey && n.altKey)) {
        if (n.char && 1 < n.char.length) return n.char
        if (n.which) return String.fromCharCode(n.which)
      }
      return null
    case 'compositionend':
      return pa && n.locale !== 'ko' ? null : n.data
    default:
      return null
  }
}
var jd = {
  color: !0,
  date: !0,
  datetime: !0,
  'datetime-local': !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
}
function Nu(e) {
  var n = e && e.nodeName && e.nodeName.toLowerCase()
  return n === 'input' ? !!jd[e.type] : n === 'textarea'
}
function ya(e, n, t, r) {
  ;(Gs(r),
    (n = fl(n, 'onChange')),
    0 < n.length &&
      ((t = new Ti('onChange', 'change', null, t, r)), e.push({ event: t, listeners: n })))
}
var Jt = null,
  ar = null
function Fd(e) {
  Ta(e, 0)
}
function Ll(e) {
  var n = at(e)
  if ($s(n)) return e
}
function Dd(e, n) {
  if (e === 'change') return n
}
var va = !1
if (fn) {
  var eo
  if (fn) {
    var no = 'oninput' in document
    if (!no) {
      var Mu = document.createElement('div')
      ;(Mu.setAttribute('oninput', 'return;'), (no = typeof Mu.oninput == 'function'))
    }
    eo = no
  } else eo = !1
  va = eo && (!document.documentMode || 9 < document.documentMode)
}
function zu() {
  Jt && (Jt.detachEvent('onpropertychange', ga), (ar = Jt = null))
}
function ga(e) {
  if (e.propertyName === 'value' && Ll(ar)) {
    var n = []
    ;(ya(n, ar, e, ki(e)), Js(Fd, n))
  }
}
function Id(e, n, t) {
  e === 'focusin'
    ? (zu(), (Jt = n), (ar = t), Jt.attachEvent('onpropertychange', ga))
    : e === 'focusout' && zu()
}
function Od(e) {
  if (e === 'selectionchange' || e === 'keyup' || e === 'keydown') return Ll(ar)
}
function Bd(e, n) {
  if (e === 'click') return Ll(n)
}
function Ad(e, n) {
  if (e === 'input' || e === 'change') return Ll(n)
}
function $d(e, n) {
  return (e === n && (e !== 0 || 1 / e === 1 / n)) || (e !== e && n !== n)
}
var Xe = typeof Object.is == 'function' ? Object.is : $d
function cr(e, n) {
  if (Xe(e, n)) return !0
  if (typeof e != 'object' || e === null || typeof n != 'object' || n === null) return !1
  var t = Object.keys(e),
    r = Object.keys(n)
  if (t.length !== r.length) return !1
  for (r = 0; r < t.length; r++) {
    var l = t[r]
    if (!wo.call(n, l) || !Xe(e[l], n[l])) return !1
  }
  return !0
}
function Lu(e) {
  for (; e && e.firstChild; ) e = e.firstChild
  return e
}
function Ru(e, n) {
  var t = Lu(e)
  e = 0
  for (var r; t; ) {
    if (t.nodeType === 3) {
      if (((r = e + t.textContent.length), e <= n && r >= n)) return { node: t, offset: n - e }
      e = r
    }
    e: {
      for (; t; ) {
        if (t.nextSibling) {
          t = t.nextSibling
          break e
        }
        t = t.parentNode
      }
      t = void 0
    }
    t = Lu(t)
  }
}
function wa(e, n) {
  return e && n
    ? e === n
      ? !0
      : e && e.nodeType === 3
        ? !1
        : n && n.nodeType === 3
          ? wa(e, n.parentNode)
          : 'contains' in e
            ? e.contains(n)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(n) & 16)
              : !1
    : !1
}
function Sa() {
  for (var e = window, n = ll(); n instanceof e.HTMLIFrameElement; ) {
    try {
      var t = typeof n.contentWindow.location.href == 'string'
    } catch {
      t = !1
    }
    if (t) e = n.contentWindow
    else break
    n = ll(e.document)
  }
  return n
}
function zi(e) {
  var n = e && e.nodeName && e.nodeName.toLowerCase()
  return (
    n &&
    ((n === 'input' &&
      (e.type === 'text' ||
        e.type === 'search' ||
        e.type === 'tel' ||
        e.type === 'url' ||
        e.type === 'password')) ||
      n === 'textarea' ||
      e.contentEditable === 'true')
  )
}
function Wd(e) {
  var n = Sa(),
    t = e.focusedElem,
    r = e.selectionRange
  if (n !== t && t && t.ownerDocument && wa(t.ownerDocument.documentElement, t)) {
    if (r !== null && zi(t)) {
      if (((n = r.start), (e = r.end), e === void 0 && (e = n), 'selectionStart' in t))
        ((t.selectionStart = n), (t.selectionEnd = Math.min(e, t.value.length)))
      else if (
        ((e = ((n = t.ownerDocument || document) && n.defaultView) || window), e.getSelection)
      ) {
        e = e.getSelection()
        var l = t.textContent.length,
          o = Math.min(r.start, l)
        ;((r = r.end === void 0 ? o : Math.min(r.end, l)),
          !e.extend && o > r && ((l = r), (r = o), (o = l)),
          (l = Ru(t, o)))
        var u = Ru(t, r)
        l &&
          u &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== l.node ||
            e.anchorOffset !== l.offset ||
            e.focusNode !== u.node ||
            e.focusOffset !== u.offset) &&
          ((n = n.createRange()),
          n.setStart(l.node, l.offset),
          e.removeAllRanges(),
          o > r
            ? (e.addRange(n), e.extend(u.node, u.offset))
            : (n.setEnd(u.node, u.offset), e.addRange(n)))
      }
    }
    for (n = [], e = t; (e = e.parentNode); )
      e.nodeType === 1 && n.push({ element: e, left: e.scrollLeft, top: e.scrollTop })
    for (typeof t.focus == 'function' && t.focus(), t = 0; t < n.length; t++)
      ((e = n[t]), (e.element.scrollLeft = e.left), (e.element.scrollTop = e.top))
  }
}
var Hd = fn && 'documentMode' in document && 11 >= document.documentMode,
  ut = null,
  Bo = null,
  qt = null,
  Ao = !1
function ju(e, n, t) {
  var r = t.window === t ? t.document : t.nodeType === 9 ? t : t.ownerDocument
  Ao ||
    ut == null ||
    ut !== ll(r) ||
    ((r = ut),
    'selectionStart' in r && zi(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = ((r.ownerDocument && r.ownerDocument.defaultView) || window).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (qt && cr(qt, r)) ||
      ((qt = r),
      (r = fl(Bo, 'onSelect')),
      0 < r.length &&
        ((n = new Ti('onSelect', 'select', null, n, t)),
        e.push({ event: n, listeners: r }),
        (n.target = ut))))
}
function Ir(e, n) {
  var t = {}
  return (
    (t[e.toLowerCase()] = n.toLowerCase()),
    (t['Webkit' + e] = 'webkit' + n),
    (t['Moz' + e] = 'moz' + n),
    t
  )
}
var st = {
    animationend: Ir('Animation', 'AnimationEnd'),
    animationiteration: Ir('Animation', 'AnimationIteration'),
    animationstart: Ir('Animation', 'AnimationStart'),
    transitionend: Ir('Transition', 'TransitionEnd'),
  },
  to = {},
  ka = {}
fn &&
  ((ka = document.createElement('div').style),
  'AnimationEvent' in window ||
    (delete st.animationend.animation,
    delete st.animationiteration.animation,
    delete st.animationstart.animation),
  'TransitionEvent' in window || delete st.transitionend.transition)
function Rl(e) {
  if (to[e]) return to[e]
  if (!st[e]) return e
  var n = st[e],
    t
  for (t in n) if (n.hasOwnProperty(t) && t in ka) return (to[e] = n[t])
  return e
}
var Ea = Rl('animationend'),
  Ca = Rl('animationiteration'),
  _a = Rl('animationstart'),
  xa = Rl('transitionend'),
  Pa = new Map(),
  Fu =
    'abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
      ' '
    )
function Fn(e, n) {
  ;(Pa.set(e, n), qn(n, [e]))
}
for (var ro = 0; ro < Fu.length; ro++) {
  var lo = Fu[ro],
    Vd = lo.toLowerCase(),
    Ud = lo[0].toUpperCase() + lo.slice(1)
  Fn(Vd, 'on' + Ud)
}
Fn(Ea, 'onAnimationEnd')
Fn(Ca, 'onAnimationIteration')
Fn(_a, 'onAnimationStart')
Fn('dblclick', 'onDoubleClick')
Fn('focusin', 'onFocus')
Fn('focusout', 'onBlur')
Fn(xa, 'onTransitionEnd')
Et('onMouseEnter', ['mouseout', 'mouseover'])
Et('onMouseLeave', ['mouseout', 'mouseover'])
Et('onPointerEnter', ['pointerout', 'pointerover'])
Et('onPointerLeave', ['pointerout', 'pointerover'])
qn('onChange', 'change click focusin focusout input keydown keyup selectionchange'.split(' '))
qn(
  'onSelect',
  'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(' ')
)
qn('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste'])
qn('onCompositionEnd', 'compositionend focusout keydown keypress keyup mousedown'.split(' '))
qn('onCompositionStart', 'compositionstart focusout keydown keypress keyup mousedown'.split(' '))
qn('onCompositionUpdate', 'compositionupdate focusout keydown keypress keyup mousedown'.split(' '))
var Qt =
    'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
      ' '
    ),
  Qd = new Set('cancel close invalid load scroll toggle'.split(' ').concat(Qt))
function Du(e, n, t) {
  var r = e.type || 'unknown-event'
  ;((e.currentTarget = t), Vf(r, n, void 0, e), (e.currentTarget = null))
}
function Ta(e, n) {
  n = (n & 4) !== 0
  for (var t = 0; t < e.length; t++) {
    var r = e[t],
      l = r.event
    r = r.listeners
    e: {
      var o = void 0
      if (n)
        for (var u = r.length - 1; 0 <= u; u--) {
          var s = r[u],
            a = s.instance,
            h = s.currentTarget
          if (((s = s.listener), a !== o && l.isPropagationStopped())) break e
          ;(Du(l, s, h), (o = a))
        }
      else
        for (u = 0; u < r.length; u++) {
          if (
            ((s = r[u]),
            (a = s.instance),
            (h = s.currentTarget),
            (s = s.listener),
            a !== o && l.isPropagationStopped())
          )
            break e
          ;(Du(l, s, h), (o = a))
        }
    }
  }
  if (il) throw ((e = Fo), (il = !1), (Fo = null), e)
}
function Q(e, n) {
  var t = n[Uo]
  t === void 0 && (t = n[Uo] = new Set())
  var r = e + '__bubble'
  t.has(r) || (Na(n, e, 2, !1), t.add(r))
}
function oo(e, n, t) {
  var r = 0
  ;(n && (r |= 4), Na(t, e, r, n))
}
var Or = '_reactListening' + Math.random().toString(36).slice(2)
function fr(e) {
  if (!e[Or]) {
    ;((e[Or] = !0),
      Ds.forEach(function (t) {
        t !== 'selectionchange' && (Qd.has(t) || oo(t, !1, e), oo(t, !0, e))
      }))
    var n = e.nodeType === 9 ? e : e.ownerDocument
    n === null || n[Or] || ((n[Or] = !0), oo('selectionchange', !1, n))
  }
}
function Na(e, n, t, r) {
  switch (fa(n)) {
    case 1:
      var l = od
      break
    case 4:
      l = id
      break
    default:
      l = xi
  }
  ;((t = l.bind(null, n, t, e)),
    (l = void 0),
    !jo || (n !== 'touchstart' && n !== 'touchmove' && n !== 'wheel') || (l = !0),
    r
      ? l !== void 0
        ? e.addEventListener(n, t, { capture: !0, passive: l })
        : e.addEventListener(n, t, !0)
      : l !== void 0
        ? e.addEventListener(n, t, { passive: l })
        : e.addEventListener(n, t, !1))
}
function io(e, n, t, r, l) {
  var o = r
  if (!(n & 1) && !(n & 2) && r !== null)
    e: for (;;) {
      if (r === null) return
      var u = r.tag
      if (u === 3 || u === 4) {
        var s = r.stateNode.containerInfo
        if (s === l || (s.nodeType === 8 && s.parentNode === l)) break
        if (u === 4)
          for (u = r.return; u !== null; ) {
            var a = u.tag
            if (
              (a === 3 || a === 4) &&
              ((a = u.stateNode.containerInfo), a === l || (a.nodeType === 8 && a.parentNode === l))
            )
              return
            u = u.return
          }
        for (; s !== null; ) {
          if (((u = Hn(s)), u === null)) return
          if (((a = u.tag), a === 5 || a === 6)) {
            r = o = u
            continue e
          }
          s = s.parentNode
        }
      }
      r = r.return
    }
  Js(function () {
    var h = o,
      w = ki(t),
      v = []
    e: {
      var g = Pa.get(e)
      if (g !== void 0) {
        var C = Ti,
          x = e
        switch (e) {
          case 'keypress':
            if (Zr(t) === 0) break e
          case 'keydown':
          case 'keyup':
            C = kd
            break
          case 'focusin':
            ;((x = 'focus'), (C = bl))
            break
          case 'focusout':
            ;((x = 'blur'), (C = bl))
            break
          case 'beforeblur':
          case 'afterblur':
            C = bl
            break
          case 'click':
            if (t.button === 2) break e
          case 'auxclick':
          case 'dblclick':
          case 'mousedown':
          case 'mousemove':
          case 'mouseup':
          case 'mouseout':
          case 'mouseover':
          case 'contextmenu':
            C = Cu
            break
          case 'drag':
          case 'dragend':
          case 'dragenter':
          case 'dragexit':
          case 'dragleave':
          case 'dragover':
          case 'dragstart':
          case 'drop':
            C = ad
            break
          case 'touchcancel':
          case 'touchend':
          case 'touchmove':
          case 'touchstart':
            C = _d
            break
          case Ea:
          case Ca:
          case _a:
            C = dd
            break
          case xa:
            C = Pd
            break
          case 'scroll':
            C = ud
            break
          case 'wheel':
            C = Nd
            break
          case 'copy':
          case 'cut':
          case 'paste':
            C = hd
            break
          case 'gotpointercapture':
          case 'lostpointercapture':
          case 'pointercancel':
          case 'pointerdown':
          case 'pointermove':
          case 'pointerout':
          case 'pointerover':
          case 'pointerup':
            C = xu
        }
        var _ = (n & 4) !== 0,
          H = !_ && e === 'scroll',
          m = _ ? (g !== null ? g + 'Capture' : null) : g
        _ = []
        for (var d = h, y; d !== null; ) {
          y = d
          var S = y.stateNode
          if (
            (y.tag === 5 &&
              S !== null &&
              ((y = S), m !== null && ((S = or(d, m)), S != null && _.push(dr(d, S, y)))),
            H)
          )
            break
          d = d.return
        }
        0 < _.length && ((g = new C(g, x, null, t, w)), v.push({ event: g, listeners: _ }))
      }
    }
    if (!(n & 7)) {
      e: {
        if (
          ((g = e === 'mouseover' || e === 'pointerover'),
          (C = e === 'mouseout' || e === 'pointerout'),
          g && t !== Lo && (x = t.relatedTarget || t.fromElement) && (Hn(x) || x[dn]))
        )
          break e
        if (
          (C || g) &&
          ((g =
            w.window === w ? w : (g = w.ownerDocument) ? g.defaultView || g.parentWindow : window),
          C
            ? ((x = t.relatedTarget || t.toElement),
              (C = h),
              (x = x ? Hn(x) : null),
              x !== null && ((H = bn(x)), x !== H || (x.tag !== 5 && x.tag !== 6)) && (x = null))
            : ((C = null), (x = h)),
          C !== x)
        ) {
          if (
            ((_ = Cu),
            (S = 'onMouseLeave'),
            (m = 'onMouseEnter'),
            (d = 'mouse'),
            (e === 'pointerout' || e === 'pointerover') &&
              ((_ = xu), (S = 'onPointerLeave'), (m = 'onPointerEnter'), (d = 'pointer')),
            (H = C == null ? g : at(C)),
            (y = x == null ? g : at(x)),
            (g = new _(S, d + 'leave', C, t, w)),
            (g.target = H),
            (g.relatedTarget = y),
            (S = null),
            Hn(w) === h &&
              ((_ = new _(m, d + 'enter', x, t, w)),
              (_.target = y),
              (_.relatedTarget = H),
              (S = _)),
            (H = S),
            C && x)
          )
            n: {
              for (_ = C, m = x, d = 0, y = _; y; y = rt(y)) d++
              for (y = 0, S = m; S; S = rt(S)) y++
              for (; 0 < d - y; ) ((_ = rt(_)), d--)
              for (; 0 < y - d; ) ((m = rt(m)), y--)
              for (; d--; ) {
                if (_ === m || (m !== null && _ === m.alternate)) break n
                ;((_ = rt(_)), (m = rt(m)))
              }
              _ = null
            }
          else _ = null
          ;(C !== null && Iu(v, g, C, _, !1), x !== null && H !== null && Iu(v, H, x, _, !0))
        }
      }
      e: {
        if (
          ((g = h ? at(h) : window),
          (C = g.nodeName && g.nodeName.toLowerCase()),
          C === 'select' || (C === 'input' && g.type === 'file'))
        )
          var N = Dd
        else if (Nu(g))
          if (va) N = Ad
          else {
            N = Od
            var z = Id
          }
        else
          (C = g.nodeName) &&
            C.toLowerCase() === 'input' &&
            (g.type === 'checkbox' || g.type === 'radio') &&
            (N = Bd)
        if (N && (N = N(e, h))) {
          ya(v, N, t, w)
          break e
        }
        ;(z && z(e, g, h),
          e === 'focusout' &&
            (z = g._wrapperState) &&
            z.controlled &&
            g.type === 'number' &&
            Po(g, 'number', g.value))
      }
      switch (((z = h ? at(h) : window), e)) {
        case 'focusin':
          ;(Nu(z) || z.contentEditable === 'true') && ((ut = z), (Bo = h), (qt = null))
          break
        case 'focusout':
          qt = Bo = ut = null
          break
        case 'mousedown':
          Ao = !0
          break
        case 'contextmenu':
        case 'mouseup':
        case 'dragend':
          ;((Ao = !1), ju(v, t, w))
          break
        case 'selectionchange':
          if (Hd) break
        case 'keydown':
        case 'keyup':
          ju(v, t, w)
      }
      var L
      if (Mi)
        e: {
          switch (e) {
            case 'compositionstart':
              var R = 'onCompositionStart'
              break e
            case 'compositionend':
              R = 'onCompositionEnd'
              break e
            case 'compositionupdate':
              R = 'onCompositionUpdate'
              break e
          }
          R = void 0
        }
      else
        it
          ? ha(e, t) && (R = 'onCompositionEnd')
          : e === 'keydown' && t.keyCode === 229 && (R = 'onCompositionStart')
      ;(R &&
        (pa &&
          t.locale !== 'ko' &&
          (it || R !== 'onCompositionStart'
            ? R === 'onCompositionEnd' && it && (L = da())
            : ((En = w), (Pi = 'value' in En ? En.value : En.textContent), (it = !0))),
        (z = fl(h, R)),
        0 < z.length &&
          ((R = new _u(R, e, null, t, w)),
          v.push({ event: R, listeners: z }),
          L ? (R.data = L) : ((L = ma(t)), L !== null && (R.data = L)))),
        (L = zd ? Ld(e, t) : Rd(e, t)) &&
          ((h = fl(h, 'onBeforeInput')),
          0 < h.length &&
            ((w = new _u('onBeforeInput', 'beforeinput', null, t, w)),
            v.push({ event: w, listeners: h }),
            (w.data = L))))
    }
    Ta(v, n)
  })
}
function dr(e, n, t) {
  return { instance: e, listener: n, currentTarget: t }
}
function fl(e, n) {
  for (var t = n + 'Capture', r = []; e !== null; ) {
    var l = e,
      o = l.stateNode
    ;(l.tag === 5 &&
      o !== null &&
      ((l = o),
      (o = or(e, t)),
      o != null && r.unshift(dr(e, o, l)),
      (o = or(e, n)),
      o != null && r.push(dr(e, o, l))),
      (e = e.return))
  }
  return r
}
function rt(e) {
  if (e === null) return null
  do e = e.return
  while (e && e.tag !== 5)
  return e || null
}
function Iu(e, n, t, r, l) {
  for (var o = n._reactName, u = []; t !== null && t !== r; ) {
    var s = t,
      a = s.alternate,
      h = s.stateNode
    if (a !== null && a === r) break
    ;(s.tag === 5 &&
      h !== null &&
      ((s = h),
      l
        ? ((a = or(t, o)), a != null && u.unshift(dr(t, a, s)))
        : l || ((a = or(t, o)), a != null && u.push(dr(t, a, s)))),
      (t = t.return))
  }
  u.length !== 0 && e.push({ event: n, listeners: u })
}
var Kd = /\r\n?/g,
  Gd = /\u0000|\uFFFD/g
function Ou(e) {
  return (typeof e == 'string' ? e : '' + e)
    .replace(
      Kd,
      `
`
    )
    .replace(Gd, '')
}
function Br(e, n, t) {
  if (((n = Ou(n)), Ou(e) !== n && t)) throw Error(E(425))
}
function dl() {}
var $o = null,
  Wo = null
function Ho(e, n) {
  return (
    e === 'textarea' ||
    e === 'noscript' ||
    typeof n.children == 'string' ||
    typeof n.children == 'number' ||
    (typeof n.dangerouslySetInnerHTML == 'object' &&
      n.dangerouslySetInnerHTML !== null &&
      n.dangerouslySetInnerHTML.__html != null)
  )
}
var Vo = typeof setTimeout == 'function' ? setTimeout : void 0,
  Yd = typeof clearTimeout == 'function' ? clearTimeout : void 0,
  Bu = typeof Promise == 'function' ? Promise : void 0,
  Xd =
    typeof queueMicrotask == 'function'
      ? queueMicrotask
      : typeof Bu < 'u'
        ? function (e) {
            return Bu.resolve(null).then(e).catch(Zd)
          }
        : Vo
function Zd(e) {
  setTimeout(function () {
    throw e
  })
}
function uo(e, n) {
  var t = n,
    r = 0
  do {
    var l = t.nextSibling
    if ((e.removeChild(t), l && l.nodeType === 8))
      if (((t = l.data), t === '/$')) {
        if (r === 0) {
          ;(e.removeChild(l), sr(n))
          return
        }
        r--
      } else (t !== '$' && t !== '$?' && t !== '$!') || r++
    t = l
  } while (t)
  sr(n)
}
function Tn(e) {
  for (; e != null; e = e.nextSibling) {
    var n = e.nodeType
    if (n === 1 || n === 3) break
    if (n === 8) {
      if (((n = e.data), n === '$' || n === '$!' || n === '$?')) break
      if (n === '/$') return null
    }
  }
  return e
}
function Au(e) {
  e = e.previousSibling
  for (var n = 0; e; ) {
    if (e.nodeType === 8) {
      var t = e.data
      if (t === '$' || t === '$!' || t === '$?') {
        if (n === 0) return e
        n--
      } else t === '/$' && n++
    }
    e = e.previousSibling
  }
  return null
}
var Lt = Math.random().toString(36).slice(2),
  qe = '__reactFiber$' + Lt,
  pr = '__reactProps$' + Lt,
  dn = '__reactContainer$' + Lt,
  Uo = '__reactEvents$' + Lt,
  Jd = '__reactListeners$' + Lt,
  qd = '__reactHandles$' + Lt
function Hn(e) {
  var n = e[qe]
  if (n) return n
  for (var t = e.parentNode; t; ) {
    if ((n = t[dn] || t[qe])) {
      if (((t = n.alternate), n.child !== null || (t !== null && t.child !== null)))
        for (e = Au(e); e !== null; ) {
          if ((t = e[qe])) return t
          e = Au(e)
        }
      return n
    }
    ;((e = t), (t = e.parentNode))
  }
  return null
}
function Cr(e) {
  return (
    (e = e[qe] || e[dn]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  )
}
function at(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode
  throw Error(E(33))
}
function jl(e) {
  return e[pr] || null
}
var Qo = [],
  ct = -1
function Dn(e) {
  return { current: e }
}
function K(e) {
  0 > ct || ((e.current = Qo[ct]), (Qo[ct] = null), ct--)
}
function U(e, n) {
  ;(ct++, (Qo[ct] = e.current), (e.current = n))
}
var jn = {},
  ve = Dn(jn),
  _e = Dn(!1),
  Gn = jn
function Ct(e, n) {
  var t = e.type.contextTypes
  if (!t) return jn
  var r = e.stateNode
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === n)
    return r.__reactInternalMemoizedMaskedChildContext
  var l = {},
    o
  for (o in t) l[o] = n[o]
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = n),
      (e.__reactInternalMemoizedMaskedChildContext = l)),
    l
  )
}
function xe(e) {
  return ((e = e.childContextTypes), e != null)
}
function pl() {
  ;(K(_e), K(ve))
}
function $u(e, n, t) {
  if (ve.current !== jn) throw Error(E(168))
  ;(U(ve, n), U(_e, t))
}
function Ma(e, n, t) {
  var r = e.stateNode
  if (((n = n.childContextTypes), typeof r.getChildContext != 'function')) return t
  r = r.getChildContext()
  for (var l in r) if (!(l in n)) throw Error(E(108, If(e) || 'Unknown', l))
  return b({}, t, r)
}
function hl(e) {
  return (
    (e = ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || jn),
    (Gn = ve.current),
    U(ve, e),
    U(_e, _e.current),
    !0
  )
}
function Wu(e, n, t) {
  var r = e.stateNode
  if (!r) throw Error(E(169))
  ;(t
    ? ((e = Ma(e, n, Gn)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      K(_e),
      K(ve),
      U(ve, e))
    : K(_e),
    U(_e, t))
}
var un = null,
  Fl = !1,
  so = !1
function za(e) {
  un === null ? (un = [e]) : un.push(e)
}
function bd(e) {
  ;((Fl = !0), za(e))
}
function In() {
  if (!so && un !== null) {
    so = !0
    var e = 0,
      n = V
    try {
      var t = un
      for (V = 1; e < t.length; e++) {
        var r = t[e]
        do r = r(!0)
        while (r !== null)
      }
      ;((un = null), (Fl = !1))
    } catch (l) {
      throw (un !== null && (un = un.slice(e + 1)), na(Ei, In), l)
    } finally {
      ;((V = n), (so = !1))
    }
  }
  return null
}
var ft = [],
  dt = 0,
  ml = null,
  yl = 0,
  De = [],
  Ie = 0,
  Yn = null,
  sn = 1,
  an = ''
function $n(e, n) {
  ;((ft[dt++] = yl), (ft[dt++] = ml), (ml = e), (yl = n))
}
function La(e, n, t) {
  ;((De[Ie++] = sn), (De[Ie++] = an), (De[Ie++] = Yn), (Yn = e))
  var r = sn
  e = an
  var l = 32 - Ge(r) - 1
  ;((r &= ~(1 << l)), (t += 1))
  var o = 32 - Ge(n) + l
  if (30 < o) {
    var u = l - (l % 5)
    ;((o = (r & ((1 << u) - 1)).toString(32)),
      (r >>= u),
      (l -= u),
      (sn = (1 << (32 - Ge(n) + l)) | (t << l) | r),
      (an = o + e))
  } else ((sn = (1 << o) | (t << l) | r), (an = e))
}
function Li(e) {
  e.return !== null && ($n(e, 1), La(e, 1, 0))
}
function Ri(e) {
  for (; e === ml; ) ((ml = ft[--dt]), (ft[dt] = null), (yl = ft[--dt]), (ft[dt] = null))
  for (; e === Yn; )
    ((Yn = De[--Ie]),
      (De[Ie] = null),
      (an = De[--Ie]),
      (De[Ie] = null),
      (sn = De[--Ie]),
      (De[Ie] = null))
}
var ze = null,
  Me = null,
  X = !1,
  Ke = null
function Ra(e, n) {
  var t = Oe(5, null, null, 0)
  ;((t.elementType = 'DELETED'),
    (t.stateNode = n),
    (t.return = e),
    (n = e.deletions),
    n === null ? ((e.deletions = [t]), (e.flags |= 16)) : n.push(t))
}
function Hu(e, n) {
  switch (e.tag) {
    case 5:
      var t = e.type
      return (
        (n = n.nodeType !== 1 || t.toLowerCase() !== n.nodeName.toLowerCase() ? null : n),
        n !== null ? ((e.stateNode = n), (ze = e), (Me = Tn(n.firstChild)), !0) : !1
      )
    case 6:
      return (
        (n = e.pendingProps === '' || n.nodeType !== 3 ? null : n),
        n !== null ? ((e.stateNode = n), (ze = e), (Me = null), !0) : !1
      )
    case 13:
      return (
        (n = n.nodeType !== 8 ? null : n),
        n !== null
          ? ((t = Yn !== null ? { id: sn, overflow: an } : null),
            (e.memoizedState = { dehydrated: n, treeContext: t, retryLane: 1073741824 }),
            (t = Oe(18, null, null, 0)),
            (t.stateNode = n),
            (t.return = e),
            (e.child = t),
            (ze = e),
            (Me = null),
            !0)
          : !1
      )
    default:
      return !1
  }
}
function Ko(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0
}
function Go(e) {
  if (X) {
    var n = Me
    if (n) {
      var t = n
      if (!Hu(e, n)) {
        if (Ko(e)) throw Error(E(418))
        n = Tn(t.nextSibling)
        var r = ze
        n && Hu(e, n) ? Ra(r, t) : ((e.flags = (e.flags & -4097) | 2), (X = !1), (ze = e))
      }
    } else {
      if (Ko(e)) throw Error(E(418))
      ;((e.flags = (e.flags & -4097) | 2), (X = !1), (ze = e))
    }
  }
}
function Vu(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return
  ze = e
}
function Ar(e) {
  if (e !== ze) return !1
  if (!X) return (Vu(e), (X = !0), !1)
  var n
  if (
    ((n = e.tag !== 3) &&
      !(n = e.tag !== 5) &&
      ((n = e.type), (n = n !== 'head' && n !== 'body' && !Ho(e.type, e.memoizedProps))),
    n && (n = Me))
  ) {
    if (Ko(e)) throw (ja(), Error(E(418)))
    for (; n; ) (Ra(e, n), (n = Tn(n.nextSibling)))
  }
  if ((Vu(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(E(317))
    e: {
      for (e = e.nextSibling, n = 0; e; ) {
        if (e.nodeType === 8) {
          var t = e.data
          if (t === '/$') {
            if (n === 0) {
              Me = Tn(e.nextSibling)
              break e
            }
            n--
          } else (t !== '$' && t !== '$!' && t !== '$?') || n++
        }
        e = e.nextSibling
      }
      Me = null
    }
  } else Me = ze ? Tn(e.stateNode.nextSibling) : null
  return !0
}
function ja() {
  for (var e = Me; e; ) e = Tn(e.nextSibling)
}
function _t() {
  ;((Me = ze = null), (X = !1))
}
function ji(e) {
  Ke === null ? (Ke = [e]) : Ke.push(e)
}
var ep = mn.ReactCurrentBatchConfig
function At(e, n, t) {
  if (((e = t.ref), e !== null && typeof e != 'function' && typeof e != 'object')) {
    if (t._owner) {
      if (((t = t._owner), t)) {
        if (t.tag !== 1) throw Error(E(309))
        var r = t.stateNode
      }
      if (!r) throw Error(E(147, e))
      var l = r,
        o = '' + e
      return n !== null && n.ref !== null && typeof n.ref == 'function' && n.ref._stringRef === o
        ? n.ref
        : ((n = function (u) {
            var s = l.refs
            u === null ? delete s[o] : (s[o] = u)
          }),
          (n._stringRef = o),
          n)
    }
    if (typeof e != 'string') throw Error(E(284))
    if (!t._owner) throw Error(E(290, e))
  }
  return e
}
function $r(e, n) {
  throw (
    (e = Object.prototype.toString.call(n)),
    Error(
      E(31, e === '[object Object]' ? 'object with keys {' + Object.keys(n).join(', ') + '}' : e)
    )
  )
}
function Uu(e) {
  var n = e._init
  return n(e._payload)
}
function Fa(e) {
  function n(m, d) {
    if (e) {
      var y = m.deletions
      y === null ? ((m.deletions = [d]), (m.flags |= 16)) : y.push(d)
    }
  }
  function t(m, d) {
    if (!e) return null
    for (; d !== null; ) (n(m, d), (d = d.sibling))
    return null
  }
  function r(m, d) {
    for (m = new Map(); d !== null; )
      (d.key !== null ? m.set(d.key, d) : m.set(d.index, d), (d = d.sibling))
    return m
  }
  function l(m, d) {
    return ((m = Ln(m, d)), (m.index = 0), (m.sibling = null), m)
  }
  function o(m, d, y) {
    return (
      (m.index = y),
      e
        ? ((y = m.alternate),
          y !== null ? ((y = y.index), y < d ? ((m.flags |= 2), d) : y) : ((m.flags |= 2), d))
        : ((m.flags |= 1048576), d)
    )
  }
  function u(m) {
    return (e && m.alternate === null && (m.flags |= 2), m)
  }
  function s(m, d, y, S) {
    return d === null || d.tag !== 6
      ? ((d = yo(y, m.mode, S)), (d.return = m), d)
      : ((d = l(d, y)), (d.return = m), d)
  }
  function a(m, d, y, S) {
    var N = y.type
    return N === ot
      ? w(m, d, y.props.children, S, y.key)
      : d !== null &&
          (d.elementType === N ||
            (typeof N == 'object' && N !== null && N.$$typeof === gn && Uu(N) === d.type))
        ? ((S = l(d, y.props)), (S.ref = At(m, d, y)), (S.return = m), S)
        : ((S = rl(y.type, y.key, y.props, null, m.mode, S)),
          (S.ref = At(m, d, y)),
          (S.return = m),
          S)
  }
  function h(m, d, y, S) {
    return d === null ||
      d.tag !== 4 ||
      d.stateNode.containerInfo !== y.containerInfo ||
      d.stateNode.implementation !== y.implementation
      ? ((d = vo(y, m.mode, S)), (d.return = m), d)
      : ((d = l(d, y.children || [])), (d.return = m), d)
  }
  function w(m, d, y, S, N) {
    return d === null || d.tag !== 7
      ? ((d = Kn(y, m.mode, S, N)), (d.return = m), d)
      : ((d = l(d, y)), (d.return = m), d)
  }
  function v(m, d, y) {
    if ((typeof d == 'string' && d !== '') || typeof d == 'number')
      return ((d = yo('' + d, m.mode, y)), (d.return = m), d)
    if (typeof d == 'object' && d !== null) {
      switch (d.$$typeof) {
        case Mr:
          return (
            (y = rl(d.type, d.key, d.props, null, m.mode, y)),
            (y.ref = At(m, null, d)),
            (y.return = m),
            y
          )
        case lt:
          return ((d = vo(d, m.mode, y)), (d.return = m), d)
        case gn:
          var S = d._init
          return v(m, S(d._payload), y)
      }
      if (Vt(d) || Ft(d)) return ((d = Kn(d, m.mode, y, null)), (d.return = m), d)
      $r(m, d)
    }
    return null
  }
  function g(m, d, y, S) {
    var N = d !== null ? d.key : null
    if ((typeof y == 'string' && y !== '') || typeof y == 'number')
      return N !== null ? null : s(m, d, '' + y, S)
    if (typeof y == 'object' && y !== null) {
      switch (y.$$typeof) {
        case Mr:
          return y.key === N ? a(m, d, y, S) : null
        case lt:
          return y.key === N ? h(m, d, y, S) : null
        case gn:
          return ((N = y._init), g(m, d, N(y._payload), S))
      }
      if (Vt(y) || Ft(y)) return N !== null ? null : w(m, d, y, S, null)
      $r(m, y)
    }
    return null
  }
  function C(m, d, y, S, N) {
    if ((typeof S == 'string' && S !== '') || typeof S == 'number')
      return ((m = m.get(y) || null), s(d, m, '' + S, N))
    if (typeof S == 'object' && S !== null) {
      switch (S.$$typeof) {
        case Mr:
          return ((m = m.get(S.key === null ? y : S.key) || null), a(d, m, S, N))
        case lt:
          return ((m = m.get(S.key === null ? y : S.key) || null), h(d, m, S, N))
        case gn:
          var z = S._init
          return C(m, d, y, z(S._payload), N)
      }
      if (Vt(S) || Ft(S)) return ((m = m.get(y) || null), w(d, m, S, N, null))
      $r(d, S)
    }
    return null
  }
  function x(m, d, y, S) {
    for (var N = null, z = null, L = d, R = (d = 0), G = null; L !== null && R < y.length; R++) {
      L.index > R ? ((G = L), (L = null)) : (G = L.sibling)
      var B = g(m, L, y[R], S)
      if (B === null) {
        L === null && (L = G)
        break
      }
      ;(e && L && B.alternate === null && n(m, L),
        (d = o(B, d, R)),
        z === null ? (N = B) : (z.sibling = B),
        (z = B),
        (L = G))
    }
    if (R === y.length) return (t(m, L), X && $n(m, R), N)
    if (L === null) {
      for (; R < y.length; R++)
        ((L = v(m, y[R], S)),
          L !== null && ((d = o(L, d, R)), z === null ? (N = L) : (z.sibling = L), (z = L)))
      return (X && $n(m, R), N)
    }
    for (L = r(m, L); R < y.length; R++)
      ((G = C(L, m, R, y[R], S)),
        G !== null &&
          (e && G.alternate !== null && L.delete(G.key === null ? R : G.key),
          (d = o(G, d, R)),
          z === null ? (N = G) : (z.sibling = G),
          (z = G)))
    return (
      e &&
        L.forEach(function (Fe) {
          return n(m, Fe)
        }),
      X && $n(m, R),
      N
    )
  }
  function _(m, d, y, S) {
    var N = Ft(y)
    if (typeof N != 'function') throw Error(E(150))
    if (((y = N.call(y)), y == null)) throw Error(E(151))
    for (
      var z = (N = null), L = d, R = (d = 0), G = null, B = y.next();
      L !== null && !B.done;
      R++, B = y.next()
    ) {
      L.index > R ? ((G = L), (L = null)) : (G = L.sibling)
      var Fe = g(m, L, B.value, S)
      if (Fe === null) {
        L === null && (L = G)
        break
      }
      ;(e && L && Fe.alternate === null && n(m, L),
        (d = o(Fe, d, R)),
        z === null ? (N = Fe) : (z.sibling = Fe),
        (z = Fe),
        (L = G))
    }
    if (B.done) return (t(m, L), X && $n(m, R), N)
    if (L === null) {
      for (; !B.done; R++, B = y.next())
        ((B = v(m, B.value, S)),
          B !== null && ((d = o(B, d, R)), z === null ? (N = B) : (z.sibling = B), (z = B)))
      return (X && $n(m, R), N)
    }
    for (L = r(m, L); !B.done; R++, B = y.next())
      ((B = C(L, m, R, B.value, S)),
        B !== null &&
          (e && B.alternate !== null && L.delete(B.key === null ? R : B.key),
          (d = o(B, d, R)),
          z === null ? (N = B) : (z.sibling = B),
          (z = B)))
    return (
      e &&
        L.forEach(function (On) {
          return n(m, On)
        }),
      X && $n(m, R),
      N
    )
  }
  function H(m, d, y, S) {
    if (
      (typeof y == 'object' &&
        y !== null &&
        y.type === ot &&
        y.key === null &&
        (y = y.props.children),
      typeof y == 'object' && y !== null)
    ) {
      switch (y.$$typeof) {
        case Mr:
          e: {
            for (var N = y.key, z = d; z !== null; ) {
              if (z.key === N) {
                if (((N = y.type), N === ot)) {
                  if (z.tag === 7) {
                    ;(t(m, z.sibling), (d = l(z, y.props.children)), (d.return = m), (m = d))
                    break e
                  }
                } else if (
                  z.elementType === N ||
                  (typeof N == 'object' && N !== null && N.$$typeof === gn && Uu(N) === z.type)
                ) {
                  ;(t(m, z.sibling),
                    (d = l(z, y.props)),
                    (d.ref = At(m, z, y)),
                    (d.return = m),
                    (m = d))
                  break e
                }
                t(m, z)
                break
              } else n(m, z)
              z = z.sibling
            }
            y.type === ot
              ? ((d = Kn(y.props.children, m.mode, S, y.key)), (d.return = m), (m = d))
              : ((S = rl(y.type, y.key, y.props, null, m.mode, S)),
                (S.ref = At(m, d, y)),
                (S.return = m),
                (m = S))
          }
          return u(m)
        case lt:
          e: {
            for (z = y.key; d !== null; ) {
              if (d.key === z)
                if (
                  d.tag === 4 &&
                  d.stateNode.containerInfo === y.containerInfo &&
                  d.stateNode.implementation === y.implementation
                ) {
                  ;(t(m, d.sibling), (d = l(d, y.children || [])), (d.return = m), (m = d))
                  break e
                } else {
                  t(m, d)
                  break
                }
              else n(m, d)
              d = d.sibling
            }
            ;((d = vo(y, m.mode, S)), (d.return = m), (m = d))
          }
          return u(m)
        case gn:
          return ((z = y._init), H(m, d, z(y._payload), S))
      }
      if (Vt(y)) return x(m, d, y, S)
      if (Ft(y)) return _(m, d, y, S)
      $r(m, y)
    }
    return (typeof y == 'string' && y !== '') || typeof y == 'number'
      ? ((y = '' + y),
        d !== null && d.tag === 6
          ? (t(m, d.sibling), (d = l(d, y)), (d.return = m), (m = d))
          : (t(m, d), (d = yo(y, m.mode, S)), (d.return = m), (m = d)),
        u(m))
      : t(m, d)
  }
  return H
}
var xt = Fa(!0),
  Da = Fa(!1),
  vl = Dn(null),
  gl = null,
  pt = null,
  Fi = null
function Di() {
  Fi = pt = gl = null
}
function Ii(e) {
  var n = vl.current
  ;(K(vl), (e._currentValue = n))
}
function Yo(e, n, t) {
  for (; e !== null; ) {
    var r = e.alternate
    if (
      ((e.childLanes & n) !== n
        ? ((e.childLanes |= n), r !== null && (r.childLanes |= n))
        : r !== null && (r.childLanes & n) !== n && (r.childLanes |= n),
      e === t)
    )
      break
    e = e.return
  }
}
function St(e, n) {
  ;((gl = e),
    (Fi = pt = null),
    (e = e.dependencies),
    e !== null && e.firstContext !== null && (e.lanes & n && (Ce = !0), (e.firstContext = null)))
}
function Ae(e) {
  var n = e._currentValue
  if (Fi !== e)
    if (((e = { context: e, memoizedValue: n, next: null }), pt === null)) {
      if (gl === null) throw Error(E(308))
      ;((pt = e), (gl.dependencies = { lanes: 0, firstContext: e }))
    } else pt = pt.next = e
  return n
}
var Vn = null
function Oi(e) {
  Vn === null ? (Vn = [e]) : Vn.push(e)
}
function Ia(e, n, t, r) {
  var l = n.interleaved
  return (
    l === null ? ((t.next = t), Oi(n)) : ((t.next = l.next), (l.next = t)),
    (n.interleaved = t),
    pn(e, r)
  )
}
function pn(e, n) {
  e.lanes |= n
  var t = e.alternate
  for (t !== null && (t.lanes |= n), t = e, e = e.return; e !== null; )
    ((e.childLanes |= n),
      (t = e.alternate),
      t !== null && (t.childLanes |= n),
      (t = e),
      (e = e.return))
  return t.tag === 3 ? t.stateNode : null
}
var wn = !1
function Bi(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  }
}
function Oa(e, n) {
  ;((e = e.updateQueue),
    n.updateQueue === e &&
      (n.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      }))
}
function cn(e, n) {
  return { eventTime: e, lane: n, tag: 0, payload: null, callback: null, next: null }
}
function Nn(e, n, t) {
  var r = e.updateQueue
  if (r === null) return null
  if (((r = r.shared), W & 2)) {
    var l = r.pending
    return (
      l === null ? (n.next = n) : ((n.next = l.next), (l.next = n)),
      (r.pending = n),
      pn(e, t)
    )
  }
  return (
    (l = r.interleaved),
    l === null ? ((n.next = n), Oi(r)) : ((n.next = l.next), (l.next = n)),
    (r.interleaved = n),
    pn(e, t)
  )
}
function Jr(e, n, t) {
  if (((n = n.updateQueue), n !== null && ((n = n.shared), (t & 4194240) !== 0))) {
    var r = n.lanes
    ;((r &= e.pendingLanes), (t |= r), (n.lanes = t), Ci(e, t))
  }
}
function Qu(e, n) {
  var t = e.updateQueue,
    r = e.alternate
  if (r !== null && ((r = r.updateQueue), t === r)) {
    var l = null,
      o = null
    if (((t = t.firstBaseUpdate), t !== null)) {
      do {
        var u = {
          eventTime: t.eventTime,
          lane: t.lane,
          tag: t.tag,
          payload: t.payload,
          callback: t.callback,
          next: null,
        }
        ;(o === null ? (l = o = u) : (o = o.next = u), (t = t.next))
      } while (t !== null)
      o === null ? (l = o = n) : (o = o.next = n)
    } else l = o = n
    ;((t = {
      baseState: r.baseState,
      firstBaseUpdate: l,
      lastBaseUpdate: o,
      shared: r.shared,
      effects: r.effects,
    }),
      (e.updateQueue = t))
    return
  }
  ;((e = t.lastBaseUpdate),
    e === null ? (t.firstBaseUpdate = n) : (e.next = n),
    (t.lastBaseUpdate = n))
}
function wl(e, n, t, r) {
  var l = e.updateQueue
  wn = !1
  var o = l.firstBaseUpdate,
    u = l.lastBaseUpdate,
    s = l.shared.pending
  if (s !== null) {
    l.shared.pending = null
    var a = s,
      h = a.next
    ;((a.next = null), u === null ? (o = h) : (u.next = h), (u = a))
    var w = e.alternate
    w !== null &&
      ((w = w.updateQueue),
      (s = w.lastBaseUpdate),
      s !== u && (s === null ? (w.firstBaseUpdate = h) : (s.next = h), (w.lastBaseUpdate = a)))
  }
  if (o !== null) {
    var v = l.baseState
    ;((u = 0), (w = h = a = null), (s = o))
    do {
      var g = s.lane,
        C = s.eventTime
      if ((r & g) === g) {
        w !== null &&
          (w = w.next =
            {
              eventTime: C,
              lane: 0,
              tag: s.tag,
              payload: s.payload,
              callback: s.callback,
              next: null,
            })
        e: {
          var x = e,
            _ = s
          switch (((g = n), (C = t), _.tag)) {
            case 1:
              if (((x = _.payload), typeof x == 'function')) {
                v = x.call(C, v, g)
                break e
              }
              v = x
              break e
            case 3:
              x.flags = (x.flags & -65537) | 128
            case 0:
              if (((x = _.payload), (g = typeof x == 'function' ? x.call(C, v, g) : x), g == null))
                break e
              v = b({}, v, g)
              break e
            case 2:
              wn = !0
          }
        }
        s.callback !== null &&
          s.lane !== 0 &&
          ((e.flags |= 64), (g = l.effects), g === null ? (l.effects = [s]) : g.push(s))
      } else
        ((C = {
          eventTime: C,
          lane: g,
          tag: s.tag,
          payload: s.payload,
          callback: s.callback,
          next: null,
        }),
          w === null ? ((h = w = C), (a = v)) : (w = w.next = C),
          (u |= g))
      if (((s = s.next), s === null)) {
        if (((s = l.shared.pending), s === null)) break
        ;((g = s), (s = g.next), (g.next = null), (l.lastBaseUpdate = g), (l.shared.pending = null))
      }
    } while (!0)
    if (
      (w === null && (a = v),
      (l.baseState = a),
      (l.firstBaseUpdate = h),
      (l.lastBaseUpdate = w),
      (n = l.shared.interleaved),
      n !== null)
    ) {
      l = n
      do ((u |= l.lane), (l = l.next))
      while (l !== n)
    } else o === null && (l.shared.lanes = 0)
    ;((Zn |= u), (e.lanes = u), (e.memoizedState = v))
  }
}
function Ku(e, n, t) {
  if (((e = n.effects), (n.effects = null), e !== null))
    for (n = 0; n < e.length; n++) {
      var r = e[n],
        l = r.callback
      if (l !== null) {
        if (((r.callback = null), (r = t), typeof l != 'function')) throw Error(E(191, l))
        l.call(r)
      }
    }
}
var _r = {},
  en = Dn(_r),
  hr = Dn(_r),
  mr = Dn(_r)
function Un(e) {
  if (e === _r) throw Error(E(174))
  return e
}
function Ai(e, n) {
  switch ((U(mr, n), U(hr, e), U(en, _r), (e = n.nodeType), e)) {
    case 9:
    case 11:
      n = (n = n.documentElement) ? n.namespaceURI : No(null, '')
      break
    default:
      ;((e = e === 8 ? n.parentNode : n),
        (n = e.namespaceURI || null),
        (e = e.tagName),
        (n = No(n, e)))
  }
  ;(K(en), U(en, n))
}
function Pt() {
  ;(K(en), K(hr), K(mr))
}
function Ba(e) {
  Un(mr.current)
  var n = Un(en.current),
    t = No(n, e.type)
  n !== t && (U(hr, e), U(en, t))
}
function $i(e) {
  hr.current === e && (K(en), K(hr))
}
var J = Dn(0)
function Sl(e) {
  for (var n = e; n !== null; ) {
    if (n.tag === 13) {
      var t = n.memoizedState
      if (t !== null && ((t = t.dehydrated), t === null || t.data === '$?' || t.data === '$!'))
        return n
    } else if (n.tag === 19 && n.memoizedProps.revealOrder !== void 0) {
      if (n.flags & 128) return n
    } else if (n.child !== null) {
      ;((n.child.return = n), (n = n.child))
      continue
    }
    if (n === e) break
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === e) return null
      n = n.return
    }
    ;((n.sibling.return = n.return), (n = n.sibling))
  }
  return null
}
var ao = []
function Wi() {
  for (var e = 0; e < ao.length; e++) ao[e]._workInProgressVersionPrimary = null
  ao.length = 0
}
var qr = mn.ReactCurrentDispatcher,
  co = mn.ReactCurrentBatchConfig,
  Xn = 0,
  q = null,
  ie = null,
  se = null,
  kl = !1,
  bt = !1,
  yr = 0,
  np = 0
function he() {
  throw Error(E(321))
}
function Hi(e, n) {
  if (n === null) return !1
  for (var t = 0; t < n.length && t < e.length; t++) if (!Xe(e[t], n[t])) return !1
  return !0
}
function Vi(e, n, t, r, l, o) {
  if (
    ((Xn = o),
    (q = n),
    (n.memoizedState = null),
    (n.updateQueue = null),
    (n.lanes = 0),
    (qr.current = e === null || e.memoizedState === null ? op : ip),
    (e = t(r, l)),
    bt)
  ) {
    o = 0
    do {
      if (((bt = !1), (yr = 0), 25 <= o)) throw Error(E(301))
      ;((o += 1), (se = ie = null), (n.updateQueue = null), (qr.current = up), (e = t(r, l)))
    } while (bt)
  }
  if (
    ((qr.current = El),
    (n = ie !== null && ie.next !== null),
    (Xn = 0),
    (se = ie = q = null),
    (kl = !1),
    n)
  )
    throw Error(E(300))
  return e
}
function Ui() {
  var e = yr !== 0
  return ((yr = 0), e)
}
function Je() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null }
  return (se === null ? (q.memoizedState = se = e) : (se = se.next = e), se)
}
function $e() {
  if (ie === null) {
    var e = q.alternate
    e = e !== null ? e.memoizedState : null
  } else e = ie.next
  var n = se === null ? q.memoizedState : se.next
  if (n !== null) ((se = n), (ie = e))
  else {
    if (e === null) throw Error(E(310))
    ;((ie = e),
      (e = {
        memoizedState: ie.memoizedState,
        baseState: ie.baseState,
        baseQueue: ie.baseQueue,
        queue: ie.queue,
        next: null,
      }),
      se === null ? (q.memoizedState = se = e) : (se = se.next = e))
  }
  return se
}
function vr(e, n) {
  return typeof n == 'function' ? n(e) : n
}
function fo(e) {
  var n = $e(),
    t = n.queue
  if (t === null) throw Error(E(311))
  t.lastRenderedReducer = e
  var r = ie,
    l = r.baseQueue,
    o = t.pending
  if (o !== null) {
    if (l !== null) {
      var u = l.next
      ;((l.next = o.next), (o.next = u))
    }
    ;((r.baseQueue = l = o), (t.pending = null))
  }
  if (l !== null) {
    ;((o = l.next), (r = r.baseState))
    var s = (u = null),
      a = null,
      h = o
    do {
      var w = h.lane
      if ((Xn & w) === w)
        (a !== null &&
          (a = a.next =
            {
              lane: 0,
              action: h.action,
              hasEagerState: h.hasEagerState,
              eagerState: h.eagerState,
              next: null,
            }),
          (r = h.hasEagerState ? h.eagerState : e(r, h.action)))
      else {
        var v = {
          lane: w,
          action: h.action,
          hasEagerState: h.hasEagerState,
          eagerState: h.eagerState,
          next: null,
        }
        ;(a === null ? ((s = a = v), (u = r)) : (a = a.next = v), (q.lanes |= w), (Zn |= w))
      }
      h = h.next
    } while (h !== null && h !== o)
    ;(a === null ? (u = r) : (a.next = s),
      Xe(r, n.memoizedState) || (Ce = !0),
      (n.memoizedState = r),
      (n.baseState = u),
      (n.baseQueue = a),
      (t.lastRenderedState = r))
  }
  if (((e = t.interleaved), e !== null)) {
    l = e
    do ((o = l.lane), (q.lanes |= o), (Zn |= o), (l = l.next))
    while (l !== e)
  } else l === null && (t.lanes = 0)
  return [n.memoizedState, t.dispatch]
}
function po(e) {
  var n = $e(),
    t = n.queue
  if (t === null) throw Error(E(311))
  t.lastRenderedReducer = e
  var r = t.dispatch,
    l = t.pending,
    o = n.memoizedState
  if (l !== null) {
    t.pending = null
    var u = (l = l.next)
    do ((o = e(o, u.action)), (u = u.next))
    while (u !== l)
    ;(Xe(o, n.memoizedState) || (Ce = !0),
      (n.memoizedState = o),
      n.baseQueue === null && (n.baseState = o),
      (t.lastRenderedState = o))
  }
  return [o, r]
}
function Aa() {}
function $a(e, n) {
  var t = q,
    r = $e(),
    l = n(),
    o = !Xe(r.memoizedState, l)
  if (
    (o && ((r.memoizedState = l), (Ce = !0)),
    (r = r.queue),
    Qi(Va.bind(null, t, r, e), [e]),
    r.getSnapshot !== n || o || (se !== null && se.memoizedState.tag & 1))
  ) {
    if (((t.flags |= 2048), gr(9, Ha.bind(null, t, r, l, n), void 0, null), ae === null))
      throw Error(E(349))
    Xn & 30 || Wa(t, n, l)
  }
  return l
}
function Wa(e, n, t) {
  ;((e.flags |= 16384),
    (e = { getSnapshot: n, value: t }),
    (n = q.updateQueue),
    n === null
      ? ((n = { lastEffect: null, stores: null }), (q.updateQueue = n), (n.stores = [e]))
      : ((t = n.stores), t === null ? (n.stores = [e]) : t.push(e)))
}
function Ha(e, n, t, r) {
  ;((n.value = t), (n.getSnapshot = r), Ua(n) && Qa(e))
}
function Va(e, n, t) {
  return t(function () {
    Ua(n) && Qa(e)
  })
}
function Ua(e) {
  var n = e.getSnapshot
  e = e.value
  try {
    var t = n()
    return !Xe(e, t)
  } catch {
    return !0
  }
}
function Qa(e) {
  var n = pn(e, 1)
  n !== null && Ye(n, e, 1, -1)
}
function Gu(e) {
  var n = Je()
  return (
    typeof e == 'function' && (e = e()),
    (n.memoizedState = n.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: vr,
      lastRenderedState: e,
    }),
    (n.queue = e),
    (e = e.dispatch = lp.bind(null, q, e)),
    [n.memoizedState, e]
  )
}
function gr(e, n, t, r) {
  return (
    (e = { tag: e, create: n, destroy: t, deps: r, next: null }),
    (n = q.updateQueue),
    n === null
      ? ((n = { lastEffect: null, stores: null }), (q.updateQueue = n), (n.lastEffect = e.next = e))
      : ((t = n.lastEffect),
        t === null
          ? (n.lastEffect = e.next = e)
          : ((r = t.next), (t.next = e), (e.next = r), (n.lastEffect = e))),
    e
  )
}
function Ka() {
  return $e().memoizedState
}
function br(e, n, t, r) {
  var l = Je()
  ;((q.flags |= e), (l.memoizedState = gr(1 | n, t, void 0, r === void 0 ? null : r)))
}
function Dl(e, n, t, r) {
  var l = $e()
  r = r === void 0 ? null : r
  var o = void 0
  if (ie !== null) {
    var u = ie.memoizedState
    if (((o = u.destroy), r !== null && Hi(r, u.deps))) {
      l.memoizedState = gr(n, t, o, r)
      return
    }
  }
  ;((q.flags |= e), (l.memoizedState = gr(1 | n, t, o, r)))
}
function Yu(e, n) {
  return br(8390656, 8, e, n)
}
function Qi(e, n) {
  return Dl(2048, 8, e, n)
}
function Ga(e, n) {
  return Dl(4, 2, e, n)
}
function Ya(e, n) {
  return Dl(4, 4, e, n)
}
function Xa(e, n) {
  if (typeof n == 'function')
    return (
      (e = e()),
      n(e),
      function () {
        n(null)
      }
    )
  if (n != null)
    return (
      (e = e()),
      (n.current = e),
      function () {
        n.current = null
      }
    )
}
function Za(e, n, t) {
  return ((t = t != null ? t.concat([e]) : null), Dl(4, 4, Xa.bind(null, n, e), t))
}
function Ki() {}
function Ja(e, n) {
  var t = $e()
  n = n === void 0 ? null : n
  var r = t.memoizedState
  return r !== null && n !== null && Hi(n, r[1]) ? r[0] : ((t.memoizedState = [e, n]), e)
}
function qa(e, n) {
  var t = $e()
  n = n === void 0 ? null : n
  var r = t.memoizedState
  return r !== null && n !== null && Hi(n, r[1]) ? r[0] : ((e = e()), (t.memoizedState = [e, n]), e)
}
function ba(e, n, t) {
  return Xn & 21
    ? (Xe(t, n) || ((t = la()), (q.lanes |= t), (Zn |= t), (e.baseState = !0)), n)
    : (e.baseState && ((e.baseState = !1), (Ce = !0)), (e.memoizedState = t))
}
function tp(e, n) {
  var t = V
  ;((V = t !== 0 && 4 > t ? t : 4), e(!0))
  var r = co.transition
  co.transition = {}
  try {
    ;(e(!1), n())
  } finally {
    ;((V = t), (co.transition = r))
  }
}
function ec() {
  return $e().memoizedState
}
function rp(e, n, t) {
  var r = zn(e)
  if (((t = { lane: r, action: t, hasEagerState: !1, eagerState: null, next: null }), nc(e)))
    tc(n, t)
  else if (((t = Ia(e, n, t, r)), t !== null)) {
    var l = we()
    ;(Ye(t, e, r, l), rc(t, n, r))
  }
}
function lp(e, n, t) {
  var r = zn(e),
    l = { lane: r, action: t, hasEagerState: !1, eagerState: null, next: null }
  if (nc(e)) tc(n, l)
  else {
    var o = e.alternate
    if (e.lanes === 0 && (o === null || o.lanes === 0) && ((o = n.lastRenderedReducer), o !== null))
      try {
        var u = n.lastRenderedState,
          s = o(u, t)
        if (((l.hasEagerState = !0), (l.eagerState = s), Xe(s, u))) {
          var a = n.interleaved
          ;(a === null ? ((l.next = l), Oi(n)) : ((l.next = a.next), (a.next = l)),
            (n.interleaved = l))
          return
        }
      } catch {
      } finally {
      }
    ;((t = Ia(e, n, l, r)), t !== null && ((l = we()), Ye(t, e, r, l), rc(t, n, r)))
  }
}
function nc(e) {
  var n = e.alternate
  return e === q || (n !== null && n === q)
}
function tc(e, n) {
  bt = kl = !0
  var t = e.pending
  ;(t === null ? (n.next = n) : ((n.next = t.next), (t.next = n)), (e.pending = n))
}
function rc(e, n, t) {
  if (t & 4194240) {
    var r = n.lanes
    ;((r &= e.pendingLanes), (t |= r), (n.lanes = t), Ci(e, t))
  }
}
var El = {
    readContext: Ae,
    useCallback: he,
    useContext: he,
    useEffect: he,
    useImperativeHandle: he,
    useInsertionEffect: he,
    useLayoutEffect: he,
    useMemo: he,
    useReducer: he,
    useRef: he,
    useState: he,
    useDebugValue: he,
    useDeferredValue: he,
    useTransition: he,
    useMutableSource: he,
    useSyncExternalStore: he,
    useId: he,
    unstable_isNewReconciler: !1,
  },
  op = {
    readContext: Ae,
    useCallback: function (e, n) {
      return ((Je().memoizedState = [e, n === void 0 ? null : n]), e)
    },
    useContext: Ae,
    useEffect: Yu,
    useImperativeHandle: function (e, n, t) {
      return ((t = t != null ? t.concat([e]) : null), br(4194308, 4, Xa.bind(null, n, e), t))
    },
    useLayoutEffect: function (e, n) {
      return br(4194308, 4, e, n)
    },
    useInsertionEffect: function (e, n) {
      return br(4, 2, e, n)
    },
    useMemo: function (e, n) {
      var t = Je()
      return ((n = n === void 0 ? null : n), (e = e()), (t.memoizedState = [e, n]), e)
    },
    useReducer: function (e, n, t) {
      var r = Je()
      return (
        (n = t !== void 0 ? t(n) : n),
        (r.memoizedState = r.baseState = n),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: n,
        }),
        (r.queue = e),
        (e = e.dispatch = rp.bind(null, q, e)),
        [r.memoizedState, e]
      )
    },
    useRef: function (e) {
      var n = Je()
      return ((e = { current: e }), (n.memoizedState = e))
    },
    useState: Gu,
    useDebugValue: Ki,
    useDeferredValue: function (e) {
      return (Je().memoizedState = e)
    },
    useTransition: function () {
      var e = Gu(!1),
        n = e[0]
      return ((e = tp.bind(null, e[1])), (Je().memoizedState = e), [n, e])
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, n, t) {
      var r = q,
        l = Je()
      if (X) {
        if (t === void 0) throw Error(E(407))
        t = t()
      } else {
        if (((t = n()), ae === null)) throw Error(E(349))
        Xn & 30 || Wa(r, n, t)
      }
      l.memoizedState = t
      var o = { value: t, getSnapshot: n }
      return (
        (l.queue = o),
        Yu(Va.bind(null, r, o, e), [e]),
        (r.flags |= 2048),
        gr(9, Ha.bind(null, r, o, t, n), void 0, null),
        t
      )
    },
    useId: function () {
      var e = Je(),
        n = ae.identifierPrefix
      if (X) {
        var t = an,
          r = sn
        ;((t = (r & ~(1 << (32 - Ge(r) - 1))).toString(32) + t),
          (n = ':' + n + 'R' + t),
          (t = yr++),
          0 < t && (n += 'H' + t.toString(32)),
          (n += ':'))
      } else ((t = np++), (n = ':' + n + 'r' + t.toString(32) + ':'))
      return (e.memoizedState = n)
    },
    unstable_isNewReconciler: !1,
  },
  ip = {
    readContext: Ae,
    useCallback: Ja,
    useContext: Ae,
    useEffect: Qi,
    useImperativeHandle: Za,
    useInsertionEffect: Ga,
    useLayoutEffect: Ya,
    useMemo: qa,
    useReducer: fo,
    useRef: Ka,
    useState: function () {
      return fo(vr)
    },
    useDebugValue: Ki,
    useDeferredValue: function (e) {
      var n = $e()
      return ba(n, ie.memoizedState, e)
    },
    useTransition: function () {
      var e = fo(vr)[0],
        n = $e().memoizedState
      return [e, n]
    },
    useMutableSource: Aa,
    useSyncExternalStore: $a,
    useId: ec,
    unstable_isNewReconciler: !1,
  },
  up = {
    readContext: Ae,
    useCallback: Ja,
    useContext: Ae,
    useEffect: Qi,
    useImperativeHandle: Za,
    useInsertionEffect: Ga,
    useLayoutEffect: Ya,
    useMemo: qa,
    useReducer: po,
    useRef: Ka,
    useState: function () {
      return po(vr)
    },
    useDebugValue: Ki,
    useDeferredValue: function (e) {
      var n = $e()
      return ie === null ? (n.memoizedState = e) : ba(n, ie.memoizedState, e)
    },
    useTransition: function () {
      var e = po(vr)[0],
        n = $e().memoizedState
      return [e, n]
    },
    useMutableSource: Aa,
    useSyncExternalStore: $a,
    useId: ec,
    unstable_isNewReconciler: !1,
  }
function Ue(e, n) {
  if (e && e.defaultProps) {
    ;((n = b({}, n)), (e = e.defaultProps))
    for (var t in e) n[t] === void 0 && (n[t] = e[t])
    return n
  }
  return n
}
function Xo(e, n, t, r) {
  ;((n = e.memoizedState),
    (t = t(r, n)),
    (t = t == null ? n : b({}, n, t)),
    (e.memoizedState = t),
    e.lanes === 0 && (e.updateQueue.baseState = t))
}
var Il = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? bn(e) === e : !1
  },
  enqueueSetState: function (e, n, t) {
    e = e._reactInternals
    var r = we(),
      l = zn(e),
      o = cn(r, l)
    ;((o.payload = n),
      t != null && (o.callback = t),
      (n = Nn(e, o, l)),
      n !== null && (Ye(n, e, l, r), Jr(n, e, l)))
  },
  enqueueReplaceState: function (e, n, t) {
    e = e._reactInternals
    var r = we(),
      l = zn(e),
      o = cn(r, l)
    ;((o.tag = 1),
      (o.payload = n),
      t != null && (o.callback = t),
      (n = Nn(e, o, l)),
      n !== null && (Ye(n, e, l, r), Jr(n, e, l)))
  },
  enqueueForceUpdate: function (e, n) {
    e = e._reactInternals
    var t = we(),
      r = zn(e),
      l = cn(t, r)
    ;((l.tag = 2),
      n != null && (l.callback = n),
      (n = Nn(e, l, r)),
      n !== null && (Ye(n, e, r, t), Jr(n, e, r)))
  },
}
function Xu(e, n, t, r, l, o, u) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == 'function'
      ? e.shouldComponentUpdate(r, o, u)
      : n.prototype && n.prototype.isPureReactComponent
        ? !cr(t, r) || !cr(l, o)
        : !0
  )
}
function lc(e, n, t) {
  var r = !1,
    l = jn,
    o = n.contextType
  return (
    typeof o == 'object' && o !== null
      ? (o = Ae(o))
      : ((l = xe(n) ? Gn : ve.current),
        (r = n.contextTypes),
        (o = (r = r != null) ? Ct(e, l) : jn)),
    (n = new n(t, o)),
    (e.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null),
    (n.updater = Il),
    (e.stateNode = n),
    (n._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = l),
      (e.__reactInternalMemoizedMaskedChildContext = o)),
    n
  )
}
function Zu(e, n, t, r) {
  ;((e = n.state),
    typeof n.componentWillReceiveProps == 'function' && n.componentWillReceiveProps(t, r),
    typeof n.UNSAFE_componentWillReceiveProps == 'function' &&
      n.UNSAFE_componentWillReceiveProps(t, r),
    n.state !== e && Il.enqueueReplaceState(n, n.state, null))
}
function Zo(e, n, t, r) {
  var l = e.stateNode
  ;((l.props = t), (l.state = e.memoizedState), (l.refs = {}), Bi(e))
  var o = n.contextType
  ;(typeof o == 'object' && o !== null
    ? (l.context = Ae(o))
    : ((o = xe(n) ? Gn : ve.current), (l.context = Ct(e, o))),
    (l.state = e.memoizedState),
    (o = n.getDerivedStateFromProps),
    typeof o == 'function' && (Xo(e, n, o, t), (l.state = e.memoizedState)),
    typeof n.getDerivedStateFromProps == 'function' ||
      typeof l.getSnapshotBeforeUpdate == 'function' ||
      (typeof l.UNSAFE_componentWillMount != 'function' &&
        typeof l.componentWillMount != 'function') ||
      ((n = l.state),
      typeof l.componentWillMount == 'function' && l.componentWillMount(),
      typeof l.UNSAFE_componentWillMount == 'function' && l.UNSAFE_componentWillMount(),
      n !== l.state && Il.enqueueReplaceState(l, l.state, null),
      wl(e, t, l, r),
      (l.state = e.memoizedState)),
    typeof l.componentDidMount == 'function' && (e.flags |= 4194308))
}
function Tt(e, n) {
  try {
    var t = '',
      r = n
    do ((t += Df(r)), (r = r.return))
    while (r)
    var l = t
  } catch (o) {
    l =
      `
Error generating stack: ` +
      o.message +
      `
` +
      o.stack
  }
  return { value: e, source: n, stack: l, digest: null }
}
function ho(e, n, t) {
  return { value: e, source: null, stack: t ?? null, digest: n ?? null }
}
function Jo(e, n) {
  try {
    console.error(n.value)
  } catch (t) {
    setTimeout(function () {
      throw t
    })
  }
}
var sp = typeof WeakMap == 'function' ? WeakMap : Map
function oc(e, n, t) {
  ;((t = cn(-1, t)), (t.tag = 3), (t.payload = { element: null }))
  var r = n.value
  return (
    (t.callback = function () {
      ;(_l || ((_l = !0), (ui = r)), Jo(e, n))
    }),
    t
  )
}
function ic(e, n, t) {
  ;((t = cn(-1, t)), (t.tag = 3))
  var r = e.type.getDerivedStateFromError
  if (typeof r == 'function') {
    var l = n.value
    ;((t.payload = function () {
      return r(l)
    }),
      (t.callback = function () {
        Jo(e, n)
      }))
  }
  var o = e.stateNode
  return (
    o !== null &&
      typeof o.componentDidCatch == 'function' &&
      (t.callback = function () {
        ;(Jo(e, n), typeof r != 'function' && (Mn === null ? (Mn = new Set([this])) : Mn.add(this)))
        var u = n.stack
        this.componentDidCatch(n.value, { componentStack: u !== null ? u : '' })
      }),
    t
  )
}
function Ju(e, n, t) {
  var r = e.pingCache
  if (r === null) {
    r = e.pingCache = new sp()
    var l = new Set()
    r.set(n, l)
  } else ((l = r.get(n)), l === void 0 && ((l = new Set()), r.set(n, l)))
  l.has(t) || (l.add(t), (e = Ep.bind(null, e, n, t)), n.then(e, e))
}
function qu(e) {
  do {
    var n
    if (
      ((n = e.tag === 13) && ((n = e.memoizedState), (n = n !== null ? n.dehydrated !== null : !0)),
      n)
    )
      return e
    e = e.return
  } while (e !== null)
  return null
}
function bu(e, n, t, r, l) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = l), e)
    : (e === n
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (t.flags |= 131072),
          (t.flags &= -52805),
          t.tag === 1 &&
            (t.alternate === null ? (t.tag = 17) : ((n = cn(-1, 1)), (n.tag = 2), Nn(t, n, 1))),
          (t.lanes |= 1)),
      e)
}
var ap = mn.ReactCurrentOwner,
  Ce = !1
function ge(e, n, t, r) {
  n.child = e === null ? Da(n, null, t, r) : xt(n, e.child, t, r)
}
function es(e, n, t, r, l) {
  t = t.render
  var o = n.ref
  return (
    St(n, l),
    (r = Vi(e, n, t, r, o, l)),
    (t = Ui()),
    e !== null && !Ce
      ? ((n.updateQueue = e.updateQueue), (n.flags &= -2053), (e.lanes &= ~l), hn(e, n, l))
      : (X && t && Li(n), (n.flags |= 1), ge(e, n, r, l), n.child)
  )
}
function ns(e, n, t, r, l) {
  if (e === null) {
    var o = t.type
    return typeof o == 'function' &&
      !eu(o) &&
      o.defaultProps === void 0 &&
      t.compare === null &&
      t.defaultProps === void 0
      ? ((n.tag = 15), (n.type = o), uc(e, n, o, r, l))
      : ((e = rl(t.type, null, r, n, n.mode, l)), (e.ref = n.ref), (e.return = n), (n.child = e))
  }
  if (((o = e.child), !(e.lanes & l))) {
    var u = o.memoizedProps
    if (((t = t.compare), (t = t !== null ? t : cr), t(u, r) && e.ref === n.ref)) return hn(e, n, l)
  }
  return ((n.flags |= 1), (e = Ln(o, r)), (e.ref = n.ref), (e.return = n), (n.child = e))
}
function uc(e, n, t, r, l) {
  if (e !== null) {
    var o = e.memoizedProps
    if (cr(o, r) && e.ref === n.ref)
      if (((Ce = !1), (n.pendingProps = r = o), (e.lanes & l) !== 0)) e.flags & 131072 && (Ce = !0)
      else return ((n.lanes = e.lanes), hn(e, n, l))
  }
  return qo(e, n, t, r, l)
}
function sc(e, n, t) {
  var r = n.pendingProps,
    l = r.children,
    o = e !== null ? e.memoizedState : null
  if (r.mode === 'hidden')
    if (!(n.mode & 1))
      ((n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        U(mt, Ne),
        (Ne |= t))
    else {
      if (!(t & 1073741824))
        return (
          (e = o !== null ? o.baseLanes | t : t),
          (n.lanes = n.childLanes = 1073741824),
          (n.memoizedState = { baseLanes: e, cachePool: null, transitions: null }),
          (n.updateQueue = null),
          U(mt, Ne),
          (Ne |= e),
          null
        )
      ;((n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = o !== null ? o.baseLanes : t),
        U(mt, Ne),
        (Ne |= r))
    }
  else
    (o !== null ? ((r = o.baseLanes | t), (n.memoizedState = null)) : (r = t), U(mt, Ne), (Ne |= r))
  return (ge(e, n, l, t), n.child)
}
function ac(e, n) {
  var t = n.ref
  ;((e === null && t !== null) || (e !== null && e.ref !== t)) &&
    ((n.flags |= 512), (n.flags |= 2097152))
}
function qo(e, n, t, r, l) {
  var o = xe(t) ? Gn : ve.current
  return (
    (o = Ct(n, o)),
    St(n, l),
    (t = Vi(e, n, t, r, o, l)),
    (r = Ui()),
    e !== null && !Ce
      ? ((n.updateQueue = e.updateQueue), (n.flags &= -2053), (e.lanes &= ~l), hn(e, n, l))
      : (X && r && Li(n), (n.flags |= 1), ge(e, n, t, l), n.child)
  )
}
function ts(e, n, t, r, l) {
  if (xe(t)) {
    var o = !0
    hl(n)
  } else o = !1
  if ((St(n, l), n.stateNode === null)) (el(e, n), lc(n, t, r), Zo(n, t, r, l), (r = !0))
  else if (e === null) {
    var u = n.stateNode,
      s = n.memoizedProps
    u.props = s
    var a = u.context,
      h = t.contextType
    typeof h == 'object' && h !== null
      ? (h = Ae(h))
      : ((h = xe(t) ? Gn : ve.current), (h = Ct(n, h)))
    var w = t.getDerivedStateFromProps,
      v = typeof w == 'function' || typeof u.getSnapshotBeforeUpdate == 'function'
    ;(v ||
      (typeof u.UNSAFE_componentWillReceiveProps != 'function' &&
        typeof u.componentWillReceiveProps != 'function') ||
      ((s !== r || a !== h) && Zu(n, u, r, h)),
      (wn = !1))
    var g = n.memoizedState
    ;((u.state = g),
      wl(n, r, u, l),
      (a = n.memoizedState),
      s !== r || g !== a || _e.current || wn
        ? (typeof w == 'function' && (Xo(n, t, w, r), (a = n.memoizedState)),
          (s = wn || Xu(n, t, s, r, g, a, h))
            ? (v ||
                (typeof u.UNSAFE_componentWillMount != 'function' &&
                  typeof u.componentWillMount != 'function') ||
                (typeof u.componentWillMount == 'function' && u.componentWillMount(),
                typeof u.UNSAFE_componentWillMount == 'function' && u.UNSAFE_componentWillMount()),
              typeof u.componentDidMount == 'function' && (n.flags |= 4194308))
            : (typeof u.componentDidMount == 'function' && (n.flags |= 4194308),
              (n.memoizedProps = r),
              (n.memoizedState = a)),
          (u.props = r),
          (u.state = a),
          (u.context = h),
          (r = s))
        : (typeof u.componentDidMount == 'function' && (n.flags |= 4194308), (r = !1)))
  } else {
    ;((u = n.stateNode),
      Oa(e, n),
      (s = n.memoizedProps),
      (h = n.type === n.elementType ? s : Ue(n.type, s)),
      (u.props = h),
      (v = n.pendingProps),
      (g = u.context),
      (a = t.contextType),
      typeof a == 'object' && a !== null
        ? (a = Ae(a))
        : ((a = xe(t) ? Gn : ve.current), (a = Ct(n, a))))
    var C = t.getDerivedStateFromProps
    ;((w = typeof C == 'function' || typeof u.getSnapshotBeforeUpdate == 'function') ||
      (typeof u.UNSAFE_componentWillReceiveProps != 'function' &&
        typeof u.componentWillReceiveProps != 'function') ||
      ((s !== v || g !== a) && Zu(n, u, r, a)),
      (wn = !1),
      (g = n.memoizedState),
      (u.state = g),
      wl(n, r, u, l))
    var x = n.memoizedState
    s !== v || g !== x || _e.current || wn
      ? (typeof C == 'function' && (Xo(n, t, C, r), (x = n.memoizedState)),
        (h = wn || Xu(n, t, h, r, g, x, a) || !1)
          ? (w ||
              (typeof u.UNSAFE_componentWillUpdate != 'function' &&
                typeof u.componentWillUpdate != 'function') ||
              (typeof u.componentWillUpdate == 'function' && u.componentWillUpdate(r, x, a),
              typeof u.UNSAFE_componentWillUpdate == 'function' &&
                u.UNSAFE_componentWillUpdate(r, x, a)),
            typeof u.componentDidUpdate == 'function' && (n.flags |= 4),
            typeof u.getSnapshotBeforeUpdate == 'function' && (n.flags |= 1024))
          : (typeof u.componentDidUpdate != 'function' ||
              (s === e.memoizedProps && g === e.memoizedState) ||
              (n.flags |= 4),
            typeof u.getSnapshotBeforeUpdate != 'function' ||
              (s === e.memoizedProps && g === e.memoizedState) ||
              (n.flags |= 1024),
            (n.memoizedProps = r),
            (n.memoizedState = x)),
        (u.props = r),
        (u.state = x),
        (u.context = a),
        (r = h))
      : (typeof u.componentDidUpdate != 'function' ||
          (s === e.memoizedProps && g === e.memoizedState) ||
          (n.flags |= 4),
        typeof u.getSnapshotBeforeUpdate != 'function' ||
          (s === e.memoizedProps && g === e.memoizedState) ||
          (n.flags |= 1024),
        (r = !1))
  }
  return bo(e, n, t, r, o, l)
}
function bo(e, n, t, r, l, o) {
  ac(e, n)
  var u = (n.flags & 128) !== 0
  if (!r && !u) return (l && Wu(n, t, !1), hn(e, n, o))
  ;((r = n.stateNode), (ap.current = n))
  var s = u && typeof t.getDerivedStateFromError != 'function' ? null : r.render()
  return (
    (n.flags |= 1),
    e !== null && u
      ? ((n.child = xt(n, e.child, null, o)), (n.child = xt(n, null, s, o)))
      : ge(e, n, s, o),
    (n.memoizedState = r.state),
    l && Wu(n, t, !0),
    n.child
  )
}
function cc(e) {
  var n = e.stateNode
  ;(n.pendingContext
    ? $u(e, n.pendingContext, n.pendingContext !== n.context)
    : n.context && $u(e, n.context, !1),
    Ai(e, n.containerInfo))
}
function rs(e, n, t, r, l) {
  return (_t(), ji(l), (n.flags |= 256), ge(e, n, t, r), n.child)
}
var ei = { dehydrated: null, treeContext: null, retryLane: 0 }
function ni(e) {
  return { baseLanes: e, cachePool: null, transitions: null }
}
function fc(e, n, t) {
  var r = n.pendingProps,
    l = J.current,
    o = !1,
    u = (n.flags & 128) !== 0,
    s
  if (
    ((s = u) || (s = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0),
    s ? ((o = !0), (n.flags &= -129)) : (e === null || e.memoizedState !== null) && (l |= 1),
    U(J, l & 1),
    e === null)
  )
    return (
      Go(n),
      (e = n.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (n.mode & 1 ? (e.data === '$!' ? (n.lanes = 8) : (n.lanes = 1073741824)) : (n.lanes = 1),
          null)
        : ((u = r.children),
          (e = r.fallback),
          o
            ? ((r = n.mode),
              (o = n.child),
              (u = { mode: 'hidden', children: u }),
              !(r & 1) && o !== null
                ? ((o.childLanes = 0), (o.pendingProps = u))
                : (o = Al(u, r, 0, null)),
              (e = Kn(e, r, t, null)),
              (o.return = n),
              (e.return = n),
              (o.sibling = e),
              (n.child = o),
              (n.child.memoizedState = ni(t)),
              (n.memoizedState = ei),
              e)
            : Gi(n, u))
    )
  if (((l = e.memoizedState), l !== null && ((s = l.dehydrated), s !== null)))
    return cp(e, n, u, r, s, l, t)
  if (o) {
    ;((o = r.fallback), (u = n.mode), (l = e.child), (s = l.sibling))
    var a = { mode: 'hidden', children: r.children }
    return (
      !(u & 1) && n.child !== l
        ? ((r = n.child), (r.childLanes = 0), (r.pendingProps = a), (n.deletions = null))
        : ((r = Ln(l, a)), (r.subtreeFlags = l.subtreeFlags & 14680064)),
      s !== null ? (o = Ln(s, o)) : ((o = Kn(o, u, t, null)), (o.flags |= 2)),
      (o.return = n),
      (r.return = n),
      (r.sibling = o),
      (n.child = r),
      (r = o),
      (o = n.child),
      (u = e.child.memoizedState),
      (u =
        u === null
          ? ni(t)
          : { baseLanes: u.baseLanes | t, cachePool: null, transitions: u.transitions }),
      (o.memoizedState = u),
      (o.childLanes = e.childLanes & ~t),
      (n.memoizedState = ei),
      r
    )
  }
  return (
    (o = e.child),
    (e = o.sibling),
    (r = Ln(o, { mode: 'visible', children: r.children })),
    !(n.mode & 1) && (r.lanes = t),
    (r.return = n),
    (r.sibling = null),
    e !== null &&
      ((t = n.deletions), t === null ? ((n.deletions = [e]), (n.flags |= 16)) : t.push(e)),
    (n.child = r),
    (n.memoizedState = null),
    r
  )
}
function Gi(e, n) {
  return (
    (n = Al({ mode: 'visible', children: n }, e.mode, 0, null)),
    (n.return = e),
    (e.child = n)
  )
}
function Wr(e, n, t, r) {
  return (
    r !== null && ji(r),
    xt(n, e.child, null, t),
    (e = Gi(n, n.pendingProps.children)),
    (e.flags |= 2),
    (n.memoizedState = null),
    e
  )
}
function cp(e, n, t, r, l, o, u) {
  if (t)
    return n.flags & 256
      ? ((n.flags &= -257), (r = ho(Error(E(422)))), Wr(e, n, u, r))
      : n.memoizedState !== null
        ? ((n.child = e.child), (n.flags |= 128), null)
        : ((o = r.fallback),
          (l = n.mode),
          (r = Al({ mode: 'visible', children: r.children }, l, 0, null)),
          (o = Kn(o, l, u, null)),
          (o.flags |= 2),
          (r.return = n),
          (o.return = n),
          (r.sibling = o),
          (n.child = r),
          n.mode & 1 && xt(n, e.child, null, u),
          (n.child.memoizedState = ni(u)),
          (n.memoizedState = ei),
          o)
  if (!(n.mode & 1)) return Wr(e, n, u, null)
  if (l.data === '$!') {
    if (((r = l.nextSibling && l.nextSibling.dataset), r)) var s = r.dgst
    return ((r = s), (o = Error(E(419))), (r = ho(o, r, void 0)), Wr(e, n, u, r))
  }
  if (((s = (u & e.childLanes) !== 0), Ce || s)) {
    if (((r = ae), r !== null)) {
      switch (u & -u) {
        case 4:
          l = 2
          break
        case 16:
          l = 8
          break
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          l = 32
          break
        case 536870912:
          l = 268435456
          break
        default:
          l = 0
      }
      ;((l = l & (r.suspendedLanes | u) ? 0 : l),
        l !== 0 && l !== o.retryLane && ((o.retryLane = l), pn(e, l), Ye(r, e, l, -1)))
    }
    return (bi(), (r = ho(Error(E(421)))), Wr(e, n, u, r))
  }
  return l.data === '$?'
    ? ((n.flags |= 128), (n.child = e.child), (n = Cp.bind(null, e)), (l._reactRetry = n), null)
    : ((e = o.treeContext),
      (Me = Tn(l.nextSibling)),
      (ze = n),
      (X = !0),
      (Ke = null),
      e !== null &&
        ((De[Ie++] = sn),
        (De[Ie++] = an),
        (De[Ie++] = Yn),
        (sn = e.id),
        (an = e.overflow),
        (Yn = n)),
      (n = Gi(n, r.children)),
      (n.flags |= 4096),
      n)
}
function ls(e, n, t) {
  e.lanes |= n
  var r = e.alternate
  ;(r !== null && (r.lanes |= n), Yo(e.return, n, t))
}
function mo(e, n, t, r, l) {
  var o = e.memoizedState
  o === null
    ? (e.memoizedState = {
        isBackwards: n,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: t,
        tailMode: l,
      })
    : ((o.isBackwards = n),
      (o.rendering = null),
      (o.renderingStartTime = 0),
      (o.last = r),
      (o.tail = t),
      (o.tailMode = l))
}
function dc(e, n, t) {
  var r = n.pendingProps,
    l = r.revealOrder,
    o = r.tail
  if ((ge(e, n, r.children, t), (r = J.current), r & 2)) ((r = (r & 1) | 2), (n.flags |= 128))
  else {
    if (e !== null && e.flags & 128)
      e: for (e = n.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && ls(e, t, n)
        else if (e.tag === 19) ls(e, t, n)
        else if (e.child !== null) {
          ;((e.child.return = e), (e = e.child))
          continue
        }
        if (e === n) break e
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === n) break e
          e = e.return
        }
        ;((e.sibling.return = e.return), (e = e.sibling))
      }
    r &= 1
  }
  if ((U(J, r), !(n.mode & 1))) n.memoizedState = null
  else
    switch (l) {
      case 'forwards':
        for (t = n.child, l = null; t !== null; )
          ((e = t.alternate), e !== null && Sl(e) === null && (l = t), (t = t.sibling))
        ;((t = l),
          t === null ? ((l = n.child), (n.child = null)) : ((l = t.sibling), (t.sibling = null)),
          mo(n, !1, l, t, o))
        break
      case 'backwards':
        for (t = null, l = n.child, n.child = null; l !== null; ) {
          if (((e = l.alternate), e !== null && Sl(e) === null)) {
            n.child = l
            break
          }
          ;((e = l.sibling), (l.sibling = t), (t = l), (l = e))
        }
        mo(n, !0, t, null, o)
        break
      case 'together':
        mo(n, !1, null, null, void 0)
        break
      default:
        n.memoizedState = null
    }
  return n.child
}
function el(e, n) {
  !(n.mode & 1) && e !== null && ((e.alternate = null), (n.alternate = null), (n.flags |= 2))
}
function hn(e, n, t) {
  if ((e !== null && (n.dependencies = e.dependencies), (Zn |= n.lanes), !(t & n.childLanes)))
    return null
  if (e !== null && n.child !== e.child) throw Error(E(153))
  if (n.child !== null) {
    for (e = n.child, t = Ln(e, e.pendingProps), n.child = t, t.return = n; e.sibling !== null; )
      ((e = e.sibling), (t = t.sibling = Ln(e, e.pendingProps)), (t.return = n))
    t.sibling = null
  }
  return n.child
}
function fp(e, n, t) {
  switch (n.tag) {
    case 3:
      ;(cc(n), _t())
      break
    case 5:
      Ba(n)
      break
    case 1:
      xe(n.type) && hl(n)
      break
    case 4:
      Ai(n, n.stateNode.containerInfo)
      break
    case 10:
      var r = n.type._context,
        l = n.memoizedProps.value
      ;(U(vl, r._currentValue), (r._currentValue = l))
      break
    case 13:
      if (((r = n.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (U(J, J.current & 1), (n.flags |= 128), null)
          : t & n.child.childLanes
            ? fc(e, n, t)
            : (U(J, J.current & 1), (e = hn(e, n, t)), e !== null ? e.sibling : null)
      U(J, J.current & 1)
      break
    case 19:
      if (((r = (t & n.childLanes) !== 0), e.flags & 128)) {
        if (r) return dc(e, n, t)
        n.flags |= 128
      }
      if (
        ((l = n.memoizedState),
        l !== null && ((l.rendering = null), (l.tail = null), (l.lastEffect = null)),
        U(J, J.current),
        r)
      )
        break
      return null
    case 22:
    case 23:
      return ((n.lanes = 0), sc(e, n, t))
  }
  return hn(e, n, t)
}
var pc, ti, hc, mc
pc = function (e, n) {
  for (var t = n.child; t !== null; ) {
    if (t.tag === 5 || t.tag === 6) e.appendChild(t.stateNode)
    else if (t.tag !== 4 && t.child !== null) {
      ;((t.child.return = t), (t = t.child))
      continue
    }
    if (t === n) break
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === n) return
      t = t.return
    }
    ;((t.sibling.return = t.return), (t = t.sibling))
  }
}
ti = function () {}
hc = function (e, n, t, r) {
  var l = e.memoizedProps
  if (l !== r) {
    ;((e = n.stateNode), Un(en.current))
    var o = null
    switch (t) {
      case 'input':
        ;((l = _o(e, l)), (r = _o(e, r)), (o = []))
        break
      case 'select':
        ;((l = b({}, l, { value: void 0 })), (r = b({}, r, { value: void 0 })), (o = []))
        break
      case 'textarea':
        ;((l = To(e, l)), (r = To(e, r)), (o = []))
        break
      default:
        typeof l.onClick != 'function' && typeof r.onClick == 'function' && (e.onclick = dl)
    }
    Mo(t, r)
    var u
    t = null
    for (h in l)
      if (!r.hasOwnProperty(h) && l.hasOwnProperty(h) && l[h] != null)
        if (h === 'style') {
          var s = l[h]
          for (u in s) s.hasOwnProperty(u) && (t || (t = {}), (t[u] = ''))
        } else
          h !== 'dangerouslySetInnerHTML' &&
            h !== 'children' &&
            h !== 'suppressContentEditableWarning' &&
            h !== 'suppressHydrationWarning' &&
            h !== 'autoFocus' &&
            (rr.hasOwnProperty(h) ? o || (o = []) : (o = o || []).push(h, null))
    for (h in r) {
      var a = r[h]
      if (
        ((s = l != null ? l[h] : void 0),
        r.hasOwnProperty(h) && a !== s && (a != null || s != null))
      )
        if (h === 'style')
          if (s) {
            for (u in s)
              !s.hasOwnProperty(u) || (a && a.hasOwnProperty(u)) || (t || (t = {}), (t[u] = ''))
            for (u in a) a.hasOwnProperty(u) && s[u] !== a[u] && (t || (t = {}), (t[u] = a[u]))
          } else (t || (o || (o = []), o.push(h, t)), (t = a))
        else
          h === 'dangerouslySetInnerHTML'
            ? ((a = a ? a.__html : void 0),
              (s = s ? s.__html : void 0),
              a != null && s !== a && (o = o || []).push(h, a))
            : h === 'children'
              ? (typeof a != 'string' && typeof a != 'number') || (o = o || []).push(h, '' + a)
              : h !== 'suppressContentEditableWarning' &&
                h !== 'suppressHydrationWarning' &&
                (rr.hasOwnProperty(h)
                  ? (a != null && h === 'onScroll' && Q('scroll', e), o || s === a || (o = []))
                  : (o = o || []).push(h, a))
    }
    t && (o = o || []).push('style', t)
    var h = o
    ;(n.updateQueue = h) && (n.flags |= 4)
  }
}
mc = function (e, n, t, r) {
  t !== r && (n.flags |= 4)
}
function $t(e, n) {
  if (!X)
    switch (e.tailMode) {
      case 'hidden':
        n = e.tail
        for (var t = null; n !== null; ) (n.alternate !== null && (t = n), (n = n.sibling))
        t === null ? (e.tail = null) : (t.sibling = null)
        break
      case 'collapsed':
        t = e.tail
        for (var r = null; t !== null; ) (t.alternate !== null && (r = t), (t = t.sibling))
        r === null
          ? n || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (r.sibling = null)
    }
}
function me(e) {
  var n = e.alternate !== null && e.alternate.child === e.child,
    t = 0,
    r = 0
  if (n)
    for (var l = e.child; l !== null; )
      ((t |= l.lanes | l.childLanes),
        (r |= l.subtreeFlags & 14680064),
        (r |= l.flags & 14680064),
        (l.return = e),
        (l = l.sibling))
  else
    for (l = e.child; l !== null; )
      ((t |= l.lanes | l.childLanes),
        (r |= l.subtreeFlags),
        (r |= l.flags),
        (l.return = e),
        (l = l.sibling))
  return ((e.subtreeFlags |= r), (e.childLanes = t), n)
}
function dp(e, n, t) {
  var r = n.pendingProps
  switch ((Ri(n), n.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return (me(n), null)
    case 1:
      return (xe(n.type) && pl(), me(n), null)
    case 3:
      return (
        (r = n.stateNode),
        Pt(),
        K(_e),
        K(ve),
        Wi(),
        r.pendingContext && ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (Ar(n)
            ? (n.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(n.flags & 256)) ||
              ((n.flags |= 1024), Ke !== null && (ci(Ke), (Ke = null)))),
        ti(e, n),
        me(n),
        null
      )
    case 5:
      $i(n)
      var l = Un(mr.current)
      if (((t = n.type), e !== null && n.stateNode != null))
        (hc(e, n, t, r, l), e.ref !== n.ref && ((n.flags |= 512), (n.flags |= 2097152)))
      else {
        if (!r) {
          if (n.stateNode === null) throw Error(E(166))
          return (me(n), null)
        }
        if (((e = Un(en.current)), Ar(n))) {
          ;((r = n.stateNode), (t = n.type))
          var o = n.memoizedProps
          switch (((r[qe] = n), (r[pr] = o), (e = (n.mode & 1) !== 0), t)) {
            case 'dialog':
              ;(Q('cancel', r), Q('close', r))
              break
            case 'iframe':
            case 'object':
            case 'embed':
              Q('load', r)
              break
            case 'video':
            case 'audio':
              for (l = 0; l < Qt.length; l++) Q(Qt[l], r)
              break
            case 'source':
              Q('error', r)
              break
            case 'img':
            case 'image':
            case 'link':
              ;(Q('error', r), Q('load', r))
              break
            case 'details':
              Q('toggle', r)
              break
            case 'input':
              ;(pu(r, o), Q('invalid', r))
              break
            case 'select':
              ;((r._wrapperState = { wasMultiple: !!o.multiple }), Q('invalid', r))
              break
            case 'textarea':
              ;(mu(r, o), Q('invalid', r))
          }
          ;(Mo(t, o), (l = null))
          for (var u in o)
            if (o.hasOwnProperty(u)) {
              var s = o[u]
              u === 'children'
                ? typeof s == 'string'
                  ? r.textContent !== s &&
                    (o.suppressHydrationWarning !== !0 && Br(r.textContent, s, e),
                    (l = ['children', s]))
                  : typeof s == 'number' &&
                    r.textContent !== '' + s &&
                    (o.suppressHydrationWarning !== !0 && Br(r.textContent, s, e),
                    (l = ['children', '' + s]))
                : rr.hasOwnProperty(u) && s != null && u === 'onScroll' && Q('scroll', r)
            }
          switch (t) {
            case 'input':
              ;(zr(r), hu(r, o, !0))
              break
            case 'textarea':
              ;(zr(r), yu(r))
              break
            case 'select':
            case 'option':
              break
            default:
              typeof o.onClick == 'function' && (r.onclick = dl)
          }
          ;((r = l), (n.updateQueue = r), r !== null && (n.flags |= 4))
        } else {
          ;((u = l.nodeType === 9 ? l : l.ownerDocument),
            e === 'http://www.w3.org/1999/xhtml' && (e = Vs(t)),
            e === 'http://www.w3.org/1999/xhtml'
              ? t === 'script'
                ? ((e = u.createElement('div')),
                  (e.innerHTML = '<script><\/script>'),
                  (e = e.removeChild(e.firstChild)))
                : typeof r.is == 'string'
                  ? (e = u.createElement(t, { is: r.is }))
                  : ((e = u.createElement(t)),
                    t === 'select' &&
                      ((u = e), r.multiple ? (u.multiple = !0) : r.size && (u.size = r.size)))
              : (e = u.createElementNS(e, t)),
            (e[qe] = n),
            (e[pr] = r),
            pc(e, n, !1, !1),
            (n.stateNode = e))
          e: {
            switch (((u = zo(t, r)), t)) {
              case 'dialog':
                ;(Q('cancel', e), Q('close', e), (l = r))
                break
              case 'iframe':
              case 'object':
              case 'embed':
                ;(Q('load', e), (l = r))
                break
              case 'video':
              case 'audio':
                for (l = 0; l < Qt.length; l++) Q(Qt[l], e)
                l = r
                break
              case 'source':
                ;(Q('error', e), (l = r))
                break
              case 'img':
              case 'image':
              case 'link':
                ;(Q('error', e), Q('load', e), (l = r))
                break
              case 'details':
                ;(Q('toggle', e), (l = r))
                break
              case 'input':
                ;(pu(e, r), (l = _o(e, r)), Q('invalid', e))
                break
              case 'option':
                l = r
                break
              case 'select':
                ;((e._wrapperState = { wasMultiple: !!r.multiple }),
                  (l = b({}, r, { value: void 0 })),
                  Q('invalid', e))
                break
              case 'textarea':
                ;(mu(e, r), (l = To(e, r)), Q('invalid', e))
                break
              default:
                l = r
            }
            ;(Mo(t, l), (s = l))
            for (o in s)
              if (s.hasOwnProperty(o)) {
                var a = s[o]
                o === 'style'
                  ? Ks(e, a)
                  : o === 'dangerouslySetInnerHTML'
                    ? ((a = a ? a.__html : void 0), a != null && Us(e, a))
                    : o === 'children'
                      ? typeof a == 'string'
                        ? (t !== 'textarea' || a !== '') && lr(e, a)
                        : typeof a == 'number' && lr(e, '' + a)
                      : o !== 'suppressContentEditableWarning' &&
                        o !== 'suppressHydrationWarning' &&
                        o !== 'autoFocus' &&
                        (rr.hasOwnProperty(o)
                          ? a != null && o === 'onScroll' && Q('scroll', e)
                          : a != null && vi(e, o, a, u))
              }
            switch (t) {
              case 'input':
                ;(zr(e), hu(e, r, !1))
                break
              case 'textarea':
                ;(zr(e), yu(e))
                break
              case 'option':
                r.value != null && e.setAttribute('value', '' + Rn(r.value))
                break
              case 'select':
                ;((e.multiple = !!r.multiple),
                  (o = r.value),
                  o != null
                    ? yt(e, !!r.multiple, o, !1)
                    : r.defaultValue != null && yt(e, !!r.multiple, r.defaultValue, !0))
                break
              default:
                typeof l.onClick == 'function' && (e.onclick = dl)
            }
            switch (t) {
              case 'button':
              case 'input':
              case 'select':
              case 'textarea':
                r = !!r.autoFocus
                break e
              case 'img':
                r = !0
                break e
              default:
                r = !1
            }
          }
          r && (n.flags |= 4)
        }
        n.ref !== null && ((n.flags |= 512), (n.flags |= 2097152))
      }
      return (me(n), null)
    case 6:
      if (e && n.stateNode != null) mc(e, n, e.memoizedProps, r)
      else {
        if (typeof r != 'string' && n.stateNode === null) throw Error(E(166))
        if (((t = Un(mr.current)), Un(en.current), Ar(n))) {
          if (
            ((r = n.stateNode),
            (t = n.memoizedProps),
            (r[qe] = n),
            (o = r.nodeValue !== t) && ((e = ze), e !== null))
          )
            switch (e.tag) {
              case 3:
                Br(r.nodeValue, t, (e.mode & 1) !== 0)
                break
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  Br(r.nodeValue, t, (e.mode & 1) !== 0)
            }
          o && (n.flags |= 4)
        } else
          ((r = (t.nodeType === 9 ? t : t.ownerDocument).createTextNode(r)),
            (r[qe] = n),
            (n.stateNode = r))
      }
      return (me(n), null)
    case 13:
      if (
        (K(J),
        (r = n.memoizedState),
        e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (X && Me !== null && n.mode & 1 && !(n.flags & 128))
          (ja(), _t(), (n.flags |= 98560), (o = !1))
        else if (((o = Ar(n)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!o) throw Error(E(318))
            if (((o = n.memoizedState), (o = o !== null ? o.dehydrated : null), !o))
              throw Error(E(317))
            o[qe] = n
          } else (_t(), !(n.flags & 128) && (n.memoizedState = null), (n.flags |= 4))
          ;(me(n), (o = !1))
        } else (Ke !== null && (ci(Ke), (Ke = null)), (o = !0))
        if (!o) return n.flags & 65536 ? n : null
      }
      return n.flags & 128
        ? ((n.lanes = t), n)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((n.child.flags |= 8192),
            n.mode & 1 && (e === null || J.current & 1 ? ue === 0 && (ue = 3) : bi())),
          n.updateQueue !== null && (n.flags |= 4),
          me(n),
          null)
    case 4:
      return (Pt(), ti(e, n), e === null && fr(n.stateNode.containerInfo), me(n), null)
    case 10:
      return (Ii(n.type._context), me(n), null)
    case 17:
      return (xe(n.type) && pl(), me(n), null)
    case 19:
      if ((K(J), (o = n.memoizedState), o === null)) return (me(n), null)
      if (((r = (n.flags & 128) !== 0), (u = o.rendering), u === null))
        if (r) $t(o, !1)
        else {
          if (ue !== 0 || (e !== null && e.flags & 128))
            for (e = n.child; e !== null; ) {
              if (((u = Sl(e)), u !== null)) {
                for (
                  n.flags |= 128,
                    $t(o, !1),
                    r = u.updateQueue,
                    r !== null && ((n.updateQueue = r), (n.flags |= 4)),
                    n.subtreeFlags = 0,
                    r = t,
                    t = n.child;
                  t !== null;

                )
                  ((o = t),
                    (e = r),
                    (o.flags &= 14680066),
                    (u = o.alternate),
                    u === null
                      ? ((o.childLanes = 0),
                        (o.lanes = e),
                        (o.child = null),
                        (o.subtreeFlags = 0),
                        (o.memoizedProps = null),
                        (o.memoizedState = null),
                        (o.updateQueue = null),
                        (o.dependencies = null),
                        (o.stateNode = null))
                      : ((o.childLanes = u.childLanes),
                        (o.lanes = u.lanes),
                        (o.child = u.child),
                        (o.subtreeFlags = 0),
                        (o.deletions = null),
                        (o.memoizedProps = u.memoizedProps),
                        (o.memoizedState = u.memoizedState),
                        (o.updateQueue = u.updateQueue),
                        (o.type = u.type),
                        (e = u.dependencies),
                        (o.dependencies =
                          e === null ? null : { lanes: e.lanes, firstContext: e.firstContext })),
                    (t = t.sibling))
                return (U(J, (J.current & 1) | 2), n.child)
              }
              e = e.sibling
            }
          o.tail !== null &&
            le() > Nt &&
            ((n.flags |= 128), (r = !0), $t(o, !1), (n.lanes = 4194304))
        }
      else {
        if (!r)
          if (((e = Sl(u)), e !== null)) {
            if (
              ((n.flags |= 128),
              (r = !0),
              (t = e.updateQueue),
              t !== null && ((n.updateQueue = t), (n.flags |= 4)),
              $t(o, !0),
              o.tail === null && o.tailMode === 'hidden' && !u.alternate && !X)
            )
              return (me(n), null)
          } else
            2 * le() - o.renderingStartTime > Nt &&
              t !== 1073741824 &&
              ((n.flags |= 128), (r = !0), $t(o, !1), (n.lanes = 4194304))
        o.isBackwards
          ? ((u.sibling = n.child), (n.child = u))
          : ((t = o.last), t !== null ? (t.sibling = u) : (n.child = u), (o.last = u))
      }
      return o.tail !== null
        ? ((n = o.tail),
          (o.rendering = n),
          (o.tail = n.sibling),
          (o.renderingStartTime = le()),
          (n.sibling = null),
          (t = J.current),
          U(J, r ? (t & 1) | 2 : t & 1),
          n)
        : (me(n), null)
    case 22:
    case 23:
      return (
        qi(),
        (r = n.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (n.flags |= 8192),
        r && n.mode & 1
          ? Ne & 1073741824 && (me(n), n.subtreeFlags & 6 && (n.flags |= 8192))
          : me(n),
        null
      )
    case 24:
      return null
    case 25:
      return null
  }
  throw Error(E(156, n.tag))
}
function pp(e, n) {
  switch ((Ri(n), n.tag)) {
    case 1:
      return (
        xe(n.type) && pl(),
        (e = n.flags),
        e & 65536 ? ((n.flags = (e & -65537) | 128), n) : null
      )
    case 3:
      return (
        Pt(),
        K(_e),
        K(ve),
        Wi(),
        (e = n.flags),
        e & 65536 && !(e & 128) ? ((n.flags = (e & -65537) | 128), n) : null
      )
    case 5:
      return ($i(n), null)
    case 13:
      if ((K(J), (e = n.memoizedState), e !== null && e.dehydrated !== null)) {
        if (n.alternate === null) throw Error(E(340))
        _t()
      }
      return ((e = n.flags), e & 65536 ? ((n.flags = (e & -65537) | 128), n) : null)
    case 19:
      return (K(J), null)
    case 4:
      return (Pt(), null)
    case 10:
      return (Ii(n.type._context), null)
    case 22:
    case 23:
      return (qi(), null)
    case 24:
      return null
    default:
      return null
  }
}
var Hr = !1,
  ye = !1,
  hp = typeof WeakSet == 'function' ? WeakSet : Set,
  T = null
function ht(e, n) {
  var t = e.ref
  if (t !== null)
    if (typeof t == 'function')
      try {
        t(null)
      } catch (r) {
        te(e, n, r)
      }
    else t.current = null
}
function ri(e, n, t) {
  try {
    t()
  } catch (r) {
    te(e, n, r)
  }
}
var os = !1
function mp(e, n) {
  if ((($o = al), (e = Sa()), zi(e))) {
    if ('selectionStart' in e) var t = { start: e.selectionStart, end: e.selectionEnd }
    else
      e: {
        t = ((t = e.ownerDocument) && t.defaultView) || window
        var r = t.getSelection && t.getSelection()
        if (r && r.rangeCount !== 0) {
          t = r.anchorNode
          var l = r.anchorOffset,
            o = r.focusNode
          r = r.focusOffset
          try {
            ;(t.nodeType, o.nodeType)
          } catch {
            t = null
            break e
          }
          var u = 0,
            s = -1,
            a = -1,
            h = 0,
            w = 0,
            v = e,
            g = null
          n: for (;;) {
            for (
              var C;
              v !== t || (l !== 0 && v.nodeType !== 3) || (s = u + l),
                v !== o || (r !== 0 && v.nodeType !== 3) || (a = u + r),
                v.nodeType === 3 && (u += v.nodeValue.length),
                (C = v.firstChild) !== null;

            )
              ((g = v), (v = C))
            for (;;) {
              if (v === e) break n
              if (
                (g === t && ++h === l && (s = u),
                g === o && ++w === r && (a = u),
                (C = v.nextSibling) !== null)
              )
                break
              ;((v = g), (g = v.parentNode))
            }
            v = C
          }
          t = s === -1 || a === -1 ? null : { start: s, end: a }
        } else t = null
      }
    t = t || { start: 0, end: 0 }
  } else t = null
  for (Wo = { focusedElem: e, selectionRange: t }, al = !1, T = n; T !== null; )
    if (((n = T), (e = n.child), (n.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = n), (T = e))
    else
      for (; T !== null; ) {
        n = T
        try {
          var x = n.alternate
          if (n.flags & 1024)
            switch (n.tag) {
              case 0:
              case 11:
              case 15:
                break
              case 1:
                if (x !== null) {
                  var _ = x.memoizedProps,
                    H = x.memoizedState,
                    m = n.stateNode,
                    d = m.getSnapshotBeforeUpdate(n.elementType === n.type ? _ : Ue(n.type, _), H)
                  m.__reactInternalSnapshotBeforeUpdate = d
                }
                break
              case 3:
                var y = n.stateNode.containerInfo
                y.nodeType === 1
                  ? (y.textContent = '')
                  : y.nodeType === 9 && y.documentElement && y.removeChild(y.documentElement)
                break
              case 5:
              case 6:
              case 4:
              case 17:
                break
              default:
                throw Error(E(163))
            }
        } catch (S) {
          te(n, n.return, S)
        }
        if (((e = n.sibling), e !== null)) {
          ;((e.return = n.return), (T = e))
          break
        }
        T = n.return
      }
  return ((x = os), (os = !1), x)
}
function er(e, n, t) {
  var r = n.updateQueue
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var l = (r = r.next)
    do {
      if ((l.tag & e) === e) {
        var o = l.destroy
        ;((l.destroy = void 0), o !== void 0 && ri(n, t, o))
      }
      l = l.next
    } while (l !== r)
  }
}
function Ol(e, n) {
  if (((n = n.updateQueue), (n = n !== null ? n.lastEffect : null), n !== null)) {
    var t = (n = n.next)
    do {
      if ((t.tag & e) === e) {
        var r = t.create
        t.destroy = r()
      }
      t = t.next
    } while (t !== n)
  }
}
function li(e) {
  var n = e.ref
  if (n !== null) {
    var t = e.stateNode
    switch (e.tag) {
      case 5:
        e = t
        break
      default:
        e = t
    }
    typeof n == 'function' ? n(e) : (n.current = e)
  }
}
function yc(e) {
  var n = e.alternate
  ;(n !== null && ((e.alternate = null), yc(n)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((n = e.stateNode),
      n !== null && (delete n[qe], delete n[pr], delete n[Uo], delete n[Jd], delete n[qd])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null))
}
function vc(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4
}
function is(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || vc(e.return)) return null
      e = e.return
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e
      ;((e.child.return = e), (e = e.child))
    }
    if (!(e.flags & 2)) return e.stateNode
  }
}
function oi(e, n, t) {
  var r = e.tag
  if (r === 5 || r === 6)
    ((e = e.stateNode),
      n
        ? t.nodeType === 8
          ? t.parentNode.insertBefore(e, n)
          : t.insertBefore(e, n)
        : (t.nodeType === 8
            ? ((n = t.parentNode), n.insertBefore(e, t))
            : ((n = t), n.appendChild(e)),
          (t = t._reactRootContainer),
          t != null || n.onclick !== null || (n.onclick = dl)))
  else if (r !== 4 && ((e = e.child), e !== null))
    for (oi(e, n, t), e = e.sibling; e !== null; ) (oi(e, n, t), (e = e.sibling))
}
function ii(e, n, t) {
  var r = e.tag
  if (r === 5 || r === 6) ((e = e.stateNode), n ? t.insertBefore(e, n) : t.appendChild(e))
  else if (r !== 4 && ((e = e.child), e !== null))
    for (ii(e, n, t), e = e.sibling; e !== null; ) (ii(e, n, t), (e = e.sibling))
}
var ce = null,
  Qe = !1
function vn(e, n, t) {
  for (t = t.child; t !== null; ) (gc(e, n, t), (t = t.sibling))
}
function gc(e, n, t) {
  if (be && typeof be.onCommitFiberUnmount == 'function')
    try {
      be.onCommitFiberUnmount(Ml, t)
    } catch {}
  switch (t.tag) {
    case 5:
      ye || ht(t, n)
    case 6:
      var r = ce,
        l = Qe
      ;((ce = null),
        vn(e, n, t),
        (ce = r),
        (Qe = l),
        ce !== null &&
          (Qe
            ? ((e = ce),
              (t = t.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(t) : e.removeChild(t))
            : ce.removeChild(t.stateNode)))
      break
    case 18:
      ce !== null &&
        (Qe
          ? ((e = ce),
            (t = t.stateNode),
            e.nodeType === 8 ? uo(e.parentNode, t) : e.nodeType === 1 && uo(e, t),
            sr(e))
          : uo(ce, t.stateNode))
      break
    case 4:
      ;((r = ce),
        (l = Qe),
        (ce = t.stateNode.containerInfo),
        (Qe = !0),
        vn(e, n, t),
        (ce = r),
        (Qe = l))
      break
    case 0:
    case 11:
    case 14:
    case 15:
      if (!ye && ((r = t.updateQueue), r !== null && ((r = r.lastEffect), r !== null))) {
        l = r = r.next
        do {
          var o = l,
            u = o.destroy
          ;((o = o.tag), u !== void 0 && (o & 2 || o & 4) && ri(t, n, u), (l = l.next))
        } while (l !== r)
      }
      vn(e, n, t)
      break
    case 1:
      if (!ye && (ht(t, n), (r = t.stateNode), typeof r.componentWillUnmount == 'function'))
        try {
          ;((r.props = t.memoizedProps), (r.state = t.memoizedState), r.componentWillUnmount())
        } catch (s) {
          te(t, n, s)
        }
      vn(e, n, t)
      break
    case 21:
      vn(e, n, t)
      break
    case 22:
      t.mode & 1
        ? ((ye = (r = ye) || t.memoizedState !== null), vn(e, n, t), (ye = r))
        : vn(e, n, t)
      break
    default:
      vn(e, n, t)
  }
}
function us(e) {
  var n = e.updateQueue
  if (n !== null) {
    e.updateQueue = null
    var t = e.stateNode
    ;(t === null && (t = e.stateNode = new hp()),
      n.forEach(function (r) {
        var l = _p.bind(null, e, r)
        t.has(r) || (t.add(r), r.then(l, l))
      }))
  }
}
function He(e, n) {
  var t = n.deletions
  if (t !== null)
    for (var r = 0; r < t.length; r++) {
      var l = t[r]
      try {
        var o = e,
          u = n,
          s = u
        e: for (; s !== null; ) {
          switch (s.tag) {
            case 5:
              ;((ce = s.stateNode), (Qe = !1))
              break e
            case 3:
              ;((ce = s.stateNode.containerInfo), (Qe = !0))
              break e
            case 4:
              ;((ce = s.stateNode.containerInfo), (Qe = !0))
              break e
          }
          s = s.return
        }
        if (ce === null) throw Error(E(160))
        ;(gc(o, u, l), (ce = null), (Qe = !1))
        var a = l.alternate
        ;(a !== null && (a.return = null), (l.return = null))
      } catch (h) {
        te(l, n, h)
      }
    }
  if (n.subtreeFlags & 12854) for (n = n.child; n !== null; ) (wc(n, e), (n = n.sibling))
}
function wc(e, n) {
  var t = e.alternate,
    r = e.flags
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((He(n, e), Ze(e), r & 4)) {
        try {
          ;(er(3, e, e.return), Ol(3, e))
        } catch (_) {
          te(e, e.return, _)
        }
        try {
          er(5, e, e.return)
        } catch (_) {
          te(e, e.return, _)
        }
      }
      break
    case 1:
      ;(He(n, e), Ze(e), r & 512 && t !== null && ht(t, t.return))
      break
    case 5:
      if ((He(n, e), Ze(e), r & 512 && t !== null && ht(t, t.return), e.flags & 32)) {
        var l = e.stateNode
        try {
          lr(l, '')
        } catch (_) {
          te(e, e.return, _)
        }
      }
      if (r & 4 && ((l = e.stateNode), l != null)) {
        var o = e.memoizedProps,
          u = t !== null ? t.memoizedProps : o,
          s = e.type,
          a = e.updateQueue
        if (((e.updateQueue = null), a !== null))
          try {
            ;(s === 'input' && o.type === 'radio' && o.name != null && Ws(l, o), zo(s, u))
            var h = zo(s, o)
            for (u = 0; u < a.length; u += 2) {
              var w = a[u],
                v = a[u + 1]
              w === 'style'
                ? Ks(l, v)
                : w === 'dangerouslySetInnerHTML'
                  ? Us(l, v)
                  : w === 'children'
                    ? lr(l, v)
                    : vi(l, w, v, h)
            }
            switch (s) {
              case 'input':
                xo(l, o)
                break
              case 'textarea':
                Hs(l, o)
                break
              case 'select':
                var g = l._wrapperState.wasMultiple
                l._wrapperState.wasMultiple = !!o.multiple
                var C = o.value
                C != null
                  ? yt(l, !!o.multiple, C, !1)
                  : g !== !!o.multiple &&
                    (o.defaultValue != null
                      ? yt(l, !!o.multiple, o.defaultValue, !0)
                      : yt(l, !!o.multiple, o.multiple ? [] : '', !1))
            }
            l[pr] = o
          } catch (_) {
            te(e, e.return, _)
          }
      }
      break
    case 6:
      if ((He(n, e), Ze(e), r & 4)) {
        if (e.stateNode === null) throw Error(E(162))
        ;((l = e.stateNode), (o = e.memoizedProps))
        try {
          l.nodeValue = o
        } catch (_) {
          te(e, e.return, _)
        }
      }
      break
    case 3:
      if ((He(n, e), Ze(e), r & 4 && t !== null && t.memoizedState.isDehydrated))
        try {
          sr(n.containerInfo)
        } catch (_) {
          te(e, e.return, _)
        }
      break
    case 4:
      ;(He(n, e), Ze(e))
      break
    case 13:
      ;(He(n, e),
        Ze(e),
        (l = e.child),
        l.flags & 8192 &&
          ((o = l.memoizedState !== null),
          (l.stateNode.isHidden = o),
          !o || (l.alternate !== null && l.alternate.memoizedState !== null) || (Zi = le())),
        r & 4 && us(e))
      break
    case 22:
      if (
        ((w = t !== null && t.memoizedState !== null),
        e.mode & 1 ? ((ye = (h = ye) || w), He(n, e), (ye = h)) : He(n, e),
        Ze(e),
        r & 8192)
      ) {
        if (((h = e.memoizedState !== null), (e.stateNode.isHidden = h) && !w && e.mode & 1))
          for (T = e, w = e.child; w !== null; ) {
            for (v = T = w; T !== null; ) {
              switch (((g = T), (C = g.child), g.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  er(4, g, g.return)
                  break
                case 1:
                  ht(g, g.return)
                  var x = g.stateNode
                  if (typeof x.componentWillUnmount == 'function') {
                    ;((r = g), (t = g.return))
                    try {
                      ;((n = r),
                        (x.props = n.memoizedProps),
                        (x.state = n.memoizedState),
                        x.componentWillUnmount())
                    } catch (_) {
                      te(r, t, _)
                    }
                  }
                  break
                case 5:
                  ht(g, g.return)
                  break
                case 22:
                  if (g.memoizedState !== null) {
                    as(v)
                    continue
                  }
              }
              C !== null ? ((C.return = g), (T = C)) : as(v)
            }
            w = w.sibling
          }
        e: for (w = null, v = e; ; ) {
          if (v.tag === 5) {
            if (w === null) {
              w = v
              try {
                ;((l = v.stateNode),
                  h
                    ? ((o = l.style),
                      typeof o.setProperty == 'function'
                        ? o.setProperty('display', 'none', 'important')
                        : (o.display = 'none'))
                    : ((s = v.stateNode),
                      (a = v.memoizedProps.style),
                      (u = a != null && a.hasOwnProperty('display') ? a.display : null),
                      (s.style.display = Qs('display', u))))
              } catch (_) {
                te(e, e.return, _)
              }
            }
          } else if (v.tag === 6) {
            if (w === null)
              try {
                v.stateNode.nodeValue = h ? '' : v.memoizedProps
              } catch (_) {
                te(e, e.return, _)
              }
          } else if (
            ((v.tag !== 22 && v.tag !== 23) || v.memoizedState === null || v === e) &&
            v.child !== null
          ) {
            ;((v.child.return = v), (v = v.child))
            continue
          }
          if (v === e) break e
          for (; v.sibling === null; ) {
            if (v.return === null || v.return === e) break e
            ;(w === v && (w = null), (v = v.return))
          }
          ;(w === v && (w = null), (v.sibling.return = v.return), (v = v.sibling))
        }
      }
      break
    case 19:
      ;(He(n, e), Ze(e), r & 4 && us(e))
      break
    case 21:
      break
    default:
      ;(He(n, e), Ze(e))
  }
}
function Ze(e) {
  var n = e.flags
  if (n & 2) {
    try {
      e: {
        for (var t = e.return; t !== null; ) {
          if (vc(t)) {
            var r = t
            break e
          }
          t = t.return
        }
        throw Error(E(160))
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode
          r.flags & 32 && (lr(l, ''), (r.flags &= -33))
          var o = is(e)
          ii(e, o, l)
          break
        case 3:
        case 4:
          var u = r.stateNode.containerInfo,
            s = is(e)
          oi(e, s, u)
          break
        default:
          throw Error(E(161))
      }
    } catch (a) {
      te(e, e.return, a)
    }
    e.flags &= -3
  }
  n & 4096 && (e.flags &= -4097)
}
function yp(e, n, t) {
  ;((T = e), Sc(e))
}
function Sc(e, n, t) {
  for (var r = (e.mode & 1) !== 0; T !== null; ) {
    var l = T,
      o = l.child
    if (l.tag === 22 && r) {
      var u = l.memoizedState !== null || Hr
      if (!u) {
        var s = l.alternate,
          a = (s !== null && s.memoizedState !== null) || ye
        s = Hr
        var h = ye
        if (((Hr = u), (ye = a) && !h))
          for (T = l; T !== null; )
            ((u = T),
              (a = u.child),
              u.tag === 22 && u.memoizedState !== null
                ? cs(l)
                : a !== null
                  ? ((a.return = u), (T = a))
                  : cs(l))
        for (; o !== null; ) ((T = o), Sc(o), (o = o.sibling))
        ;((T = l), (Hr = s), (ye = h))
      }
      ss(e)
    } else l.subtreeFlags & 8772 && o !== null ? ((o.return = l), (T = o)) : ss(e)
  }
}
function ss(e) {
  for (; T !== null; ) {
    var n = T
    if (n.flags & 8772) {
      var t = n.alternate
      try {
        if (n.flags & 8772)
          switch (n.tag) {
            case 0:
            case 11:
            case 15:
              ye || Ol(5, n)
              break
            case 1:
              var r = n.stateNode
              if (n.flags & 4 && !ye)
                if (t === null) r.componentDidMount()
                else {
                  var l = n.elementType === n.type ? t.memoizedProps : Ue(n.type, t.memoizedProps)
                  r.componentDidUpdate(l, t.memoizedState, r.__reactInternalSnapshotBeforeUpdate)
                }
              var o = n.updateQueue
              o !== null && Ku(n, o, r)
              break
            case 3:
              var u = n.updateQueue
              if (u !== null) {
                if (((t = null), n.child !== null))
                  switch (n.child.tag) {
                    case 5:
                      t = n.child.stateNode
                      break
                    case 1:
                      t = n.child.stateNode
                  }
                Ku(n, u, t)
              }
              break
            case 5:
              var s = n.stateNode
              if (t === null && n.flags & 4) {
                t = s
                var a = n.memoizedProps
                switch (n.type) {
                  case 'button':
                  case 'input':
                  case 'select':
                  case 'textarea':
                    a.autoFocus && t.focus()
                    break
                  case 'img':
                    a.src && (t.src = a.src)
                }
              }
              break
            case 6:
              break
            case 4:
              break
            case 12:
              break
            case 13:
              if (n.memoizedState === null) {
                var h = n.alternate
                if (h !== null) {
                  var w = h.memoizedState
                  if (w !== null) {
                    var v = w.dehydrated
                    v !== null && sr(v)
                  }
                }
              }
              break
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break
            default:
              throw Error(E(163))
          }
        ye || (n.flags & 512 && li(n))
      } catch (g) {
        te(n, n.return, g)
      }
    }
    if (n === e) {
      T = null
      break
    }
    if (((t = n.sibling), t !== null)) {
      ;((t.return = n.return), (T = t))
      break
    }
    T = n.return
  }
}
function as(e) {
  for (; T !== null; ) {
    var n = T
    if (n === e) {
      T = null
      break
    }
    var t = n.sibling
    if (t !== null) {
      ;((t.return = n.return), (T = t))
      break
    }
    T = n.return
  }
}
function cs(e) {
  for (; T !== null; ) {
    var n = T
    try {
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          var t = n.return
          try {
            Ol(4, n)
          } catch (a) {
            te(n, t, a)
          }
          break
        case 1:
          var r = n.stateNode
          if (typeof r.componentDidMount == 'function') {
            var l = n.return
            try {
              r.componentDidMount()
            } catch (a) {
              te(n, l, a)
            }
          }
          var o = n.return
          try {
            li(n)
          } catch (a) {
            te(n, o, a)
          }
          break
        case 5:
          var u = n.return
          try {
            li(n)
          } catch (a) {
            te(n, u, a)
          }
      }
    } catch (a) {
      te(n, n.return, a)
    }
    if (n === e) {
      T = null
      break
    }
    var s = n.sibling
    if (s !== null) {
      ;((s.return = n.return), (T = s))
      break
    }
    T = n.return
  }
}
var vp = Math.ceil,
  Cl = mn.ReactCurrentDispatcher,
  Yi = mn.ReactCurrentOwner,
  Be = mn.ReactCurrentBatchConfig,
  W = 0,
  ae = null,
  oe = null,
  fe = 0,
  Ne = 0,
  mt = Dn(0),
  ue = 0,
  wr = null,
  Zn = 0,
  Bl = 0,
  Xi = 0,
  nr = null,
  Ee = null,
  Zi = 0,
  Nt = 1 / 0,
  on = null,
  _l = !1,
  ui = null,
  Mn = null,
  Vr = !1,
  Cn = null,
  xl = 0,
  tr = 0,
  si = null,
  nl = -1,
  tl = 0
function we() {
  return W & 6 ? le() : nl !== -1 ? nl : (nl = le())
}
function zn(e) {
  return e.mode & 1
    ? W & 2 && fe !== 0
      ? fe & -fe
      : ep.transition !== null
        ? (tl === 0 && (tl = la()), tl)
        : ((e = V), e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : fa(e.type))), e)
    : 1
}
function Ye(e, n, t, r) {
  if (50 < tr) throw ((tr = 0), (si = null), Error(E(185)))
  ;(kr(e, t, r),
    (!(W & 2) || e !== ae) &&
      (e === ae && (!(W & 2) && (Bl |= t), ue === 4 && kn(e, fe)),
      Pe(e, r),
      t === 1 && W === 0 && !(n.mode & 1) && ((Nt = le() + 500), Fl && In())))
}
function Pe(e, n) {
  var t = e.callbackNode
  ed(e, n)
  var r = sl(e, e === ae ? fe : 0)
  if (r === 0) (t !== null && wu(t), (e.callbackNode = null), (e.callbackPriority = 0))
  else if (((n = r & -r), e.callbackPriority !== n)) {
    if ((t != null && wu(t), n === 1))
      (e.tag === 0 ? bd(fs.bind(null, e)) : za(fs.bind(null, e)),
        Xd(function () {
          !(W & 6) && In()
        }),
        (t = null))
    else {
      switch (oa(r)) {
        case 1:
          t = Ei
          break
        case 4:
          t = ta
          break
        case 16:
          t = ul
          break
        case 536870912:
          t = ra
          break
        default:
          t = ul
      }
      t = Nc(t, kc.bind(null, e))
    }
    ;((e.callbackPriority = n), (e.callbackNode = t))
  }
}
function kc(e, n) {
  if (((nl = -1), (tl = 0), W & 6)) throw Error(E(327))
  var t = e.callbackNode
  if (kt() && e.callbackNode !== t) return null
  var r = sl(e, e === ae ? fe : 0)
  if (r === 0) return null
  if (r & 30 || r & e.expiredLanes || n) n = Pl(e, r)
  else {
    n = r
    var l = W
    W |= 2
    var o = Cc()
    ;(ae !== e || fe !== n) && ((on = null), (Nt = le() + 500), Qn(e, n))
    do
      try {
        Sp()
        break
      } catch (s) {
        Ec(e, s)
      }
    while (!0)
    ;(Di(), (Cl.current = o), (W = l), oe !== null ? (n = 0) : ((ae = null), (fe = 0), (n = ue)))
  }
  if (n !== 0) {
    if ((n === 2 && ((l = Do(e)), l !== 0 && ((r = l), (n = ai(e, l)))), n === 1))
      throw ((t = wr), Qn(e, 0), kn(e, r), Pe(e, le()), t)
    if (n === 6) kn(e, r)
    else {
      if (
        ((l = e.current.alternate),
        !(r & 30) &&
          !gp(l) &&
          ((n = Pl(e, r)), n === 2 && ((o = Do(e)), o !== 0 && ((r = o), (n = ai(e, o)))), n === 1))
      )
        throw ((t = wr), Qn(e, 0), kn(e, r), Pe(e, le()), t)
      switch (((e.finishedWork = l), (e.finishedLanes = r), n)) {
        case 0:
        case 1:
          throw Error(E(345))
        case 2:
          Wn(e, Ee, on)
          break
        case 3:
          if ((kn(e, r), (r & 130023424) === r && ((n = Zi + 500 - le()), 10 < n))) {
            if (sl(e, 0) !== 0) break
            if (((l = e.suspendedLanes), (l & r) !== r)) {
              ;(we(), (e.pingedLanes |= e.suspendedLanes & l))
              break
            }
            e.timeoutHandle = Vo(Wn.bind(null, e, Ee, on), n)
            break
          }
          Wn(e, Ee, on)
          break
        case 4:
          if ((kn(e, r), (r & 4194240) === r)) break
          for (n = e.eventTimes, l = -1; 0 < r; ) {
            var u = 31 - Ge(r)
            ;((o = 1 << u), (u = n[u]), u > l && (l = u), (r &= ~o))
          }
          if (
            ((r = l),
            (r = le() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                  ? 480
                  : 1080 > r
                    ? 1080
                    : 1920 > r
                      ? 1920
                      : 3e3 > r
                        ? 3e3
                        : 4320 > r
                          ? 4320
                          : 1960 * vp(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = Vo(Wn.bind(null, e, Ee, on), r)
            break
          }
          Wn(e, Ee, on)
          break
        case 5:
          Wn(e, Ee, on)
          break
        default:
          throw Error(E(329))
      }
    }
  }
  return (Pe(e, le()), e.callbackNode === t ? kc.bind(null, e) : null)
}
function ai(e, n) {
  var t = nr
  return (
    e.current.memoizedState.isDehydrated && (Qn(e, n).flags |= 256),
    (e = Pl(e, n)),
    e !== 2 && ((n = Ee), (Ee = t), n !== null && ci(n)),
    e
  )
}
function ci(e) {
  Ee === null ? (Ee = e) : Ee.push.apply(Ee, e)
}
function gp(e) {
  for (var n = e; ; ) {
    if (n.flags & 16384) {
      var t = n.updateQueue
      if (t !== null && ((t = t.stores), t !== null))
        for (var r = 0; r < t.length; r++) {
          var l = t[r],
            o = l.getSnapshot
          l = l.value
          try {
            if (!Xe(o(), l)) return !1
          } catch {
            return !1
          }
        }
    }
    if (((t = n.child), n.subtreeFlags & 16384 && t !== null)) ((t.return = n), (n = t))
    else {
      if (n === e) break
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === e) return !0
        n = n.return
      }
      ;((n.sibling.return = n.return), (n = n.sibling))
    }
  }
  return !0
}
function kn(e, n) {
  for (
    n &= ~Xi, n &= ~Bl, e.suspendedLanes |= n, e.pingedLanes &= ~n, e = e.expirationTimes;
    0 < n;

  ) {
    var t = 31 - Ge(n),
      r = 1 << t
    ;((e[t] = -1), (n &= ~r))
  }
}
function fs(e) {
  if (W & 6) throw Error(E(327))
  kt()
  var n = sl(e, 0)
  if (!(n & 1)) return (Pe(e, le()), null)
  var t = Pl(e, n)
  if (e.tag !== 0 && t === 2) {
    var r = Do(e)
    r !== 0 && ((n = r), (t = ai(e, r)))
  }
  if (t === 1) throw ((t = wr), Qn(e, 0), kn(e, n), Pe(e, le()), t)
  if (t === 6) throw Error(E(345))
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = n),
    Wn(e, Ee, on),
    Pe(e, le()),
    null
  )
}
function Ji(e, n) {
  var t = W
  W |= 1
  try {
    return e(n)
  } finally {
    ;((W = t), W === 0 && ((Nt = le() + 500), Fl && In()))
  }
}
function Jn(e) {
  Cn !== null && Cn.tag === 0 && !(W & 6) && kt()
  var n = W
  W |= 1
  var t = Be.transition,
    r = V
  try {
    if (((Be.transition = null), (V = 1), e)) return e()
  } finally {
    ;((V = r), (Be.transition = t), (W = n), !(W & 6) && In())
  }
}
function qi() {
  ;((Ne = mt.current), K(mt))
}
function Qn(e, n) {
  ;((e.finishedWork = null), (e.finishedLanes = 0))
  var t = e.timeoutHandle
  if ((t !== -1 && ((e.timeoutHandle = -1), Yd(t)), oe !== null))
    for (t = oe.return; t !== null; ) {
      var r = t
      switch ((Ri(r), r.tag)) {
        case 1:
          ;((r = r.type.childContextTypes), r != null && pl())
          break
        case 3:
          ;(Pt(), K(_e), K(ve), Wi())
          break
        case 5:
          $i(r)
          break
        case 4:
          Pt()
          break
        case 13:
          K(J)
          break
        case 19:
          K(J)
          break
        case 10:
          Ii(r.type._context)
          break
        case 22:
        case 23:
          qi()
      }
      t = t.return
    }
  if (
    ((ae = e),
    (oe = e = Ln(e.current, null)),
    (fe = Ne = n),
    (ue = 0),
    (wr = null),
    (Xi = Bl = Zn = 0),
    (Ee = nr = null),
    Vn !== null)
  ) {
    for (n = 0; n < Vn.length; n++)
      if (((t = Vn[n]), (r = t.interleaved), r !== null)) {
        t.interleaved = null
        var l = r.next,
          o = t.pending
        if (o !== null) {
          var u = o.next
          ;((o.next = l), (r.next = u))
        }
        t.pending = r
      }
    Vn = null
  }
  return e
}
function Ec(e, n) {
  do {
    var t = oe
    try {
      if ((Di(), (qr.current = El), kl)) {
        for (var r = q.memoizedState; r !== null; ) {
          var l = r.queue
          ;(l !== null && (l.pending = null), (r = r.next))
        }
        kl = !1
      }
      if (
        ((Xn = 0),
        (se = ie = q = null),
        (bt = !1),
        (yr = 0),
        (Yi.current = null),
        t === null || t.return === null)
      ) {
        ;((ue = 1), (wr = n), (oe = null))
        break
      }
      e: {
        var o = e,
          u = t.return,
          s = t,
          a = n
        if (
          ((n = fe),
          (s.flags |= 32768),
          a !== null && typeof a == 'object' && typeof a.then == 'function')
        ) {
          var h = a,
            w = s,
            v = w.tag
          if (!(w.mode & 1) && (v === 0 || v === 11 || v === 15)) {
            var g = w.alternate
            g
              ? ((w.updateQueue = g.updateQueue),
                (w.memoizedState = g.memoizedState),
                (w.lanes = g.lanes))
              : ((w.updateQueue = null), (w.memoizedState = null))
          }
          var C = qu(u)
          if (C !== null) {
            ;((C.flags &= -257), bu(C, u, s, o, n), C.mode & 1 && Ju(o, h, n), (n = C), (a = h))
            var x = n.updateQueue
            if (x === null) {
              var _ = new Set()
              ;(_.add(a), (n.updateQueue = _))
            } else x.add(a)
            break e
          } else {
            if (!(n & 1)) {
              ;(Ju(o, h, n), bi())
              break e
            }
            a = Error(E(426))
          }
        } else if (X && s.mode & 1) {
          var H = qu(u)
          if (H !== null) {
            ;(!(H.flags & 65536) && (H.flags |= 256), bu(H, u, s, o, n), ji(Tt(a, s)))
            break e
          }
        }
        ;((o = a = Tt(a, s)), ue !== 4 && (ue = 2), nr === null ? (nr = [o]) : nr.push(o), (o = u))
        do {
          switch (o.tag) {
            case 3:
              ;((o.flags |= 65536), (n &= -n), (o.lanes |= n))
              var m = oc(o, a, n)
              Qu(o, m)
              break e
            case 1:
              s = a
              var d = o.type,
                y = o.stateNode
              if (
                !(o.flags & 128) &&
                (typeof d.getDerivedStateFromError == 'function' ||
                  (y !== null &&
                    typeof y.componentDidCatch == 'function' &&
                    (Mn === null || !Mn.has(y))))
              ) {
                ;((o.flags |= 65536), (n &= -n), (o.lanes |= n))
                var S = ic(o, s, n)
                Qu(o, S)
                break e
              }
          }
          o = o.return
        } while (o !== null)
      }
      xc(t)
    } catch (N) {
      ;((n = N), oe === t && t !== null && (oe = t = t.return))
      continue
    }
    break
  } while (!0)
}
function Cc() {
  var e = Cl.current
  return ((Cl.current = El), e === null ? El : e)
}
function bi() {
  ;((ue === 0 || ue === 3 || ue === 2) && (ue = 4),
    ae === null || (!(Zn & 268435455) && !(Bl & 268435455)) || kn(ae, fe))
}
function Pl(e, n) {
  var t = W
  W |= 2
  var r = Cc()
  ;(ae !== e || fe !== n) && ((on = null), Qn(e, n))
  do
    try {
      wp()
      break
    } catch (l) {
      Ec(e, l)
    }
  while (!0)
  if ((Di(), (W = t), (Cl.current = r), oe !== null)) throw Error(E(261))
  return ((ae = null), (fe = 0), ue)
}
function wp() {
  for (; oe !== null; ) _c(oe)
}
function Sp() {
  for (; oe !== null && !Qf(); ) _c(oe)
}
function _c(e) {
  var n = Tc(e.alternate, e, Ne)
  ;((e.memoizedProps = e.pendingProps), n === null ? xc(e) : (oe = n), (Yi.current = null))
}
function xc(e) {
  var n = e
  do {
    var t = n.alternate
    if (((e = n.return), n.flags & 32768)) {
      if (((t = pp(t, n)), t !== null)) {
        ;((t.flags &= 32767), (oe = t))
        return
      }
      if (e !== null) ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null))
      else {
        ;((ue = 6), (oe = null))
        return
      }
    } else if (((t = dp(t, n, Ne)), t !== null)) {
      oe = t
      return
    }
    if (((n = n.sibling), n !== null)) {
      oe = n
      return
    }
    oe = n = e
  } while (n !== null)
  ue === 0 && (ue = 5)
}
function Wn(e, n, t) {
  var r = V,
    l = Be.transition
  try {
    ;((Be.transition = null), (V = 1), kp(e, n, t, r))
  } finally {
    ;((Be.transition = l), (V = r))
  }
  return null
}
function kp(e, n, t, r) {
  do kt()
  while (Cn !== null)
  if (W & 6) throw Error(E(327))
  t = e.finishedWork
  var l = e.finishedLanes
  if (t === null) return null
  if (((e.finishedWork = null), (e.finishedLanes = 0), t === e.current)) throw Error(E(177))
  ;((e.callbackNode = null), (e.callbackPriority = 0))
  var o = t.lanes | t.childLanes
  if (
    (nd(e, o),
    e === ae && ((oe = ae = null), (fe = 0)),
    (!(t.subtreeFlags & 2064) && !(t.flags & 2064)) ||
      Vr ||
      ((Vr = !0),
      Nc(ul, function () {
        return (kt(), null)
      })),
    (o = (t.flags & 15990) !== 0),
    t.subtreeFlags & 15990 || o)
  ) {
    ;((o = Be.transition), (Be.transition = null))
    var u = V
    V = 1
    var s = W
    ;((W |= 4),
      (Yi.current = null),
      mp(e, t),
      wc(t, e),
      Wd(Wo),
      (al = !!$o),
      (Wo = $o = null),
      (e.current = t),
      yp(t),
      Kf(),
      (W = s),
      (V = u),
      (Be.transition = o))
  } else e.current = t
  if (
    (Vr && ((Vr = !1), (Cn = e), (xl = l)),
    (o = e.pendingLanes),
    o === 0 && (Mn = null),
    Xf(t.stateNode),
    Pe(e, le()),
    n !== null)
  )
    for (r = e.onRecoverableError, t = 0; t < n.length; t++)
      ((l = n[t]), r(l.value, { componentStack: l.stack, digest: l.digest }))
  if (_l) throw ((_l = !1), (e = ui), (ui = null), e)
  return (
    xl & 1 && e.tag !== 0 && kt(),
    (o = e.pendingLanes),
    o & 1 ? (e === si ? tr++ : ((tr = 0), (si = e))) : (tr = 0),
    In(),
    null
  )
}
function kt() {
  if (Cn !== null) {
    var e = oa(xl),
      n = Be.transition,
      t = V
    try {
      if (((Be.transition = null), (V = 16 > e ? 16 : e), Cn === null)) var r = !1
      else {
        if (((e = Cn), (Cn = null), (xl = 0), W & 6)) throw Error(E(331))
        var l = W
        for (W |= 4, T = e.current; T !== null; ) {
          var o = T,
            u = o.child
          if (T.flags & 16) {
            var s = o.deletions
            if (s !== null) {
              for (var a = 0; a < s.length; a++) {
                var h = s[a]
                for (T = h; T !== null; ) {
                  var w = T
                  switch (w.tag) {
                    case 0:
                    case 11:
                    case 15:
                      er(8, w, o)
                  }
                  var v = w.child
                  if (v !== null) ((v.return = w), (T = v))
                  else
                    for (; T !== null; ) {
                      w = T
                      var g = w.sibling,
                        C = w.return
                      if ((yc(w), w === h)) {
                        T = null
                        break
                      }
                      if (g !== null) {
                        ;((g.return = C), (T = g))
                        break
                      }
                      T = C
                    }
                }
              }
              var x = o.alternate
              if (x !== null) {
                var _ = x.child
                if (_ !== null) {
                  x.child = null
                  do {
                    var H = _.sibling
                    ;((_.sibling = null), (_ = H))
                  } while (_ !== null)
                }
              }
              T = o
            }
          }
          if (o.subtreeFlags & 2064 && u !== null) ((u.return = o), (T = u))
          else
            e: for (; T !== null; ) {
              if (((o = T), o.flags & 2048))
                switch (o.tag) {
                  case 0:
                  case 11:
                  case 15:
                    er(9, o, o.return)
                }
              var m = o.sibling
              if (m !== null) {
                ;((m.return = o.return), (T = m))
                break e
              }
              T = o.return
            }
        }
        var d = e.current
        for (T = d; T !== null; ) {
          u = T
          var y = u.child
          if (u.subtreeFlags & 2064 && y !== null) ((y.return = u), (T = y))
          else
            e: for (u = d; T !== null; ) {
              if (((s = T), s.flags & 2048))
                try {
                  switch (s.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Ol(9, s)
                  }
                } catch (N) {
                  te(s, s.return, N)
                }
              if (s === u) {
                T = null
                break e
              }
              var S = s.sibling
              if (S !== null) {
                ;((S.return = s.return), (T = S))
                break e
              }
              T = s.return
            }
        }
        if (((W = l), In(), be && typeof be.onPostCommitFiberRoot == 'function'))
          try {
            be.onPostCommitFiberRoot(Ml, e)
          } catch {}
        r = !0
      }
      return r
    } finally {
      ;((V = t), (Be.transition = n))
    }
  }
  return !1
}
function ds(e, n, t) {
  ;((n = Tt(t, n)),
    (n = oc(e, n, 1)),
    (e = Nn(e, n, 1)),
    (n = we()),
    e !== null && (kr(e, 1, n), Pe(e, n)))
}
function te(e, n, t) {
  if (e.tag === 3) ds(e, e, t)
  else
    for (; n !== null; ) {
      if (n.tag === 3) {
        ds(n, e, t)
        break
      } else if (n.tag === 1) {
        var r = n.stateNode
        if (
          typeof n.type.getDerivedStateFromError == 'function' ||
          (typeof r.componentDidCatch == 'function' && (Mn === null || !Mn.has(r)))
        ) {
          ;((e = Tt(t, e)),
            (e = ic(n, e, 1)),
            (n = Nn(n, e, 1)),
            (e = we()),
            n !== null && (kr(n, 1, e), Pe(n, e)))
          break
        }
      }
      n = n.return
    }
}
function Ep(e, n, t) {
  var r = e.pingCache
  ;(r !== null && r.delete(n),
    (n = we()),
    (e.pingedLanes |= e.suspendedLanes & t),
    ae === e &&
      (fe & t) === t &&
      (ue === 4 || (ue === 3 && (fe & 130023424) === fe && 500 > le() - Zi) ? Qn(e, 0) : (Xi |= t)),
    Pe(e, n))
}
function Pc(e, n) {
  n === 0 && (e.mode & 1 ? ((n = jr), (jr <<= 1), !(jr & 130023424) && (jr = 4194304)) : (n = 1))
  var t = we()
  ;((e = pn(e, n)), e !== null && (kr(e, n, t), Pe(e, t)))
}
function Cp(e) {
  var n = e.memoizedState,
    t = 0
  ;(n !== null && (t = n.retryLane), Pc(e, t))
}
function _p(e, n) {
  var t = 0
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        l = e.memoizedState
      l !== null && (t = l.retryLane)
      break
    case 19:
      r = e.stateNode
      break
    default:
      throw Error(E(314))
  }
  ;(r !== null && r.delete(n), Pc(e, t))
}
var Tc
Tc = function (e, n, t) {
  if (e !== null)
    if (e.memoizedProps !== n.pendingProps || _e.current) Ce = !0
    else {
      if (!(e.lanes & t) && !(n.flags & 128)) return ((Ce = !1), fp(e, n, t))
      Ce = !!(e.flags & 131072)
    }
  else ((Ce = !1), X && n.flags & 1048576 && La(n, yl, n.index))
  switch (((n.lanes = 0), n.tag)) {
    case 2:
      var r = n.type
      ;(el(e, n), (e = n.pendingProps))
      var l = Ct(n, ve.current)
      ;(St(n, t), (l = Vi(null, n, r, e, l, t)))
      var o = Ui()
      return (
        (n.flags |= 1),
        typeof l == 'object' && l !== null && typeof l.render == 'function' && l.$$typeof === void 0
          ? ((n.tag = 1),
            (n.memoizedState = null),
            (n.updateQueue = null),
            xe(r) ? ((o = !0), hl(n)) : (o = !1),
            (n.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null),
            Bi(n),
            (l.updater = Il),
            (n.stateNode = l),
            (l._reactInternals = n),
            Zo(n, r, e, t),
            (n = bo(null, n, r, !0, o, t)))
          : ((n.tag = 0), X && o && Li(n), ge(null, n, l, t), (n = n.child)),
        n
      )
    case 16:
      r = n.elementType
      e: {
        switch (
          (el(e, n),
          (e = n.pendingProps),
          (l = r._init),
          (r = l(r._payload)),
          (n.type = r),
          (l = n.tag = Pp(r)),
          (e = Ue(r, e)),
          l)
        ) {
          case 0:
            n = qo(null, n, r, e, t)
            break e
          case 1:
            n = ts(null, n, r, e, t)
            break e
          case 11:
            n = es(null, n, r, e, t)
            break e
          case 14:
            n = ns(null, n, r, Ue(r.type, e), t)
            break e
        }
        throw Error(E(306, r, ''))
      }
      return n
    case 0:
      return (
        (r = n.type),
        (l = n.pendingProps),
        (l = n.elementType === r ? l : Ue(r, l)),
        qo(e, n, r, l, t)
      )
    case 1:
      return (
        (r = n.type),
        (l = n.pendingProps),
        (l = n.elementType === r ? l : Ue(r, l)),
        ts(e, n, r, l, t)
      )
    case 3:
      e: {
        if ((cc(n), e === null)) throw Error(E(387))
        ;((r = n.pendingProps), (o = n.memoizedState), (l = o.element), Oa(e, n), wl(n, r, null, t))
        var u = n.memoizedState
        if (((r = u.element), o.isDehydrated))
          if (
            ((o = {
              element: r,
              isDehydrated: !1,
              cache: u.cache,
              pendingSuspenseBoundaries: u.pendingSuspenseBoundaries,
              transitions: u.transitions,
            }),
            (n.updateQueue.baseState = o),
            (n.memoizedState = o),
            n.flags & 256)
          ) {
            ;((l = Tt(Error(E(423)), n)), (n = rs(e, n, r, t, l)))
            break e
          } else if (r !== l) {
            ;((l = Tt(Error(E(424)), n)), (n = rs(e, n, r, t, l)))
            break e
          } else
            for (
              Me = Tn(n.stateNode.containerInfo.firstChild),
                ze = n,
                X = !0,
                Ke = null,
                t = Da(n, null, r, t),
                n.child = t;
              t;

            )
              ((t.flags = (t.flags & -3) | 4096), (t = t.sibling))
        else {
          if ((_t(), r === l)) {
            n = hn(e, n, t)
            break e
          }
          ge(e, n, r, t)
        }
        n = n.child
      }
      return n
    case 5:
      return (
        Ba(n),
        e === null && Go(n),
        (r = n.type),
        (l = n.pendingProps),
        (o = e !== null ? e.memoizedProps : null),
        (u = l.children),
        Ho(r, l) ? (u = null) : o !== null && Ho(r, o) && (n.flags |= 32),
        ac(e, n),
        ge(e, n, u, t),
        n.child
      )
    case 6:
      return (e === null && Go(n), null)
    case 13:
      return fc(e, n, t)
    case 4:
      return (
        Ai(n, n.stateNode.containerInfo),
        (r = n.pendingProps),
        e === null ? (n.child = xt(n, null, r, t)) : ge(e, n, r, t),
        n.child
      )
    case 11:
      return (
        (r = n.type),
        (l = n.pendingProps),
        (l = n.elementType === r ? l : Ue(r, l)),
        es(e, n, r, l, t)
      )
    case 7:
      return (ge(e, n, n.pendingProps, t), n.child)
    case 8:
      return (ge(e, n, n.pendingProps.children, t), n.child)
    case 12:
      return (ge(e, n, n.pendingProps.children, t), n.child)
    case 10:
      e: {
        if (
          ((r = n.type._context),
          (l = n.pendingProps),
          (o = n.memoizedProps),
          (u = l.value),
          U(vl, r._currentValue),
          (r._currentValue = u),
          o !== null)
        )
          if (Xe(o.value, u)) {
            if (o.children === l.children && !_e.current) {
              n = hn(e, n, t)
              break e
            }
          } else
            for (o = n.child, o !== null && (o.return = n); o !== null; ) {
              var s = o.dependencies
              if (s !== null) {
                u = o.child
                for (var a = s.firstContext; a !== null; ) {
                  if (a.context === r) {
                    if (o.tag === 1) {
                      ;((a = cn(-1, t & -t)), (a.tag = 2))
                      var h = o.updateQueue
                      if (h !== null) {
                        h = h.shared
                        var w = h.pending
                        ;(w === null ? (a.next = a) : ((a.next = w.next), (w.next = a)),
                          (h.pending = a))
                      }
                    }
                    ;((o.lanes |= t),
                      (a = o.alternate),
                      a !== null && (a.lanes |= t),
                      Yo(o.return, t, n),
                      (s.lanes |= t))
                    break
                  }
                  a = a.next
                }
              } else if (o.tag === 10) u = o.type === n.type ? null : o.child
              else if (o.tag === 18) {
                if (((u = o.return), u === null)) throw Error(E(341))
                ;((u.lanes |= t),
                  (s = u.alternate),
                  s !== null && (s.lanes |= t),
                  Yo(u, t, n),
                  (u = o.sibling))
              } else u = o.child
              if (u !== null) u.return = o
              else
                for (u = o; u !== null; ) {
                  if (u === n) {
                    u = null
                    break
                  }
                  if (((o = u.sibling), o !== null)) {
                    ;((o.return = u.return), (u = o))
                    break
                  }
                  u = u.return
                }
              o = u
            }
        ;(ge(e, n, l.children, t), (n = n.child))
      }
      return n
    case 9:
      return (
        (l = n.type),
        (r = n.pendingProps.children),
        St(n, t),
        (l = Ae(l)),
        (r = r(l)),
        (n.flags |= 1),
        ge(e, n, r, t),
        n.child
      )
    case 14:
      return ((r = n.type), (l = Ue(r, n.pendingProps)), (l = Ue(r.type, l)), ns(e, n, r, l, t))
    case 15:
      return uc(e, n, n.type, n.pendingProps, t)
    case 17:
      return (
        (r = n.type),
        (l = n.pendingProps),
        (l = n.elementType === r ? l : Ue(r, l)),
        el(e, n),
        (n.tag = 1),
        xe(r) ? ((e = !0), hl(n)) : (e = !1),
        St(n, t),
        lc(n, r, l),
        Zo(n, r, l, t),
        bo(null, n, r, !0, e, t)
      )
    case 19:
      return dc(e, n, t)
    case 22:
      return sc(e, n, t)
  }
  throw Error(E(156, n.tag))
}
function Nc(e, n) {
  return na(e, n)
}
function xp(e, n, t, r) {
  ;((this.tag = e),
    (this.key = t),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = n),
    (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null))
}
function Oe(e, n, t, r) {
  return new xp(e, n, t, r)
}
function eu(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent))
}
function Pp(e) {
  if (typeof e == 'function') return eu(e) ? 1 : 0
  if (e != null) {
    if (((e = e.$$typeof), e === wi)) return 11
    if (e === Si) return 14
  }
  return 2
}
function Ln(e, n) {
  var t = e.alternate
  return (
    t === null
      ? ((t = Oe(e.tag, n, e.key, e.mode)),
        (t.elementType = e.elementType),
        (t.type = e.type),
        (t.stateNode = e.stateNode),
        (t.alternate = e),
        (e.alternate = t))
      : ((t.pendingProps = n),
        (t.type = e.type),
        (t.flags = 0),
        (t.subtreeFlags = 0),
        (t.deletions = null)),
    (t.flags = e.flags & 14680064),
    (t.childLanes = e.childLanes),
    (t.lanes = e.lanes),
    (t.child = e.child),
    (t.memoizedProps = e.memoizedProps),
    (t.memoizedState = e.memoizedState),
    (t.updateQueue = e.updateQueue),
    (n = e.dependencies),
    (t.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }),
    (t.sibling = e.sibling),
    (t.index = e.index),
    (t.ref = e.ref),
    t
  )
}
function rl(e, n, t, r, l, o) {
  var u = 2
  if (((r = e), typeof e == 'function')) eu(e) && (u = 1)
  else if (typeof e == 'string') u = 5
  else
    e: switch (e) {
      case ot:
        return Kn(t.children, l, o, n)
      case gi:
        ;((u = 8), (l |= 8))
        break
      case So:
        return ((e = Oe(12, t, n, l | 2)), (e.elementType = So), (e.lanes = o), e)
      case ko:
        return ((e = Oe(13, t, n, l)), (e.elementType = ko), (e.lanes = o), e)
      case Eo:
        return ((e = Oe(19, t, n, l)), (e.elementType = Eo), (e.lanes = o), e)
      case Bs:
        return Al(t, l, o, n)
      default:
        if (typeof e == 'object' && e !== null)
          switch (e.$$typeof) {
            case Is:
              u = 10
              break e
            case Os:
              u = 9
              break e
            case wi:
              u = 11
              break e
            case Si:
              u = 14
              break e
            case gn:
              ;((u = 16), (r = null))
              break e
          }
        throw Error(E(130, e == null ? e : typeof e, ''))
    }
  return ((n = Oe(u, t, n, l)), (n.elementType = e), (n.type = r), (n.lanes = o), n)
}
function Kn(e, n, t, r) {
  return ((e = Oe(7, e, r, n)), (e.lanes = t), e)
}
function Al(e, n, t, r) {
  return (
    (e = Oe(22, e, r, n)),
    (e.elementType = Bs),
    (e.lanes = t),
    (e.stateNode = { isHidden: !1 }),
    e
  )
}
function yo(e, n, t) {
  return ((e = Oe(6, e, null, n)), (e.lanes = t), e)
}
function vo(e, n, t) {
  return (
    (n = Oe(4, e.children !== null ? e.children : [], e.key, n)),
    (n.lanes = t),
    (n.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    n
  )
}
function Tp(e, n, t, r, l) {
  ;((this.tag = n),
    (this.containerInfo = e),
    (this.finishedWork = this.pingCache = this.current = this.pendingChildren = null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = Zl(0)),
    (this.expirationTimes = Zl(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = Zl(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = l),
    (this.mutableSourceEagerHydrationData = null))
}
function nu(e, n, t, r, l, o, u, s, a) {
  return (
    (e = new Tp(e, n, t, s, a)),
    n === 1 ? ((n = 1), o === !0 && (n |= 8)) : (n = 0),
    (o = Oe(3, null, null, n)),
    (e.current = o),
    (o.stateNode = e),
    (o.memoizedState = {
      element: r,
      isDehydrated: t,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    Bi(o),
    e
  )
}
function Np(e, n, t) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null
  return {
    $$typeof: lt,
    key: r == null ? null : '' + r,
    children: e,
    containerInfo: n,
    implementation: t,
  }
}
function Mc(e) {
  if (!e) return jn
  e = e._reactInternals
  e: {
    if (bn(e) !== e || e.tag !== 1) throw Error(E(170))
    var n = e
    do {
      switch (n.tag) {
        case 3:
          n = n.stateNode.context
          break e
        case 1:
          if (xe(n.type)) {
            n = n.stateNode.__reactInternalMemoizedMergedChildContext
            break e
          }
      }
      n = n.return
    } while (n !== null)
    throw Error(E(171))
  }
  if (e.tag === 1) {
    var t = e.type
    if (xe(t)) return Ma(e, t, n)
  }
  return n
}
function zc(e, n, t, r, l, o, u, s, a) {
  return (
    (e = nu(t, r, !0, e, l, o, u, s, a)),
    (e.context = Mc(null)),
    (t = e.current),
    (r = we()),
    (l = zn(t)),
    (o = cn(r, l)),
    (o.callback = n ?? null),
    Nn(t, o, l),
    (e.current.lanes = l),
    kr(e, l, r),
    Pe(e, r),
    e
  )
}
function $l(e, n, t, r) {
  var l = n.current,
    o = we(),
    u = zn(l)
  return (
    (t = Mc(t)),
    n.context === null ? (n.context = t) : (n.pendingContext = t),
    (n = cn(o, u)),
    (n.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (n.callback = r),
    (e = Nn(l, n, u)),
    e !== null && (Ye(e, l, u, o), Jr(e, l, u)),
    u
  )
}
function Tl(e) {
  if (((e = e.current), !e.child)) return null
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode
    default:
      return e.child.stateNode
  }
}
function ps(e, n) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var t = e.retryLane
    e.retryLane = t !== 0 && t < n ? t : n
  }
}
function tu(e, n) {
  ;(ps(e, n), (e = e.alternate) && ps(e, n))
}
function Mp() {
  return null
}
var Lc =
  typeof reportError == 'function'
    ? reportError
    : function (e) {
        console.error(e)
      }
function ru(e) {
  this._internalRoot = e
}
Wl.prototype.render = ru.prototype.render = function (e) {
  var n = this._internalRoot
  if (n === null) throw Error(E(409))
  $l(e, n, null, null)
}
Wl.prototype.unmount = ru.prototype.unmount = function () {
  var e = this._internalRoot
  if (e !== null) {
    this._internalRoot = null
    var n = e.containerInfo
    ;(Jn(function () {
      $l(null, e, null, null)
    }),
      (n[dn] = null))
  }
}
function Wl(e) {
  this._internalRoot = e
}
Wl.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var n = sa()
    e = { blockedOn: null, target: e, priority: n }
    for (var t = 0; t < Sn.length && n !== 0 && n < Sn[t].priority; t++);
    ;(Sn.splice(t, 0, e), t === 0 && ca(e))
  }
}
function lu(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11))
}
function Hl(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== ' react-mount-point-unstable '))
  )
}
function hs() {}
function zp(e, n, t, r, l) {
  if (l) {
    if (typeof r == 'function') {
      var o = r
      r = function () {
        var h = Tl(u)
        o.call(h)
      }
    }
    var u = zc(n, r, e, 0, null, !1, !1, '', hs)
    return (
      (e._reactRootContainer = u),
      (e[dn] = u.current),
      fr(e.nodeType === 8 ? e.parentNode : e),
      Jn(),
      u
    )
  }
  for (; (l = e.lastChild); ) e.removeChild(l)
  if (typeof r == 'function') {
    var s = r
    r = function () {
      var h = Tl(a)
      s.call(h)
    }
  }
  var a = nu(e, 0, !1, null, null, !1, !1, '', hs)
  return (
    (e._reactRootContainer = a),
    (e[dn] = a.current),
    fr(e.nodeType === 8 ? e.parentNode : e),
    Jn(function () {
      $l(n, a, t, r)
    }),
    a
  )
}
function Vl(e, n, t, r, l) {
  var o = t._reactRootContainer
  if (o) {
    var u = o
    if (typeof l == 'function') {
      var s = l
      l = function () {
        var a = Tl(u)
        s.call(a)
      }
    }
    $l(n, u, e, l)
  } else u = zp(t, n, e, l, r)
  return Tl(u)
}
ia = function (e) {
  switch (e.tag) {
    case 3:
      var n = e.stateNode
      if (n.current.memoizedState.isDehydrated) {
        var t = Ut(n.pendingLanes)
        t !== 0 && (Ci(n, t | 1), Pe(n, le()), !(W & 6) && ((Nt = le() + 500), In()))
      }
      break
    case 13:
      ;(Jn(function () {
        var r = pn(e, 1)
        if (r !== null) {
          var l = we()
          Ye(r, e, 1, l)
        }
      }),
        tu(e, 1))
  }
}
_i = function (e) {
  if (e.tag === 13) {
    var n = pn(e, 134217728)
    if (n !== null) {
      var t = we()
      Ye(n, e, 134217728, t)
    }
    tu(e, 134217728)
  }
}
ua = function (e) {
  if (e.tag === 13) {
    var n = zn(e),
      t = pn(e, n)
    if (t !== null) {
      var r = we()
      Ye(t, e, n, r)
    }
    tu(e, n)
  }
}
sa = function () {
  return V
}
aa = function (e, n) {
  var t = V
  try {
    return ((V = e), n())
  } finally {
    V = t
  }
}
Ro = function (e, n, t) {
  switch (n) {
    case 'input':
      if ((xo(e, t), (n = t.name), t.type === 'radio' && n != null)) {
        for (t = e; t.parentNode; ) t = t.parentNode
        for (
          t = t.querySelectorAll('input[name=' + JSON.stringify('' + n) + '][type="radio"]'), n = 0;
          n < t.length;
          n++
        ) {
          var r = t[n]
          if (r !== e && r.form === e.form) {
            var l = jl(r)
            if (!l) throw Error(E(90))
            ;($s(r), xo(r, l))
          }
        }
      }
      break
    case 'textarea':
      Hs(e, t)
      break
    case 'select':
      ;((n = t.value), n != null && yt(e, !!t.multiple, n, !1))
  }
}
Xs = Ji
Zs = Jn
var Lp = { usingClientEntryPoint: !1, Events: [Cr, at, jl, Gs, Ys, Ji] },
  Wt = {
    findFiberByHostInstance: Hn,
    bundleType: 0,
    version: '18.3.1',
    rendererPackageName: 'react-dom',
  },
  Rp = {
    bundleType: Wt.bundleType,
    version: Wt.version,
    rendererPackageName: Wt.rendererPackageName,
    rendererConfig: Wt.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: mn.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = bs(e)), e === null ? null : e.stateNode)
    },
    findFiberByHostInstance: Wt.findFiberByHostInstance || Mp,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: '18.3.1-next-f1338f8080-20240426',
  }
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
  var Ur = __REACT_DEVTOOLS_GLOBAL_HOOK__
  if (!Ur.isDisabled && Ur.supportsFiber)
    try {
      ;((Ml = Ur.inject(Rp)), (be = Ur))
    } catch {}
}
Re.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Lp
Re.createPortal = function (e, n) {
  var t = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null
  if (!lu(n)) throw Error(E(200))
  return Np(e, n, null, t)
}
Re.createRoot = function (e, n) {
  if (!lu(e)) throw Error(E(299))
  var t = !1,
    r = '',
    l = Lc
  return (
    n != null &&
      (n.unstable_strictMode === !0 && (t = !0),
      n.identifierPrefix !== void 0 && (r = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (l = n.onRecoverableError)),
    (n = nu(e, 1, !1, null, null, t, !1, r, l)),
    (e[dn] = n.current),
    fr(e.nodeType === 8 ? e.parentNode : e),
    new ru(n)
  )
}
Re.findDOMNode = function (e) {
  if (e == null) return null
  if (e.nodeType === 1) return e
  var n = e._reactInternals
  if (n === void 0)
    throw typeof e.render == 'function'
      ? Error(E(188))
      : ((e = Object.keys(e).join(',')), Error(E(268, e)))
  return ((e = bs(n)), (e = e === null ? null : e.stateNode), e)
}
Re.flushSync = function (e) {
  return Jn(e)
}
Re.hydrate = function (e, n, t) {
  if (!Hl(n)) throw Error(E(200))
  return Vl(null, e, n, !0, t)
}
Re.hydrateRoot = function (e, n, t) {
  if (!lu(e)) throw Error(E(405))
  var r = (t != null && t.hydratedSources) || null,
    l = !1,
    o = '',
    u = Lc
  if (
    (t != null &&
      (t.unstable_strictMode === !0 && (l = !0),
      t.identifierPrefix !== void 0 && (o = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (u = t.onRecoverableError)),
    (n = zc(n, null, e, 1, t ?? null, l, !1, o, u)),
    (e[dn] = n.current),
    fr(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      ((t = r[e]),
        (l = t._getVersion),
        (l = l(t._source)),
        n.mutableSourceEagerHydrationData == null
          ? (n.mutableSourceEagerHydrationData = [t, l])
          : n.mutableSourceEagerHydrationData.push(t, l))
  return new Wl(n)
}
Re.render = function (e, n, t) {
  if (!Hl(n)) throw Error(E(200))
  return Vl(null, e, n, !1, t)
}
Re.unmountComponentAtNode = function (e) {
  if (!Hl(e)) throw Error(E(40))
  return e._reactRootContainer
    ? (Jn(function () {
        Vl(null, null, e, !1, function () {
          ;((e._reactRootContainer = null), (e[dn] = null))
        })
      }),
      !0)
    : !1
}
Re.unstable_batchedUpdates = Ji
Re.unstable_renderSubtreeIntoContainer = function (e, n, t, r) {
  if (!Hl(t)) throw Error(E(200))
  if (e == null || e._reactInternals === void 0) throw Error(E(38))
  return Vl(e, n, t, !1, r)
}
Re.version = '18.3.1-next-f1338f8080-20240426'
function Rc() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Rc)
    } catch (e) {
      console.error(e)
    }
}
;(Rc(), (Rs.exports = Re))
var jp = Rs.exports,
  ms = jp
;((go.createRoot = ms.createRoot), (go.hydrateRoot = ms.hydrateRoot))
const Fp = 'modulepreload',
  Dp = function (e) {
    return '/' + e
  },
  ys = {},
  Ip = function (n, t, r) {
    let l = Promise.resolve()
    if (t && t.length > 0) {
      document.getElementsByTagName('link')
      const u = document.querySelector('meta[property=csp-nonce]'),
        s = (u == null ? void 0 : u.nonce) || (u == null ? void 0 : u.getAttribute('nonce'))
      l = Promise.allSettled(
        t.map((a) => {
          if (((a = Dp(a)), a in ys)) return
          ys[a] = !0
          const h = a.endsWith('.css'),
            w = h ? '[rel="stylesheet"]' : ''
          if (document.querySelector(`link[href="${a}"]${w}`)) return
          const v = document.createElement('link')
          if (
            ((v.rel = h ? 'stylesheet' : Fp),
            h || (v.as = 'script'),
            (v.crossOrigin = ''),
            (v.href = a),
            s && v.setAttribute('nonce', s),
            document.head.appendChild(v),
            h)
          )
            return new Promise((g, C) => {
              ;(v.addEventListener('load', g),
                v.addEventListener('error', () => C(new Error(`Unable to preload CSS for ${a}`))))
            })
        })
      )
    }
    function o(u) {
      const s = new Event('vite:preloadError', { cancelable: !0 })
      if (((s.payload = u), window.dispatchEvent(s), !s.defaultPrevented)) throw u
    }
    return l.then((u) => {
      for (const s of u || []) s.status === 'rejected' && o(s.reason)
      return n().catch(o)
    })
  }
class vs {
  static createExplosion(n, t, r = '#ff6b6b', l = 20) {
    const o = []
    for (let u = 0; u < l; u++)
      o.push({
        x: n,
        y: t,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        color: r,
        size: Math.random() * 3 + 2,
      })
    return o
  }
  static createTrail(n, t, r = '#4ecdc4') {
    return { x: n, y: t, life: 15, maxLife: 15, color: r, size: 3 }
  }
  static createStar(n, t) {
    return {
      x: n,
      y: t,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 60,
      maxLife: 60,
      color: '#fff',
      size: Math.random() * 2,
    }
  }
  static createPowerUpGlow(n, t, r = '#ffd700') {
    const l = []
    for (let o = 0; o < 8; o++)
      l.push({
        x: n + Math.cos((o * Math.PI) / 4) * 15,
        y: t + Math.sin((o * Math.PI) / 4) * 15,
        vx: 0,
        vy: 0,
        life: 20,
        maxLife: 20,
        color: r,
        size: 2,
      })
    return l
  }
}
const gs = {
    health: {
      name: 'Health Boost',
      color: '#4ecdc4',
      icon: '❤️',
      effect: 'restoreHealth',
      duration: 0,
    },
    shield: { name: 'Shield', color: '#00ffff', icon: '🛡️', effect: 'addShield', duration: 1e4 },
    rapidFire: {
      name: 'Rapid Fire',
      color: '#ff6b6b',
      icon: '⚡',
      effect: 'rapidFire',
      duration: 15e3,
    },
    multiShot: {
      name: 'Multi Shot',
      color: '#ffd700',
      icon: '🎯',
      effect: 'multiShot',
      duration: 2e4,
    },
    slowMotion: {
      name: 'Slow Motion',
      color: '#9b59b6',
      icon: '⏰',
      effect: 'slowMotion',
      duration: 8e3,
    },
    missilePack: {
      name: 'Missile Pack',
      color: '#e74c3c',
      icon: '🚀',
      effect: 'missiles',
      duration: 3e4,
    },
    speedBoost: {
      name: 'Speed Boost',
      color: '#3498db',
      icon: '💨',
      effect: 'speedBoost',
      duration: 12e3,
    },
    coinDoubler: {
      name: 'Score Doubler',
      color: '#2ecc71',
      icon: '💰',
      effect: 'coinDoubler',
      duration: 25e3,
    },
    life: { name: 'Extra Life', color: '#ff1493', icon: '💖', effect: 'addLife', duration: 0 },
    healthMax: {
      name: 'Max Health',
      color: '#ff0080',
      icon: '❤️‍🔥',
      effect: 'restoreFullHealth',
      duration: 0,
    },
    invulnerability: {
      name: 'Invulnerability',
      color: '#ff00ff',
      icon: '✨',
      effect: 'invulnerability',
      duration: 5e3,
    },
    slowEnemies: {
      name: 'Slow Enemies',
      color: '#9370db',
      icon: '🧊',
      effect: 'slowEnemies',
      duration: 1e4,
    },
    magnet: { name: 'Magnet', color: '#ff6347', icon: '🧲', effect: 'magnet', duration: 15e3 },
    freeze: { name: 'Freeze', color: '#00bfff', icon: '🧊', effect: 'freeze', duration: 8e3 },
    omega: {
      name: 'Omega Blast',
      color: '#ff0080',
      icon: '💥',
      effect: 'omegaBlast',
      duration: 12e3,
    },
    mines: { name: 'Mines', color: '#ff8c00', icon: '💣', effect: 'deployMines', duration: 2e4 },
    drone: { name: 'Drone', color: '#32cd32', icon: '🤖', effect: 'activateDrone', duration: 3e4 },
    nuke: { name: 'Nuke', color: '#ff0000', icon: '☢️', effect: 'nuke', duration: 0 },
    rockets: { name: 'Rockets', color: '#ffa500', icon: '🔥', effect: 'rockets', duration: 25e3 },
    burst: { name: 'Burst Fire', color: '#9932cc', icon: '💫', effect: 'burstFire', duration: 2e4 },
    piercing: {
      name: 'Piercing Shot',
      color: '#00ced1',
      icon: '⚡',
      effect: 'piercing',
      duration: 15e3,
    },
    bounce: { name: 'Bounce Shot', color: '#00ff00', icon: '⚽', effect: 'bounce', duration: 18e3 },
    fire: { name: 'Fire Mode', color: '#ff4500', icon: '🔥', effect: 'fireMode', duration: 2e4 },
    ice: { name: 'Ice Mode', color: '#b0e0e6', icon: '❄️', effect: 'iceMode', duration: 2e4 },
    lightning: {
      name: 'Lightning',
      color: '#ffff00',
      icon: '⚡',
      effect: 'lightning',
      duration: 15e3,
    },
    poison: { name: 'Poison', color: '#7bff00', icon: '☠️', effect: 'poison', duration: 25e3 },
    seismic: {
      name: 'Seismic Wave',
      color: '#8b4513',
      icon: '🌊',
      effect: 'seismic',
      duration: 1e4,
    },
    timeFreeze: {
      name: 'Time Freeze',
      color: '#4169e1',
      icon: '🕐',
      effect: 'timeFreeze',
      duration: 5e3,
    },
    clone: { name: 'Clone Ship', color: '#9370db', icon: '👥', effect: 'clone', duration: 3e4 },
    supernova: {
      name: 'Supernova',
      color: '#ff1493',
      icon: '🌟',
      effect: 'supernova',
      duration: 0,
    },
    weapon_laser: {
      name: 'Laser',
      color: '#00ffff',
      icon: '🔷',
      effect: 'weapon',
      weapon: 'laser',
      duration: 0,
    },
    weapon_spread: {
      name: 'Spread Shot',
      color: '#ffd700',
      icon: '🎆',
      effect: 'weapon',
      weapon: 'spread',
      duration: 0,
    },
    weapon_plasma: {
      name: 'Plasma',
      color: '#ff00ff',
      icon: '💜',
      effect: 'weapon',
      weapon: 'plasma',
      duration: 0,
    },
    weapon_missile: {
      name: 'Missile',
      color: '#ff6347',
      icon: '🚀',
      effect: 'weapon',
      weapon: 'missile',
      duration: 0,
    },
    weapon_shotgun: {
      name: 'Shotgun',
      color: '#ff4500',
      icon: '🔫',
      effect: 'weapon',
      weapon: 'shotgun',
      duration: 0,
    },
    weapon_flamethrower: {
      name: 'Flamethrower',
      color: '#ff0000',
      icon: '🔥',
      effect: 'weapon',
      weapon: 'flamethrower',
      duration: 0,
    },
    weapon_freeze: {
      name: 'Ice Gun',
      color: '#00bfff',
      icon: '🧊',
      effect: 'weapon',
      weapon: 'freeze',
      duration: 0,
    },
    weapon_electric: {
      name: 'Tesla',
      color: '#ffff00',
      icon: '⚡',
      effect: 'weapon',
      weapon: 'electric',
      duration: 0,
    },
    weapon_poison: {
      name: 'Toxin',
      color: '#7bff00',
      icon: '☠️',
      effect: 'weapon',
      weapon: 'poison',
      duration: 0,
    },
    weapon_explosive: {
      name: 'Explosive',
      color: '#ff8c00',
      icon: '💣',
      effect: 'weapon',
      weapon: 'explosive',
      duration: 0,
    },
    weapon_piercing: {
      name: 'Piercer',
      color: '#9370db',
      icon: '⚒️',
      effect: 'weapon',
      weapon: 'piercing',
      duration: 0,
    },
    weapon_homing: {
      name: 'Homing',
      color: '#32cd32',
      icon: '🎯',
      effect: 'weapon',
      weapon: 'homing',
      duration: 0,
    },
    weapon_bounce: {
      name: 'Ricochet',
      color: '#ff1493',
      icon: '⚽',
      effect: 'weapon',
      weapon: 'bounce',
      duration: 0,
    },
    weapon_beam: {
      name: 'Beam',
      color: '#00ff00',
      icon: '⚡',
      effect: 'weapon',
      weapon: 'beam',
      duration: 0,
    },
    weapon_laserRifle: {
      name: 'Laser Rifle',
      color: '#ff6347',
      icon: '🔷',
      effect: 'weapon',
      weapon: 'laserRifle',
      duration: 0,
    },
    weapon_minigun: {
      name: 'Minigun',
      color: '#e74c3c',
      icon: '⚙️',
      effect: 'weapon',
      weapon: 'minigun',
      duration: 0,
    },
    weapon_railgun: {
      name: 'Railgun',
      color: '#3498db',
      icon: '⚡',
      effect: 'weapon',
      weapon: 'railgun',
      duration: 0,
    },
    weapon_cluster: {
      name: 'Cluster Bombs',
      color: '#9b59b6',
      icon: '💣',
      effect: 'weapon',
      weapon: 'cluster',
      duration: 0,
    },
    weapon_shockwave: {
      name: 'Shockwave',
      color: '#1abc9c',
      icon: '💥',
      effect: 'weapon',
      weapon: 'shockwave',
      duration: 0,
    },
    weapon_flak: {
      name: 'Flak Cannon',
      color: '#e67e22',
      icon: '💀',
      effect: 'weapon',
      weapon: 'flak',
      duration: 0,
    },
    weapon_cryo: {
      name: 'Cryogenic',
      color: '#3498db',
      icon: '❄️',
      effect: 'weapon',
      weapon: 'cryo',
      duration: 0,
    },
    weapon_plasma_rifle: {
      name: 'Plasma Rifle',
      color: '#9b59b6',
      icon: '🔮',
      effect: 'weapon',
      weapon: 'plasmaRifle',
      duration: 0,
    },
    weapon_rocket: {
      name: 'Rocket Launcher',
      color: '#ff6347',
      icon: '🚀',
      effect: 'weapon',
      weapon: 'rocket',
      duration: 0,
    },
    weapon_acid: {
      name: 'Acid Spray',
      color: '#2ecc71',
      icon: '🧪',
      effect: 'weapon',
      weapon: 'acid',
      duration: 0,
    },
    weapon_laserBeam: {
      name: 'Laser Beam',
      color: '#00ffff',
      icon: '🔺',
      effect: 'weapon',
      weapon: 'laserBeam',
      duration: 0,
    },
    weapon_grenade: {
      name: 'Grenade Launcher',
      color: '#ff6b6b',
      icon: '💥',
      effect: 'weapon',
      weapon: 'grenade',
      duration: 0,
    },
    weapon_sniper: {
      name: 'Sniper',
      color: '#95a5a6',
      icon: '🎯',
      effect: 'weapon',
      weapon: 'sniper',
      duration: 0,
    },
    weapon_machinegun: {
      name: 'Machine Gun',
      color: '#e74c3c',
      icon: '⚙️',
      effect: 'weapon',
      weapon: 'machinegun',
      duration: 0,
    },
    weapon_volcano: {
      name: 'Volcano',
      color: '#e67e22',
      icon: '🌋',
      effect: 'weapon',
      weapon: 'volcano',
      duration: 0,
    },
    weapon_nuclear: {
      name: 'Nuclear',
      color: '#ff0000',
      icon: '☢️',
      effect: 'weapon',
      weapon: 'nuclear',
      duration: 0,
    },
    weapon_ultimate: {
      name: 'Ultimate Weapon',
      color: '#ff1493',
      icon: '👑',
      effect: 'weapon',
      weapon: 'ultimate',
      duration: 0,
    },
  },
  Op = (e, n) => {
    const t = Object.keys(gs),
      r = t[Math.floor(Math.random() * t.length)]
    return { ...gs[r], x: e, y: n, width: 25, height: 25, speed: 2, rotation: 0, pulse: 0 }
  },
  Bp = (e, n) => {
    switch (n.effect) {
      case 'restoreHealth':
        e.health = Math.min(100, e.health + 50)
        break
      case 'addShield':
        ;((e.shield = !0), (e.shieldTimer = n.duration))
        break
      case 'rapidFire':
        ;((e.rapidFire = !0), (e.rapidFireTimer = n.duration))
        break
      case 'multiShot':
        ;((e.multiShot = !0), (e.multiShotTimer = n.duration))
        break
      case 'slowMotion':
        ;((e.slowMotion = !0), (e.slowMotionTimer = n.duration))
        break
      case 'missiles':
        ;((e.currentWeapon = 'missile'), (e.missilePackTimer = n.duration))
        break
      case 'speedBoost':
        ;((e.player.speed = e.player.speed * 1.5), (e.speedBoostTimer = n.duration))
        break
      case 'coinDoubler':
        ;((e.coinDoubler = !0), (e.coinDoublerTimer = n.duration))
        break
      case 'weapon':
        n.weapon && ((e.currentWeapon = n.weapon), console.log('Weapon changed to:', n.weapon))
        break
      default:
        n.weapon && ((e.currentWeapon = n.weapon), console.log('Weapon changed to:', n.weapon))
        break
    }
  },
  Kt = {
    firstKill: {
      id: 'first-kill',
      name: 'First Victory',
      desc: 'Destroy your first enemy',
      unlocked: !1,
      reward: 100,
    },
    combo10: {
      id: 'combo-10',
      name: 'Combo Master',
      desc: 'Achieve a 10-hit combo',
      unlocked: !1,
      reward: 200,
    },
    noDamageBoss: {
      id: 'no-damage-boss',
      name: 'Untouchable',
      desc: 'Defeat a boss without taking damage',
      unlocked: !1,
      reward: 500,
    },
    perfectWave: {
      id: 'perfect-wave',
      name: 'Perfect Wave',
      desc: 'Complete a wave without missing',
      unlocked: !1,
      reward: 300,
    },
    speedRunner: {
      id: 'speed-runner',
      name: 'Speed Runner',
      desc: 'Complete level 5 in under 5 minutes',
      unlocked: !1,
      reward: 400,
    },
    collector: {
      id: 'collector',
      name: 'Collector',
      desc: 'Collect 50 power-ups',
      unlocked: !1,
      reward: 250,
    },
    sharpshooter: {
      id: 'sharpshooter',
      name: 'Sharpshooter',
      desc: 'Get 100 headshots',
      unlocked: !1,
      reward: 350,
    },
    survivor: {
      id: 'survivor',
      name: 'Survivor',
      desc: 'Survive 1000 enemies',
      unlocked: !1,
      reward: 500,
    },
    millionaire: {
      id: 'millionaire',
      name: 'Millionaire',
      desc: 'Score 1 million points',
      unlocked: !1,
      reward: 1e3,
    },
    destroyer: {
      id: 'destroyer',
      name: 'Destroyer',
      desc: 'Destroy 10,000 enemies',
      unlocked: !1,
      reward: 2e3,
    },
  },
  Qr = (e, n) => (Kt[e].unlocked ? null : ((Kt[e].unlocked = !0), n((t) => [...t, Kt[e]]), Kt[e])),
  Gt = {}
let ws = !1
const Ap = () => {
    if (ws) return Promise.resolve()
    const e = [
      { key: 'boss1', url: '/boss-ships/boss1.png' },
      { key: 'boss2', url: '/boss-ships/boss2.png' },
      { key: 'boss3', url: '/boss-ships/boss3.png' },
    ].map(
      ({ key: n, url: t }) =>
        new Promise((r, l) => {
          const o = new Image()
          ;((o.onload = () => r({ key: n, img: o })),
            (o.onerror = () => {
              ;(console.warn(`Failed to load boss image: ${t}`), r({ key: n, img: null }))
            }),
            (o.src = t))
        })
    )
    return Promise.all(e).then((n) => {
      ;(n.forEach(({ key: t, img: r }) => {
        Gt[t] = r
      }),
        (ws = !0))
    })
  },
  $p = (e) => {
    const n = { asteroid: Gt.boss1, alien: Gt.boss2, robot: Gt.boss3, dragon: Gt.boss1 }
    return n[e] || n.asteroid
  },
  Wp = {
    asteroid: {
      name: 'Asteroid King',
      health: 200,
      maxHealth: 200,
      speed: 1,
      color: '#8b4513',
      pattern: 'straight',
      reward: 1e3,
      phase: 1,
      width: 150,
      height: 150,
      image: 'boss1',
    },
    alien: {
      name: 'Alien Mothership',
      health: 500,
      maxHealth: 500,
      speed: 2,
      color: '#7bff00',
      pattern: 'zigzag',
      reward: 2500,
      phase: 1,
      width: 180,
      height: 180,
      image: 'boss2',
    },
    robot: {
      name: 'Mechanical Overlord',
      health: 800,
      maxHealth: 800,
      speed: 1.5,
      color: '#ff00ff',
      pattern: 'circular',
      reward: 5e3,
      phase: 1,
      width: 200,
      height: 200,
      image: 'boss3',
    },
    dragon: {
      name: 'Space Dragon',
      health: 1e3,
      maxHealth: 1e3,
      speed: 2.5,
      color: '#ff0000',
      pattern: 'dive',
      reward: 1e4,
      phase: 1,
      width: 220,
      height: 220,
      image: 'boss1',
    },
  },
  Ss = (e, n, t) => ({ ...Wp[e], x: n, y: t, angle: 0, shootTimer: 0, phaseTimer: 0, bullets: [] }),
  Hp = (e, n, t) => {
    switch (e.pattern) {
      case 'zigzag':
        ;((e.x += Math.sin(n * 0.1) * e.speed * 2),
          (e.x = Math.max(e.width / 2, Math.min(t.width - e.width / 2, e.x))))
        break
      case 'circular':
        ;((e.angle += 0.05),
          (e.x = t.width / 2 + Math.cos(e.angle) * 150),
          (e.y = t.height / 4 + Math.sin(e.angle) * 50))
        break
      case 'dive':
        ;((e.y += Math.sin(n * 0.1) * 2), e.y > t.height / 2 && (e.y = t.height / 4))
        break
      default:
        e.y > 100 && (e.y -= e.speed)
    }
    return (e.shootTimer++, e)
  },
  Ve = (e, n = 0.5) => {
    const t = new (window.AudioContext || window.webkitAudioContext)(),
      r = t.createOscillator(),
      l = t.createGain()
    switch (((l.gain.value = n), r.connect(l), l.connect(t.destination), e)) {
      case 'laser-shoot':
        ;((r.frequency.value = 440), (r.type = 'square'))
        break
      case 'explosion':
        ;((r.frequency.value = 150), (r.type = 'sawtooth'))
        break
      case 'powerup-pickup':
        ;((r.frequency.value = 523.25), (r.type = 'sine'))
        break
      case 'hit':
        ;((r.frequency.value = 200), (r.type = 'sawtooth'))
        break
      default:
        r.frequency.value = 330
    }
    ;(r.start(), r.stop(t.currentTime + 0.1))
  },
  ou = 'kadenAdelynnScores',
  iu = (e, n = 'Player') => {
    const t = xr(),
      r = { score: e, player: n, date: new Date().toISOString(), timestamp: Date.now() }
    ;(t.push(r), t.sort((o, u) => u.score - o.score))
    const l = t.slice(0, 10)
    return (localStorage.setItem(ou, JSON.stringify(l)), l)
  },
  xr = () => {
    try {
      const e = localStorage.getItem(ou)
      return e ? JSON.parse(e) : []
    } catch {
      return []
    }
  },
  Vp = () => {
    localStorage.removeItem(ou)
  },
  Pr = () => {
    const e = xr()
    return e.length > 0 ? e[0].score : 0
  },
  jc = (e) => {
    const n = Pr()
    return e > n
  },
  Up = (e) => e.toString().padStart(8, '0'),
  Qp = () => {
    const e = xr()
    return {
      totalGames: e.length,
      averageScore: e.length > 0 ? Math.round(e.reduce((n, t) => n + t.score, 0) / e.length) : 0,
      personalBest: Pr(),
      recentScores: e.slice(0, 5),
    }
  },
  Kp = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        clearScores: Vp,
        formatScore: Up,
        getHighScores: xr,
        getPersonalBest: Pr,
        getScoreStats: Qp,
        isNewHighScore: jc,
        saveScore: iu,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  )
function Gp({ onPause: e, onGameOver: n, difficulty: t, selectedShip: r, isPaused: l }) {
  const o = O.useRef(null),
    u = O.useRef(null),
    [s, a] = O.useState(0),
    [h, w] = O.useState(25),
    [v, g] = O.useState(100),
    [C, x] = O.useState(0),
    [_, H] = O.useState(0),
    [m, d] = O.useState(1),
    [y, S] = O.useState(1),
    [N, z] = O.useState(0),
    [L, R] = O.useState([]),
    [G, B] = O.useState(0),
    [Fe, On] = O.useState(0),
    [et, Ul] = O.useState(1),
    ee = O.useRef({
      keys: {},
      player: { x: 400, y: 550, width: 40, height: 40, speed: 5 },
      enemies: [],
      bullets: [],
      currentScore: 0,
      isTouching: !1,
      touchShootTimer: 0,
      missiles: [],
      powerUps: [],
      particles: [],
      enemiesSpawned: 0,
      lastEnemySpawn: 0,
      lastBulletShot: 0,
      currentWeapon: 'laser',
      invulnerable: !1,
      rapidFire: !1,
      rapidFireTimer: 0,
      shield: !1,
      shieldTimer: 0,
      wingFighters: [],
      boss: null,
      isBossFight: !1,
      gameMode: 'classic',
      wave: 1,
      level: 1,
      comboMultiplier: 1,
      scoreMultiplier: 1,
      slowMotion: !1,
      slowMotionTimer: 0,
      missilePackTimer: 0,
      speedBoostTimer: 0,
      coinDoubler: !1,
      coinDoublerTimer: 0,
      coins: 0,
      streakCombo: 0,
      perfectWave: !0,
      hitstop: !1,
      shakeIntensity: 0,
      backgroundOffset: 0,
      nebulaColors: ['#ff6b6b', '#4ecdc4', '#95a5a6', '#ffa502'],
      explosions: [],
      trails: [],
      plasmaBeams: [],
      enemyBullets: [],
      asteroids: [],
      lastAsteroidSpawn: 0,
      lastFrameTime: 0,
      deltaTime: 16.67,
    })
  O.useEffect(() => {
    const i = o.current
    ;(i.getContext('2d'), Ap())
    const c = () => {
      ;((i.width = window.innerWidth), (i.height = window.innerHeight))
    }
    ;(c(), window.addEventListener('resize', c), l || (u.current = requestAnimationFrame(nn)))
    const f = ($) => {
        ;((ee.current.keys[$.key] = !0), ($.key === 'p' || $.key === 'P') && e())
      },
      p = ($) => {
        ee.current.keys[$.key] = !1
      },
      j = ($) => {
        if (($.preventDefault(), $.stopPropagation(), !$.touches || $.touches.length === 0)) return
        const Y = $.touches[0],
          ne = i.getBoundingClientRect(),
          Bn = Y.clientX - ne.left,
          ln = Y.clientY - ne.top,
          Te = (Bn / ne.width) * i.width,
          pe = (ln / ne.height) * i.height
        ;((ee.current.player.x = Math.max(
          0,
          Math.min(i.width - ee.current.player.width, Te - ee.current.player.width / 2)
        )),
          (ee.current.player.y = Math.max(
            0,
            Math.min(i.height - ee.current.player.height, pe - ee.current.player.height / 2)
          )),
          (ee.current.isTouching = !0),
          (ee.current.touchShootTimer = Date.now()),
          P(ee.current))
      },
      M = ($) => {
        if (($.preventDefault(), $.stopPropagation(), !$.touches || $.touches.length === 0)) return
        const Y = $.touches[0],
          ne = i.getBoundingClientRect(),
          Bn = Y.clientX - ne.left,
          ln = Y.clientY - ne.top,
          Te = (Bn / ne.width) * i.width,
          pe = (ln / ne.height) * i.height
        ;((ee.current.player.x = Math.max(
          0,
          Math.min(i.width - ee.current.player.width, Te - ee.current.player.width / 2)
        )),
          (ee.current.player.y = Math.max(
            0,
            Math.min(i.height - ee.current.player.height, pe - ee.current.player.height / 2)
          )),
          (ee.current.isTouching = !0))
      },
      F = () => {
        ee.current.isTouching = !1
      }
    return (
      window.addEventListener('keydown', f),
      window.addEventListener('keyup', p),
      i.addEventListener('touchstart', j, { passive: !1 }),
      i.addEventListener('touchmove', M, { passive: !1 }),
      i.addEventListener('touchend', F, { passive: !1 }),
      () => {
        ;(u.current && cancelAnimationFrame(u.current),
          window.removeEventListener('resize', c),
          window.removeEventListener('keydown', f),
          window.removeEventListener('keyup', p),
          i.removeEventListener('touchstart', j),
          i.removeEventListener('touchmove', M),
          i.removeEventListener('touchend', F))
      }
    )
  }, [l, e])
  const nn = O.useCallback(
    (i) => {
      const c = o.current
      if (!c) return
      const f = c.getContext('2d')
      if (!f) return
      const p = ee.current
      p.lastFrameTime === 0 && (p.lastFrameTime = i)
      const j = i - p.lastFrameTime
      if (((p.lastFrameTime = i), j < 16.67)) {
        u.current = requestAnimationFrame(nn)
        return
      }
      if (
        ((p.deltaTime = j),
        Ac(p),
        p.shakeIntensity > 0 &&
          (f.save(),
          f.translate(
            (Math.random() - 0.5) * p.shakeIntensity,
            (Math.random() - 0.5) * p.shakeIntensity
          ),
          (p.shakeIntensity *= 0.9)),
        Gc(f, p),
        Rt(p),
        p.isTouching)
      ) {
        const M = Date.now()
        M - p.touchShootTimer >= 50 && (P(p), (p.touchShootTimer = M))
      }
      if (
        (D(p),
        $c(p),
        I(p),
        Wc(p),
        Ic(p),
        Oc(p),
        Bc(p),
        Hc(p),
        Vc(p),
        Uc(p),
        Kc(p),
        nt(p),
        Z(p),
        Qc(p),
        Xc(f),
        bc(f, p),
        rn(f, p),
        tt(f, p),
        jt(f, p),
        Zc(f, p),
        Jc(f, p),
        qc(f, p),
        Dc(f, p),
        Fc(f, p),
        tn(f, p),
        ef(f, p),
        rf(f, p),
        p.shakeIntensity > 0 && f.restore(),
        tf(p),
        nf(p),
        h <= 0)
      ) {
        n(s, m, y, _, C)
        return
      }
      if (h <= 0 && s > 0)
        try {
          Ip(() => Promise.resolve().then(() => Kp), void 0)
            .then((M) => {
              M.saveScore(s)
            })
            .catch((M) => {
              console.error('Failed to save score:', M)
            })
        } catch (M) {
          console.error('Failed to import score tracking:', M)
        }
      ;(On((M) => M + 1), l || (u.current = requestAnimationFrame(nn)))
    },
    [l, h, n]
  )
  O.useEffect(() => {
    !l && o.current && (u.current = requestAnimationFrame(nn))
  }, [l, nn])
  const Rt = (i) => {
      const c = o.current
      if (!c) return
      const f = i.slowMotion ? i.player.speed * 0.5 : i.player.speed,
        p = Math.min(i.deltaTime / 16.67, 2)
      ;((i.keys.a || i.keys.A || i.keys.ArrowLeft) &&
        (i.player.x = Math.max(20, i.player.x - f * p)),
        (i.keys.d || i.keys.D || i.keys.ArrowRight) &&
          (i.player.x = Math.min(c.width - i.player.width - 20, i.player.x + f * p)),
        (i.keys.w || i.keys.W || i.keys.ArrowUp) && (i.player.y = Math.max(50, i.player.y - f * p)),
        (i.keys.s || i.keys.S || i.keys.ArrowDown) &&
          (i.player.y = Math.min(c.height - i.player.height - 20, i.player.y + f * p)))
      const j = Date.now(),
        M = i.rapidFire ? 100 : 200
      ;(i.keys[' '] || i.keys.Spacebar) &&
        j - i.lastBulletShot > M &&
        (P(i), (i.lastBulletShot = j))
    },
    P = (i) => {
      Ve('laser-shoot', 0.2)
      const c = {
        x: i.player.x,
        y: i.player.y,
        speed: 10,
        owner: 'player',
        weapon: i.currentWeapon,
        width: 5,
        height: 10,
      }
      switch (i.currentWeapon) {
        case 'laser':
        case 'laserRifle':
        case 'weapon_laser':
          i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, color: '#00ffff' })
          break
        case 'spread':
        case 'weapon_spread':
          ;(i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, color: '#ffd700' }),
            i.bullets.push({ ...c, x: i.player.x - 10, angle: -0.3, color: '#ffd700' }),
            i.bullets.push({ ...c, x: i.player.x + 20, angle: 0.3, color: '#ffd700' }))
          break
        case 'plasma':
        case 'plasmaRifle':
        case 'weapon_plasma':
        case 'weapon_plasma_rifle':
          i.plasmaBeams.push({ x: i.player.x, y: i.player.y, width: 8, height: 15, life: 50 })
          break
        case 'missile':
        case 'rocket':
        case 'weapon_missile':
        case 'weapon_rocket':
          ;(i.missiles.push({
            x: i.player.x,
            y: i.player.y,
            speed: 8,
            target: null,
            explosion: !1,
          }),
            Ve('missile', 0.3))
          break
        case 'shotgun':
        case 'weapon_shotgun':
          for (let p = 0; p < 5; p++)
            i.bullets.push({ ...c, x: i.player.x + p * 8, angle: (p - 2) * 0.2, color: '#ff6347' })
          break
        case 'minigun':
        case 'machinegun':
        case 'weapon_minigun':
        case 'weapon_machinegun':
          ;(i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, color: '#e74c3c' }),
            i.bullets.push({
              ...c,
              x: i.player.x + i.player.width / 2 + 5,
              speed: 12,
              color: '#e74c3c',
            }))
          break
        case 'flamethrower':
        case 'fireMode':
        case 'weapon_fire':
        case 'weapon_flamethrower':
          for (let p = 0; p < 3; p++)
            i.bullets.push({
              ...c,
              x: i.player.x + p * 10,
              angle: (p - 1) * 0.15,
              color: '#ff4500',
            })
          break
        case 'freeze':
        case 'weapon_freeze':
        case 'ice':
        case 'weapon_ice':
          i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, color: '#00bfff', freeze: !0 })
          break
        case 'electric':
        case 'lightning':
        case 'weapon_electric':
        case 'weapon_lightning':
          i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, speed: 15, color: '#ffff00' })
          for (let p = 0; p < 3; p++)
            i.bullets.push({ ...c, x: i.player.x + p * 15, angle: (p - 1) * 0.1, color: '#ffff00' })
          break
        case 'poison':
        case 'weapon_poison':
          i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, color: '#7bff00', poison: !0 })
          break
        case 'explosive':
        case 'weapon_explosive':
          i.bullets.push({
            ...c,
            x: i.player.x + i.player.width / 2,
            color: '#ff8c00',
            explosive: !0,
          })
          break
        case 'piercing':
        case 'weapon_piercing':
          i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, pierce: !0, color: '#9370db' })
          break
        case 'homing':
        case 'weapon_homing':
          const f = i.enemies[0]
          i.missiles.push({
            x: i.player.x,
            y: i.player.y,
            speed: 8,
            target: f,
            explosion: !1,
            homing: !0,
          })
          break
        case 'bounce':
        case 'weapon_bounce':
          i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, bounce: !0, color: '#00ff00' })
          break
        case 'beam':
        case 'laserBeam':
        case 'weapon_beam':
        case 'weapon_laserBeam':
          i.bullets.push({
            ...c,
            x: i.player.x + i.player.width / 2,
            width: 15,
            height: 20,
            speed: 15,
            color: '#00ff00',
          })
          break
        case 'cluster':
        case 'grenade':
        case 'weapon_cluster':
        case 'weapon_grenade':
          i.missiles.push({ x: i.player.x, y: i.player.y, speed: 8, cluster: !0, explosion: !1 })
          break
        case 'flak':
        case 'weapon_flak':
          for (let p = 0; p < 4; p++)
            i.bullets.push({
              ...c,
              x: i.player.x + p * 10,
              angle: (p - 1.5) * 0.4,
              color: '#e67e22',
            })
          break
        case 'railgun':
        case 'sniper':
        case 'weapon_railgun':
        case 'weapon_sniper':
          i.bullets.push({
            ...c,
            x: i.player.x + i.player.width / 2,
            width: 8,
            height: 25,
            speed: 20,
            color: '#3498db',
          })
          break
        case 'shockwave':
        case 'weapon_shockwave':
          for (let p = 0; p < 8; p++) {
            const j = ((Math.PI * 2) / 8) * p
            i.bullets.push({
              ...c,
              x: i.player.x,
              y: i.player.y,
              vx: Math.cos(j) * 8,
              vy: Math.sin(j) * 8,
              color: '#1abc9c',
            })
          }
          break
        case 'cryo':
        case 'weapon_cryo':
          i.bullets.push({ ...c, x: i.player.x + i.player.width / 2, color: '#3498db', cryo: !0 })
          break
        case 'acid':
        case 'weapon_acid':
          for (let p = 0; p < 3; p++)
            i.bullets.push({
              ...c,
              x: i.player.x + p * 10,
              angle: (p - 1) * 0.2,
              color: '#2ecc71',
              acid: !0,
            })
          break
        case 'volcano':
        case 'weapon_volcano':
          for (let p = 0; p < 5; p++)
            i.bullets.push({
              ...c,
              x: i.player.x + p * 8,
              angle: (p - 2) * 0.3,
              color: '#e67e22',
              explosive: !0,
            })
          break
        case 'ultimate':
        case 'weapon_ultimate':
          for (let p = 0; p < 12; p++) {
            const j = ((Math.PI * 2) / 12) * p
            i.bullets.push({
              ...c,
              x: i.player.x,
              y: i.player.y,
              vx: Math.cos(j) * 10,
              vy: Math.sin(j) * 10,
              width: 10,
              height: 15,
              color: '#ff1493',
              pierce: !0,
            })
          }
          i.missiles.push({ x: i.player.x, y: i.player.y, speed: 10, target: null, explosion: !0 })
          break
        default:
          i.bullets.push({ ...c, x: i.player.x + i.player.width / 2 })
      }
      i.particles.push(
        ...vs.createExplosion(i.player.x + i.player.width / 2, i.player.y, '#ffd700', 5)
      )
    },
    D = (i) => {
      const c = o.current
      if (!c) return
      const f = Math.min(i.deltaTime / 16.67, 2)
      i.bullets = i.bullets.filter((p) => ((p.y -= p.speed * f), p.y > -10 && p.y < c.height + 10))
    },
    I = (i) => {
      const c = o.current
      if (!c) return
      const f = Math.min(i.deltaTime / 16.67, 2)
      i.enemies = i.enemies.filter(
        (p) => (
          (p.y += p.speed * f),
          p.pattern === 'zigzag' && (p.x += Math.sin(p.y / 20) * 2 * f),
          Math.random() < 0.01 &&
            p.y > 50 &&
            p.y < c.height - 100 &&
            i.enemyBullets.push({
              x: p.x + 15,
              y: p.y + 30,
              speed: 3 * f,
              owner: 'enemy',
              width: 3,
              height: 8,
            }),
          p.y < c.height + 50
        )
      )
    },
    Z = (i) => {
      const c = o.current
      if (!c) return
      const f = Date.now(),
        p = 2e3 / re()
      if (f - i.lastEnemySpawn > p) {
        const j = {
          x: Math.random() * (c.width - 30) + 15,
          y: -30,
          speed: re() * 1.2,
          pattern: Math.random() > 0.5 ? 'normal' : 'zigzag',
          health: 1,
          type: 'shooter',
        }
        ;(i.enemies.push(j), (i.lastEnemySpawn = f), i.enemiesSpawned++)
      }
    },
    re = () => (t === 'easy' ? 1 : t === 'medium' ? 1.5 : 2),
    nt = (i) => {
      const c = [],
        f = []
      for (let p = 0; p < i.bullets.length; p++) {
        const j = i.bullets[p]
        if (j.owner === 'player') {
          for (let M = 0; M < i.enemies.length; M++) {
            const F = i.enemies[M],
              $ = j.width || 5,
              Y = j.height || 10
            if (j.x < F.x + 30 && j.x + $ > F.x && j.y < F.y + 30 && j.y + Y > F.y) {
              const ln = Math.floor(10 * i.scoreMultiplier)
              a((pe) => {
                const We = pe + ln
                return (
                  (i.currentScore = We),
                  G === 0 && Qr('firstKill', R) && Ve('achievement', 1),
                  We
                )
              })
              const Te = C + 1
              ;(x(Te),
                H((pe) => pe + 1),
                B((pe) => pe + 1),
                Te >= 10 && !Kt.combo10.unlocked && Qr('combo10', R) && Ve('achievement', 1),
                G === 100 && Qr('survivor', R) && Ve('achievement', 1),
                f.push(M),
                c.push(p))
              break
            }
          }
          if (i.boss && j.owner === 'player') {
            const M = { x: j.x, y: j.y, width: j.width || 5, height: j.height || 10 },
              F = {
                x: i.boss.x - i.boss.width / 2,
                y: i.boss.y - i.boss.height / 2,
                width: i.boss.width,
                height: i.boss.height,
              }
            if (
              M.x < F.x + F.width &&
              M.x + M.width > F.x &&
              M.y < F.y + F.height &&
              M.y + M.height > F.y &&
              ((i.boss.health -= 20),
              j.pierce || c.push(p),
              Ve('hit', 0.3),
              i.particles.push(...vs.createExplosion(j.x, j.y, '#ff0080', 10)),
              i.boss.health <= 0)
            ) {
              Ve('bossSpawn', 0.6)
              const $ = Math.floor(500 * i.scoreMultiplier)
              ;(a((Y) => {
                const ne = Y + $
                return (
                  (i.currentScore = ne),
                  v >= 100 && Qr('noDamageBoss', R) && Ve('achievement', 1),
                  ne
                )
              }),
                (i.boss = null),
                (i.isBossFight = !1))
            }
          }
        }
      }
      if (
        (c
          .sort((p, j) => j - p)
          .forEach((p) => {
            i.bullets.splice(p, 1)
          }),
        f
          .sort((p, j) => j - p)
          .forEach((p) => {
            i.enemies.splice(p, 1)
          }),
        !i.invulnerable && !i.shield)
      ) {
        const p = []
        for (let M = 0; M < i.enemies.length; M++) {
          const F = i.enemies[M]
          if (
            i.player.x < F.x + 30 &&
            i.player.x + i.player.width > F.x &&
            i.player.y < F.y + 30 &&
            i.player.y + i.player.height > F.y
          ) {
            ;(g(($) => {
              const Y = $ - 10
              return Y <= 0
                ? (w((ne) => ne - 1),
                  (i.invulnerable = !0),
                  setTimeout(() => {
                    i.invulnerable = !1
                  }, 2e3),
                  100)
                : Y
            }),
              p.push(M))
            break
          }
        }
        p.sort((M, F) => F - M).forEach((M) => {
          i.enemies.splice(M, 1)
        })
        const j = []
        for (let M = 0; M < i.enemyBullets.length; M++) {
          const F = i.enemyBullets[M]
          F.x < i.player.x + i.player.width &&
            F.x + 5 > i.player.x &&
            F.y < i.player.y + i.player.height &&
            F.y + 5 > i.player.y &&
            (g(($) => {
              const Y = $ - 20
              return Y <= 0
                ? (w((ne) => ne - 1),
                  (i.invulnerable = !0),
                  setTimeout(() => {
                    i.invulnerable = !1
                  }, 2e3),
                  100)
                : Y
            }),
            j.push(M),
            (i.shakeIntensity = 5),
            Ve('hit', 0.5))
        }
        j.sort((M, F) => F - M).forEach((M) => {
          i.enemyBullets.splice(M, 1)
        })
      }
    },
    tn = (i, c) => {
      i.save()
      const f = r === 'kaden' ? '#4ecdc4' : '#ff6b6b',
        p = r === 'kaden' ? '#00ffff' : '#ff00ff'
      ;(c.invulnerable && (i.globalAlpha = 0.5),
        (i.shadowBlur = 20),
        (i.shadowColor = f),
        (i.fillStyle = f),
        i.beginPath(),
        i.moveTo(c.player.x + c.player.width / 2, c.player.y),
        i.lineTo(c.player.x + c.player.width, c.player.y + c.player.height - 10),
        i.lineTo(c.player.x + c.player.width * 0.8, c.player.y + c.player.height),
        i.lineTo(c.player.x + c.player.width * 0.2, c.player.y + c.player.height),
        i.lineTo(c.player.x, c.player.y + c.player.height - 10),
        i.closePath(),
        i.fill(),
        (i.fillStyle = p),
        i.fillRect(
          c.player.x + c.player.width * 0.35,
          c.player.y + c.player.height * 0.5,
          c.player.width * 0.3,
          c.player.height * 0.3
        ))
      const j = i.createLinearGradient(
        c.player.x + c.player.width * 0.35,
        c.player.y + c.player.height,
        c.player.x + c.player.width * 0.65,
        c.player.y + c.player.height
      )
      ;(j.addColorStop(0, 'yellow'),
        j.addColorStop(0.5, f),
        j.addColorStop(1, 'yellow'),
        (i.fillStyle = j),
        i.fillRect(
          c.player.x + c.player.width * 0.25,
          c.player.y + c.player.height * 0.9,
          c.player.width * 0.5,
          c.player.height * 0.1
        ),
        (i.strokeStyle = p),
        (i.lineWidth = 2),
        i.beginPath(),
        i.moveTo(c.player.x + c.player.width * 0.3, c.player.y + c.player.height * 0.6),
        i.lineTo(c.player.x, c.player.y + c.player.height * 0.8),
        i.moveTo(c.player.x + c.player.width * 0.7, c.player.y + c.player.height * 0.6),
        i.lineTo(c.player.x + c.player.width, c.player.y + c.player.height * 0.8),
        i.stroke(),
        c.shield &&
          ((i.strokeStyle = 'cyan'),
          (i.lineWidth = 3),
          (i.globalAlpha = 0.5),
          i.beginPath(),
          i.arc(
            c.player.x + c.player.width / 2,
            c.player.y + c.player.height / 2,
            30,
            0,
            Math.PI * 2
          ),
          i.stroke(),
          (i.globalAlpha = 1)),
        i.restore())
    },
    jt = (i, c) => {
      c.bullets.forEach((f) => {
        const p = f.color || (f.owner === 'player' ? 'cyan' : 'red')
        ;(f.freeze &&
          ((i.strokeStyle = '#00bfff'),
          (i.lineWidth = 3),
          i.beginPath(),
          i.arc(f.x, f.y, f.width, 0, Math.PI * 2),
          i.stroke()),
          (i.fillStyle = p),
          i.fillRect(f.x, f.y, f.width || 5, f.height || 10),
          (f.pierce || f.explosive) &&
            ((i.globalAlpha = 0.5),
            (i.shadowBlur = 10),
            (i.shadowColor = p),
            i.fillRect(f.x, f.y, f.width || 5, f.height || 10),
            (i.globalAlpha = 1),
            (i.shadowBlur = 0)))
      })
    },
    rn = (i, c) => {
      c.enemies.forEach((f) => {
        ;(i.save(),
          (i.fillStyle = '#ff0000'),
          (i.strokeStyle = '#cc0000'),
          (i.lineWidth = 2),
          i.beginPath(),
          i.moveTo(f.x + 15, f.y),
          i.lineTo(f.x + 5, f.y + 25),
          i.lineTo(f.x + 25, f.y + 25),
          i.closePath(),
          i.fill(),
          i.stroke(),
          (i.fillStyle = '#ff6666'),
          i.beginPath(),
          i.arc(f.x + 15, f.y + 8, 3, 0, Math.PI * 2),
          i.fill(),
          i.restore())
      })
    },
    tt = (i, c) => {
      c.powerUps.forEach((f) => {
        ;((f.pulse = f.pulse || 0),
          (f.pulse += 0.1),
          (f.rotation = f.rotation || 0),
          (f.rotation += 0.05),
          i.save())
        const p = 1 + Math.sin(f.pulse) * 0.2,
          j = 0.7 + Math.sin(f.pulse * 2) * 0.3,
          M = i.createRadialGradient(f.x, f.y, 0, f.x, f.y, 30)
        ;(M.addColorStop(0, f.color),
          M.addColorStop(0.3, f.color + '00'),
          M.addColorStop(1, 'transparent'),
          (i.globalAlpha = j * 0.5),
          (i.fillStyle = M),
          i.fillRect(f.x - 30, f.y - 30, 60, 60),
          (i.globalAlpha = 1),
          i.translate(f.x, f.y),
          i.scale(p, p),
          i.rotate(f.rotation),
          (i.strokeStyle = f.color),
          (i.lineWidth = 3),
          i.beginPath(),
          i.arc(0, 0, f.width / 2 + 3, 0, Math.PI * 2),
          i.stroke(),
          (i.fillStyle = f.color),
          i.beginPath(),
          i.moveTo(0, -f.width / 2),
          i.lineTo(f.width / 2, 0),
          i.lineTo(0, f.width / 2),
          i.lineTo(-f.width / 2, 0),
          i.closePath(),
          i.fill())
        const F = i.createRadialGradient(0, 0, 0, 0, 0, f.width / 3)
        ;(F.addColorStop(0, '#ffffff'),
          F.addColorStop(1, f.color),
          (i.fillStyle = F),
          i.beginPath(),
          i.arc(0, 0, f.width / 4, 0, Math.PI * 2),
          i.fill(),
          i.restore(),
          i.save(),
          (i.font = 'bold 28px Arial'),
          (i.textAlign = 'center'),
          (i.textBaseline = 'middle'),
          (i.fillStyle = '#ffffff'),
          (i.strokeStyle = '#000000'),
          (i.lineWidth = 2),
          i.strokeText(f.icon, f.x, f.y),
          i.fillText(f.icon, f.x, f.y),
          i.restore(),
          (i.strokeStyle = f.color),
          (i.lineWidth = 2),
          (i.globalAlpha = 0.5),
          i.beginPath(),
          i.moveTo(f.x, f.y - 15),
          i.lineTo(f.x, f.y - 35),
          i.stroke(),
          (i.globalAlpha = 1))
      })
    },
    Fc = (i, c) => {
      c.particles.forEach((f) => {
        ;((i.fillStyle = f.color), i.fillRect(f.x, f.y, 2, 2))
      })
    },
    Dc = (i, c) => {
      c.wingFighters.forEach((f) => {
        ;((i.fillStyle = '#95a5a6'), i.fillRect(f.x, f.y, 20, 20))
      })
    },
    Ic = (i) => {
      const c = o.current
      if (!c) return
      const f = Math.min(i.deltaTime / 16.67, 2)
      i.powerUps = i.powerUps.filter(
        (p) => (
          (p.y += p.speed * f),
          i.player.x < p.x + p.width &&
          i.player.x + i.player.width > p.x &&
          i.player.y < p.y + p.height &&
          i.player.y + i.player.height > p.y
            ? (Bp(i, p),
              Ve('powerup', 0.5),
              i.powerUps.splice(i.powerUps.indexOf(p), 1),
              (i.coins += 10),
              z((j) => j + 10),
              !1)
            : p.y < c.height + 50
        )
      )
    },
    Oc = (i) => {
      ;((i.particles = i.particles.slice(0, 200).filter((c) => c.life > 0)),
        i.particles.forEach((c) => c.life--))
    },
    Bc = (i) => {
      i.wingFighters.forEach((c, f) => {
        ;((c.x = i.player.x + (f % 2 === 0 ? -30 : 70)), (c.y = i.player.y + 20))
      })
    },
    Ac = (i) => {
      ;(i.rapidFireTimer > 0 && (i.rapidFireTimer--, i.rapidFireTimer === 0 && (i.rapidFire = !1)),
        i.shieldTimer > 0 && (i.shieldTimer--, i.shieldTimer === 0 && (i.shield = !1)),
        i.slowMotionTimer > 0 &&
          (i.slowMotionTimer--, i.slowMotionTimer === 0 && (i.slowMotion = !1)),
        i.missilePackTimer > 0 &&
          (i.missilePackTimer--,
          i.missilePackTimer === 0 && i.currentWeapon === 'missile' && (i.currentWeapon = 'laser')),
        i.speedBoostTimer > 0 &&
          (i.speedBoostTimer--, i.speedBoostTimer === 0 && (i.player.speed = 5)),
        i.coinDoublerTimer > 0 &&
          (i.coinDoublerTimer--, i.coinDoublerTimer === 0 && (i.coinDoubler = !1)))
    },
    $c = (i) => {
      const c = o.current
      if (!c) return
      const f = Math.min(i.deltaTime / 16.67, 2)
      i.missiles = i.missiles.filter(
        (p) => (
          (p.y -= p.speed * f),
          (p.speed = Math.min(15, p.speed + 0.5 * f)),
          p.y > -50 && p.y < c.height + 50
        )
      )
    },
    Wc = (i) => {
      const c = o.current
      if (!c) return
      const f = Math.min(i.deltaTime / 16.67, 2)
      i.enemyBullets = i.enemyBullets.filter((p) => ((p.y += p.speed * f), p.y < c.height + 50))
    },
    Hc = (i) => {
      const c = Math.min(i.deltaTime / 16.67, 2)
      i.plasmaBeams = i.plasmaBeams.filter(
        (f) => ((f.y -= 12 * c), f.life--, f.life > 0 && f.y > -50)
      )
    },
    Vc = (i) => {
      const c = o.current
      if (!c) return
      const f = Math.min(i.deltaTime / 16.67, 2)
      i.asteroids = i.asteroids.filter(
        (p) => (
          (p.x += p.vx * f),
          (p.y += p.vy * f),
          (p.rotation += 0.02 * f),
          p.x < -50 && (p.x = c.width + 50),
          p.x > c.width + 50 && (p.x = -50),
          p.y < -50 && (p.y = c.height + 50),
          p.y > c.height + 50 && (p.y = -50),
          !0
        )
      )
    },
    Uc = (i) => {
      const c = o.current
      if (c && i.enemies.length === 0 && Math.random() < 0.01) {
        const f = {
          x: Math.random() * c.width,
          y: Math.random() * c.height,
          size: 20 + Math.random() * 30,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          rotation: Math.random() * Math.PI * 2,
          health: 2,
        }
        i.asteroids.push(f)
      }
    },
    Qc = (i) => {
      const c = o.current
      if (!c) return
      if (Math.random() < 0.05 && !i.isBossFight && i.powerUps.length < 5) {
        const p = Math.random() * (c.width - 50) + 25
        i.powerUps.push(Op(p, -30))
      }
    },
    Kc = (i) => {
      if (i.boss) {
        const c = Date.now()
        ;((i.boss = Hp(i.boss, c, o.current)),
          i.boss.health <= 0 && ((i.isBossFight = !1), (i.boss = null), Ve('bossSpawn', 0.6)))
      }
    },
    Gc = (i, c) => {
      const f = o.current
      f &&
        ((i.fillStyle = '#000'),
        i.fillRect(0, 0, f.width, f.height),
        Yc(i, c.backgroundOffset),
        (c.backgroundOffset += 0.5))
    },
    Yc = (i, c = 0) => {
      const f = o.current
      if (!f) return
      i.fillStyle = 'white'
      const p = f.width,
        j = f.height
      for (let M = 0; M < 80; M++) {
        const F = (M * 83) % p,
          $ = ((M * 73) % j) + (c % j),
          Y = Math.random()
        ;((i.fillStyle = `rgba(255, 255, 255, ${Y})`), i.fillRect(F, $, 1 + Y, 1 + Y))
      }
    },
    Xc = (i, c) => {
      const f = o.current
      if (!f) return
      const p = i.createRadialGradient(
        f.width / 2,
        f.height / 2,
        50,
        f.width / 2,
        f.height / 2,
        300
      )
      ;(p.addColorStop(0, 'rgba(255, 107, 107, 0.1)'),
        p.addColorStop(0.5, 'rgba(78, 205, 196, 0.1)'),
        p.addColorStop(1, 'transparent'),
        (i.fillStyle = p),
        i.fillRect(0, 0, f.width, f.height))
    },
    Zc = (i, c) => {
      c.missiles.forEach((f) => {
        ;((i.fillStyle = '#ffd700'),
          i.beginPath(),
          i.moveTo(f.x, f.y),
          i.lineTo(f.x - 5, f.y - 15),
          i.lineTo(f.x + 5, f.y - 15),
          i.closePath(),
          i.fill(),
          (i.fillStyle = '#ff4500'),
          i.fillRect(f.x, f.y, 3, 20))
      })
    },
    Jc = (i, c) => {
      c.enemyBullets.forEach((f) => {
        ;((i.fillStyle = 'red'), i.beginPath(), i.arc(f.x, f.y, 5, 0, Math.PI * 2), i.fill())
      })
    },
    qc = (i, c) => {
      c.plasmaBeams.forEach((f) => {
        const p = i.createLinearGradient(f.x, f.y, f.x, f.y + f.height)
        ;(p.addColorStop(0, 'rgba(78, 205, 196, 0.9)'),
          p.addColorStop(1, 'rgba(78, 205, 196, 0.1)'),
          (i.fillStyle = p),
          i.fillRect(f.x, f.y, f.width, f.height))
      })
    },
    bc = (i, c) => {
      c.asteroids.forEach((f) => {
        ;(i.save(),
          i.translate(f.x, f.y),
          i.rotate(f.rotation),
          (i.fillStyle = '#8B4513'),
          i.beginPath(),
          i.moveTo(0, -f.size),
          i.lineTo(f.size * 0.7, -f.size * 0.5),
          i.lineTo(f.size * 0.8, f.size * 0.5),
          i.lineTo(0, f.size),
          i.lineTo(-f.size * 0.8, f.size * 0.5),
          i.lineTo(-f.size * 0.7, -f.size * 0.5),
          i.closePath(),
          i.fill(),
          (i.strokeStyle = '#654321'),
          (i.lineWidth = 2),
          i.stroke(),
          i.restore())
      })
    },
    ef = (i, c) => {
      if (!c.boss) return
      const f = Date.now() / 1e3,
        p = Math.sin(f * 2) * 0.1 + 0.9,
        j = f * 0.1,
        M = $p(c.boss.type || 'asteroid')
      if ((i.save(), i.translate(c.boss.x, c.boss.y), M && M.width))
        (i.rotate(j),
          (i.globalAlpha = 0.9 + Math.sin(f * 3) * 0.1),
          i.drawImage(M, -c.boss.width / 2, -c.boss.height / 2, c.boss.width, c.boss.height),
          (i.globalAlpha = 1))
      else {
        ;(i.rotate(j),
          i.scale(p, p),
          (i.shadowBlur = 30),
          (i.shadowColor = c.boss.color),
          (i.strokeStyle = c.boss.color),
          (i.lineWidth = 5),
          i.beginPath(),
          i.arc(0, 0, c.boss.width / 2 + 10, 0, Math.PI * 2),
          i.stroke(),
          (i.shadowBlur = 0))
        const Te = i.createLinearGradient(
          -c.boss.width / 2,
          -c.boss.height / 2,
          c.boss.width / 2,
          c.boss.height / 2
        )
        ;(Te.addColorStop(0, c.boss.color),
          Te.addColorStop(0.3, c.boss.color + '80'),
          Te.addColorStop(0.5, '#000000'),
          Te.addColorStop(0.7, c.boss.color + '80'),
          Te.addColorStop(1, c.boss.color),
          (i.fillStyle = Te),
          i.beginPath())
        for (let We = 0; We < 6; We++) {
          const yn = (Math.PI / 3) * We,
            An = (Math.cos(yn) * c.boss.width) / 2,
            Tr = (Math.sin(yn) * c.boss.height) / 2
          We === 0 ? i.moveTo(An, Tr) : i.lineTo(An, Tr)
        }
        ;(i.closePath(), i.fill(), (i.strokeStyle = '#ffff00'), (i.lineWidth = 4), i.stroke())
        const pe = i.createRadialGradient(0, 0, 0, 0, 0, c.boss.width / 4)
        ;(pe.addColorStop(0, '#ffffff'),
          pe.addColorStop(0.5, '#ff0080'),
          pe.addColorStop(1, c.boss.color),
          (i.fillStyle = pe),
          (i.globalAlpha = 0.8 + Math.sin(f * 4) * 0.2),
          i.beginPath(),
          i.arc(0, 0, c.boss.width / 4, 0, Math.PI * 2),
          i.fill(),
          (i.globalAlpha = 1),
          (i.strokeStyle = '#00ffff'),
          (i.lineWidth = 3))
        for (let We = 0; We < 8; We++) {
          const yn = (Math.PI / 4) * We,
            An = c.boss.width / 2 - 5
          ;(i.beginPath(),
            i.moveTo(0, 0),
            i.lineTo(Math.cos(yn) * An, Math.sin(yn) * An),
            i.stroke())
          const Tr = Math.cos(yn) * (An - 10),
            lf = Math.sin(yn) * (An - 10)
          ;((i.fillStyle = '#444444'), i.beginPath(), i.arc(Tr, lf, 4, 0, Math.PI * 2), i.fill())
        }
        ;((i.shadowBlur = 25),
          (i.shadowColor = c.boss.color),
          (i.fillStyle = c.boss.color),
          (i.globalAlpha = 0.6 + Math.sin(f * 5) * 0.4),
          i.beginPath(),
          i.arc(0, 0, c.boss.width / 6, 0, Math.PI * 2),
          i.fill(),
          (i.shadowBlur = 0),
          (i.globalAlpha = 1))
      }
      i.restore()
      const F = 120,
        $ = 10,
        Y = c.boss.x - F / 2,
        ne = c.boss.y - c.boss.height / 2 - 40
      ;((i.fillStyle = 'rgba(0, 0, 0, 0.7)'),
        i.fillRect(Y - 2, ne - 2, F + 4, $ + 4),
        (i.fillStyle = '#ff0000'),
        i.fillRect(Y, ne, F, $))
      const Bn = c.boss.maxHealth || c.boss.health,
        ln = c.boss.health / Bn
      ;((i.fillStyle = ln > 0.5 ? '#00ff00' : ln > 0.25 ? '#ffff00' : '#ff0000'),
        i.fillRect(Y, ne, F * ln, $),
        (i.strokeStyle = '#ffffff'),
        (i.lineWidth = 2),
        i.strokeRect(Y - 2, ne - 2, F + 4, $ + 4))
    },
    nf = (i) => {
      const c = o.current
      c &&
        (i.gameMode === 'arcade'
          ? (i.lastEnemySpawn = Math.max(0, i.lastEnemySpawn - 200))
          : i.gameMode === 'survival'
            ? i.enemiesSpawned % 20 === 0 && (i.scoreMultiplier += 0.1)
            : i.gameMode === 'bossRush' &&
              i.enemiesSpawned % 30 === 0 &&
              !i.isBossFight &&
              ((i.isBossFight = !0), (i.boss = Ss('asteroid', c.width / 2, 100))))
    },
    tf = (i) => {
      const c = o.current
      c &&
        i.enemiesSpawned % 50 === 0 &&
        i.enemiesSpawned > 0 &&
        (i.wave++,
        d(i.wave),
        i.wave === 5 &&
          (i.level++,
          S(i.level),
          (i.isBossFight = !0),
          (i.boss = Ss('asteroid', c.width / 2, 100))))
    },
    rf = (i, c) => {
      ;((i.fillStyle = 'rgba(0, 0, 0, 0.7)'), i.fillRect(0, 0, 200, 280))
      const f = i.createLinearGradient(0, 0, 200, 0)
      ;(f.addColorStop(0, 'rgba(102, 126, 234, 0.5)'),
        f.addColorStop(1, 'rgba(118, 75, 162, 0.5)'),
        (i.fillStyle = f),
        i.fillRect(0, 0, 200, 4),
        (i.shadowBlur = 10),
        (i.shadowColor = '#4ecdc4'),
        (i.fillStyle = '#4ecdc4'),
        (i.font = 'bold 20px Arial'),
        i.fillText('SCORE', 10, 25),
        (i.shadowBlur = 0),
        (i.font = 'bold 18px Arial'),
        (i.fillStyle = '#fff'))
      const j = (c.currentScore || s).toString().padStart(8, '0')
      ;(i.fillText(j, 10, 50),
        (i.fillStyle = '#ff6b6b'),
        (i.font = 'bold 16px Arial'),
        i.fillText('❤️ × ' + h, 10, 75),
        (i.font = '12px Arial'),
        (i.fillStyle = '#ffff00'),
        i.fillText(`BEST: ${Pr().toString().padStart(8, '0')}`, 10, 95),
        (i.fillStyle = 'rgba(255, 255, 255, 0.3)'),
        i.fillRect(10, 85, 100, 8))
      const M = v / 100
      if (
        ((i.fillStyle = M > 0.5 ? '#2ecc71' : M > 0.25 ? '#f39c12' : '#e74c3c'),
        i.fillRect(10, 85, 100 * M, 8),
        (i.strokeStyle = '#fff'),
        (i.lineWidth = 1),
        i.strokeRect(10, 85, 100, 8),
        (i.fillStyle = 'rgba(255, 255, 255, 0.5)'),
        i.fillRect(0, 100, 200, 1),
        (i.font = '14px Arial'),
        (i.fillStyle = '#ffd700'),
        i.fillText(`Wave: ${m} | Level: ${y}`, 10, 120),
        C > 0)
      ) {
        const $ = Math.sin(Date.now() / 100) * 0.3 + 0.7
        ;((i.fillStyle = `rgba(255, 215, 0, ${$})`),
          (i.font = 'bold 16px Arial'),
          i.fillText(`⚡ COMBO × ${C}`, 10, 145))
      }
      ;((i.fillStyle = '#95a5a6'),
        (i.font = '12px Arial'),
        i.fillText(`Kills: ${_}`, 10, 170),
        i.fillText(`💰 ${c.coins}`, 110, 170),
        (i.fillStyle = '#4ecdc4'),
        (i.font = 'bold 11px Arial'),
        i.fillText(`⚔️ ${c.currentWeapon.toUpperCase()}`, 10, 195))
      let F = 210
      ;(c.shield &&
        ((i.fillStyle = '#00ffff'),
        (i.font = '14px Arial'),
        i.fillText('🛡️ Shield Active', 10, F),
        (F += 18)),
        c.rapidFire &&
          ((i.fillStyle = '#ff6b6b'),
          (i.font = '14px Arial'),
          i.fillText('⚡ Rapid Fire', 10, F),
          (F += 18)),
        c.slowMotion &&
          ((i.fillStyle = '#9b59b6'),
          (i.font = '14px Arial'),
          i.fillText('⏰ Slow Motion', 10, F),
          (F += 18)),
        c.coinDoubler &&
          ((i.fillStyle = '#2ecc71'),
          (i.font = '14px Arial'),
          i.fillText('💰 Score Doubler', 10, F),
          (F += 18)))
    }
  return k.jsxs('div', {
    className: 'game-container',
    children: [
      k.jsx('canvas', { ref: o, className: 'game-canvas' }),
      l &&
        k.jsxs('div', {
          className: 'pause-overlay',
          children: [
            k.jsx('h2', { children: 'Game Paused' }),
            k.jsx('p', { children: "Press 'P' to resume" }),
          ],
        }),
    ],
  })
}
function Yp({ onStartGame: e }) {
  const [n, t] = O.useState('medium'),
    [r, l] = O.useState('kaden'),
    [o, u] = O.useState(!1),
    [s, a] = O.useState(() => {
      const _ = localStorage.getItem('soundVolume')
      return _ ? parseInt(_) : 100
    }),
    [h, w] = O.useState(() => {
      const _ = localStorage.getItem('musicVolume')
      return _ ? parseInt(_) : 50
    }),
    [v, g] = O.useState(!1)
  ;(O.useEffect(() => {
    localStorage.setItem('soundVolume', s.toString())
  }, [s]),
    O.useEffect(() => {
      localStorage.setItem('musicVolume', h.toString())
    }, [h]))
  const C = () => {
      e(n, r)
    },
    x = (_) => {
      const H = _.target.checked
      ;(g(H),
        H
          ? document.documentElement.requestFullscreen &&
            document.documentElement.requestFullscreen()
          : document.exitFullscreen && document.exitFullscreen())
    }
  return k.jsx('div', {
    className: 'main-menu',
    children: k.jsxs('div', {
      className: 'menu-container glass',
      children: [
        k.jsxs('h1', {
          className: 'game-title',
          children: ['🌟 Kaden & Adelynn', k.jsx('br', {}), '🌌 Space Adventures 🌌'],
        }),
        k.jsx('p', { className: 'game-subtitle', children: 'Epic Space Shooter' }),
        k.jsxs('div', {
          className: 'menu-section',
          children: [
            k.jsx('h3', { children: 'Select Ship' }),
            k.jsxs('div', {
              className: 'ship-selector',
              children: [
                k.jsx('button', {
                  className: `ship-option ${r === 'kaden' ? 'active' : ''}`,
                  onClick: () => l('kaden'),
                  children: "🚀 Kaden's Ship",
                }),
                k.jsx('button', {
                  className: `ship-option ${r === 'adelynn' ? 'active' : ''}`,
                  onClick: () => l('adelynn'),
                  children: "✨ Adelynn's Ship",
                }),
              ],
            }),
          ],
        }),
        k.jsxs('div', {
          className: 'menu-section',
          children: [
            k.jsx('h3', { children: 'Difficulty' }),
            k.jsxs('div', {
              className: 'difficulty-selector',
              children: [
                k.jsx('button', {
                  className: `diff-btn ${n === 'easy' ? 'active' : ''}`,
                  onClick: () => t('easy'),
                  children: '🟢 Easy',
                }),
                k.jsx('button', {
                  className: `diff-btn ${n === 'medium' ? 'active' : ''}`,
                  onClick: () => t('medium'),
                  children: '🟡 Medium',
                }),
                k.jsx('button', {
                  className: `diff-btn ${n === 'hard' ? 'active' : ''}`,
                  onClick: () => t('hard'),
                  children: '🔴 Hard',
                }),
              ],
            }),
          ],
        }),
        k.jsx('button', { className: 'start-button', onClick: C, children: '🎮 Start Game' }),
        k.jsx('div', {
          className: 'button-row',
          children: k.jsx('button', {
            className: 'settings-button',
            onClick: () => u(!o),
            children: '⚙️ Settings',
          }),
        }),
        o &&
          k.jsxs('div', {
            className: 'settings-panel',
            children: [
              k.jsx('h4', { children: '⚙️ Game Settings' }),
              k.jsxs('div', {
                className: 'settings-content',
                children: [
                  k.jsxs('div', {
                    className: 'setting-item',
                    children: [
                      k.jsxs('label', { children: ['Sound Effects: ', s, '%'] }),
                      k.jsx('input', {
                        type: 'range',
                        min: '0',
                        max: '100',
                        value: s,
                        onChange: (_) => a(parseInt(_.target.value)),
                      }),
                    ],
                  }),
                  k.jsxs('div', {
                    className: 'setting-item',
                    children: [
                      k.jsxs('label', { children: ['Music: ', h, '%'] }),
                      k.jsx('input', {
                        type: 'range',
                        min: '0',
                        max: '100',
                        value: h,
                        onChange: (_) => w(parseInt(_.target.value)),
                      }),
                    ],
                  }),
                  k.jsxs('div', {
                    className: 'setting-item',
                    children: [
                      k.jsx('label', { children: 'Fullscreen' }),
                      k.jsx('input', { type: 'checkbox', checked: v, onChange: x }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        k.jsxs('div', {
          className: 'game-features',
          children: [
            k.jsx('h4', { children: '🌟 100+ Features Included' }),
            k.jsxs('ul', {
              children: [
                k.jsx('li', { children: '25 Lives System' }),
                k.jsx('li', { children: '6 Weapon Types' }),
                k.jsx('li', { children: 'Boss Battles' }),
                k.jsx('li', { children: 'Achievement System' }),
                k.jsx('li', { children: 'Combo System' }),
                k.jsx('li', { children: 'Daily Challenges' }),
              ],
            }),
          ],
        }),
      ],
    }),
  })
}
function Xp({ onContinue: e }) {
  const [n, t] = O.useState(0),
    r = [
      {
        title: '🌟 The Adventure Begins',
        content:
          'Kaden and Adelynn are two young space explorers on a mission to save their galaxy from an alien invasion.',
        character: '👨‍🚀',
      },
      {
        title: '🔴 The Threat',
        content:
          'Ancient evil forces have awakened and are destroying planets across the galaxy. Only our brave heroes can stop them!',
        character: '👾',
      },
      {
        title: '🚀 The Mission',
        content:
          'Kaden pilots the Blue Thunder with precision lasers. Adelynn commands the Pink Princess with devastating spread shots.',
        character: '⚔️',
      },
      {
        title: '💫 Their Quest',
        content:
          'Collect power-ups, defeat enemies, and battle massive bosses to restore peace to the galaxy!',
        character: '🎯',
      },
      {
        title: '🌟 Ready?',
        content: 'Choose your ship and difficulty. The fate of the galaxy rests in your hands!',
        character: '🚀',
      },
    ]
  O.useEffect(() => {
    const o = setTimeout(() => {
      n < r.length - 1 && t(n + 1)
    }, 3e3)
    return () => clearTimeout(o)
  }, [n])
  const l = () => {
    n < r.length - 1 ? t(n + 1) : e()
  }
  return k.jsx('div', {
    className: 'story-overlay',
    onClick: l,
    children: k.jsxs('div', {
      className: 'story-container',
      children: [
        k.jsx('div', { className: 'story-emoji', children: r[n].character }),
        k.jsx('h2', { className: 'story-title', children: r[n].title }),
        k.jsx('p', { className: 'story-content', children: r[n].content }),
        k.jsx('div', {
          className: 'story-progress',
          children: r.map((o, u) => k.jsx('span', { className: u === n ? 'active' : '' }, u)),
        }),
        k.jsx('p', { className: 'story-hint', children: 'Click or wait to continue...' }),
      ],
    }),
  })
}
function Zp({ score: e, onRestart: n, onMenu: t, wave: r, level: l, kills: o, combo: u }) {
  const [s, a] = O.useState([]),
    [h, w] = O.useState(0),
    [v, g] = O.useState(!1)
  return (
    O.useEffect(() => {
      iu(e)
      const C = Pr()
      ;(w(C), g(jc(e)), a(xr()))
    }, [e]),
    k.jsx('div', {
      className: 'game-over-overlay',
      children: k.jsxs('div', {
        className: 'game-over-container',
        children: [
          k.jsxs('div', {
            className: 'game-over-header',
            children: [
              k.jsx('h1', { className: 'game-over-title', children: 'Game Over!' }),
              v && k.jsx('div', { className: 'new-record-badge', children: '🎉 NEW RECORD!' }),
            ],
          }),
          k.jsx('div', {
            className: 'score-display',
            children: k.jsxs('div', {
              className: 'final-score-container',
              children: [
                k.jsx('h2', { children: 'Your Score' }),
                k.jsx('div', { className: 'final-score', children: e.toLocaleString() }),
                v &&
                  k.jsxs('p', {
                    className: 'previous-best',
                    children: ['Previous Best: ', h.toLocaleString()],
                  }),
                !v &&
                  h > 0 &&
                  k.jsxs('p', {
                    className: 'personal-best',
                    children: ['Personal Best: ', h.toLocaleString()],
                  }),
              ],
            }),
          }),
          k.jsxs('div', {
            className: 'stats-grid',
            children: [
              k.jsxs('div', {
                className: 'stat-item',
                children: [
                  k.jsx('div', { className: 'stat-label', children: 'Wave' }),
                  k.jsx('div', { className: 'stat-value', children: r }),
                ],
              }),
              k.jsxs('div', {
                className: 'stat-item',
                children: [
                  k.jsx('div', { className: 'stat-label', children: 'Level' }),
                  k.jsx('div', { className: 'stat-value', children: l }),
                ],
              }),
              k.jsxs('div', {
                className: 'stat-item',
                children: [
                  k.jsx('div', { className: 'stat-label', children: 'Kills' }),
                  k.jsx('div', { className: 'stat-value', children: o }),
                ],
              }),
              k.jsxs('div', {
                className: 'stat-item',
                children: [
                  k.jsx('div', { className: 'stat-label', children: 'Best Combo' }),
                  k.jsx('div', { className: 'stat-value', children: u }),
                ],
              }),
            ],
          }),
          s.length > 0 &&
            k.jsxs('div', {
              className: 'leaderboard',
              children: [
                k.jsx('h3', { children: 'Top Scores' }),
                k.jsx('div', {
                  className: 'leaderboard-list',
                  children: s.slice(0, 5).map((C, x) =>
                    k.jsxs(
                      'div',
                      {
                        className: `leaderboard-entry ${C.score === e ? 'current-score' : ''}`,
                        children: [
                          k.jsx('span', { className: 'leaderboard-rank', children: x + 1 }),
                          k.jsx('span', {
                            className: 'leaderboard-score',
                            children: C.score.toLocaleString(),
                          }),
                          k.jsx('span', {
                            className: 'leaderboard-date',
                            children: new Date(C.date).toLocaleDateString(),
                          }),
                        ],
                      },
                      x
                    )
                  ),
                }),
              ],
            }),
          k.jsxs('div', {
            className: 'game-over-actions',
            children: [
              k.jsx('button', { className: 'btn-restart', onClick: n, children: '🎮 Play Again' }),
              k.jsx('button', { className: 'btn-menu', onClick: t, children: '🏠 Main Menu' }),
            ],
          }),
        ],
      }),
    })
  )
}
function Jp() {
  const [e, n] = O.useState('menu'),
    [t, r] = O.useState({ difficulty: 'medium', ship: 'kaden' }),
    [l, o] = O.useState({ score: 0, wave: 1, level: 1, kills: 0, combo: 0 }),
    u = (v, g) => {
      ;(r({ difficulty: v, ship: g }), n('story'))
    },
    s = () => {
      n('playing')
    },
    a = (v, g, C, x, _) => {
      ;(v > 0 && iu(v), o({ score: v, wave: g, level: C, kills: x, combo: _ }), n('gameover'))
    },
    h = () => {
      n('playing')
    },
    w = () => {
      n('menu')
    }
  return k.jsxs('div', {
    className: 'app',
    children: [
      e === 'menu' && k.jsx(Yp, { onStartGame: u }),
      e === 'story' && k.jsx(Xp, { onContinue: s }),
      e === 'playing' &&
        k.jsx(Gp, {
          onPause: () => {},
          onGameOver: a,
          difficulty: t.difficulty,
          selectedShip: t.ship,
          isPaused: !1,
        }),
      e === 'gameover' &&
        k.jsx(Zp, {
          score: l.score,
          wave: l.wave,
          level: l.level,
          kills: l.kills,
          combo: l.combo,
          onRestart: h,
          onMenu: w,
        }),
    ],
  })
}
go.createRoot(document.getElementById('root')).render(
  k.jsx(Ef.StrictMode, { children: k.jsx(Jp, {}) })
)
