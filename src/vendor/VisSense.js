/**
 * Created by tamleminh on 16/06/2017.
 */
/*! { "name": "vissense", "version": "0.10.0", "homepage": "https://vissense.github.io/vissense","copyright": "(c) 2016 tbk" } */
/* eslint-disable */
!(function (root, name, factory) {
    let _oldValue = root[name],
      _newValue = factory(root, root.document);
    root[name] = _newValue, root[name].noConflict = function () {
      return root[name] = _oldValue, _newValue;
    };
}(window, 'ViewTracking', (window = window, document = window.document, undefined) => {
  function async(callback, delay) {
    return function () {
      const args = arguments;
      return defer(() => {
        callback(...args);
      }, delay || 0);
    };
  }
  function debounce(callback, delay) {
    let cancel = noop;
    return function () {
      let self = this,
        args = arguments;
      cancel(), cancel = defer(() => {
        callback.apply(self, args);
      }, delay);
    };
  }
  function defaults(dest, source) {
    let sourceIsObject = isObject(source),
      destIsObject = isObject(dest);
    return sourceIsObject || destIsObject ? sourceIsObject && destIsObject ? (forEach(Object.keys(source), (property) => {
      dest[property] === undefined && (dest[property] = source[property]);
    }), dest) : sourceIsObject ? source : dest : source;
  }
  function defer(callback, delay) {
    const timer = setTimeout(() => {
      callback();
    }, delay || 0);
    return function () {
      clearTimeout(timer);
    };
  }
  function fireIf(when, callback) {
    return function () {
      return (isFunction(when) ? when() : when) ? callback() : undefined;
    };
  }
  function extend(dest, source, callback) {
    for (let index = -1, props = Object.keys(source), length = props.length, ask = isFunction(callback); ++index < length;) {
      const key = props[index];
      dest[key] = ask ? callback(dest[key], source[key], key, dest, source) : source[key];
    }
    return dest;
  }
  function forEach(array, callback, thisArg) {
    for (let i = 0, n = array.length; n > i; i++) {
      const result = callback.call(thisArg, array[i], i, array);
      if (result !== undefined) return result;
    }
  }
  function identity(value) {
    return value;
  }
  function isDefined(value) {
    return value !== undefined;
  }
  function isArray(value) {
    return value && typeof value === 'object' && typeof value.length === 'number' && Object.prototype.toString.call(value) === '[object Array]' || !1;
  }
  function isElement(value) {
    return value && value.nodeType === 1 || !1;
  }
  function isFunction(value) {
    return typeof value === 'function' || !1;
  }
  function isObject(value) {
    const type = typeof value;
    return type === 'function' || value && type === 'object' || !1;
  }
  function noop() {}
  function now() {
    return new Date().getTime();
  }
  function once(callback) {
    let cache,
      called = !1;
    return function () {
      return called || (cache = callback(...arguments), called = !0), cache;
    };
  }
  function throttle(callback, wait, thisArg) {
    let cancel = noop,
      last = !1;
    return function () {
      let time = now(),
        args = arguments,
        func = function () {
          last = time, callback.apply(thisArg, args);
        };
      last && last + wait > time ? (cancel(), cancel = defer(func, wait)) : (last = time,
        defer(func, 0));
    };
  }
  function viewport(referenceWindow) {
    const win = referenceWindow || window;
    return {
      height: win.innerHeight,
      width: win.innerWidth,
    };
  }
  function computedStyle(element, referenceWindow) {
    return (referenceWindow || window).getComputedStyle(element, null);
  }
  function styleProperty(style, property) {
    return style.getPropertyValue(property);
  }
  function isDisplayed(element, style) {
    style || (style = computedStyle(element));
    const display = styleProperty(style, 'display');
    if (display === 'none') return !1;
    const parent = element.parentNode;
    return isElement(parent) ? isDisplayed(parent) : !0;
  }
  function isVisibleByStyling(element, referenceWindow) {
    if (element === (referenceWindow || window).document) return !0;
    if (!element || !element.parentNode) return !1;
    let style = computedStyle(element, referenceWindow),
      visibility = styleProperty(style, 'visibility');
    return visibility === 'hidden' || visibility === 'collapse' ? !1 : isDisplayed(element, style);
  }
  function isInViewport(rect, viewport) {
    return !rect || rect.width <= 0 || rect.height <= 0 ? !1 : rect.bottom > 0 && rect.right > 0 && rect.top < viewport.height && rect.left < viewport.width;
  }
  function percentage(element, referenceWindow) {
    let rect = element.getBoundingClientRect(),
      view = viewport(referenceWindow);
    if (!isInViewport(rect, view) || !isVisibleByStyling(element)) return 0;
    let vh = 0,
      vw = 0;
    return rect.top >= 0 ? vh = Math.min(rect.height, view.height - rect.top) : rect.bottom > 0 && (vh = Math.min(view.height, rect.bottom)),
      rect.left >= 0 ? vw = Math.min(rect.width, view.width - rect.left) : rect.right > 0 && (vw = Math.min(view.width, rect.right)),
    vh * vw / (rect.height * rect.width);
  }
  function isPageVisible(referenceWindow) {
    return !createVisibilityApi(referenceWindow || window).isHidden();
  }
  function VisSense(element, config) {
    if (!(this instanceof VisSense)) return new VisSense(element, config);
    if (!isElement(element)) throw new Error('not an element node');
    this._element = element, this._config = defaults(config, {
      fullyvisible: 1,
      hidden: 0,
      referenceWindow: window,
      percentageHook: percentage,
      precision: 3,
      visibilityHooks: [],
    });
    const roundFactor = this._config.precision <= 0 ? 1 : Math.pow(10, this._config.precision || 3);
    this._round = function (val) {
      return Math.round(val * roundFactor) / roundFactor;
    };
    const visibilityApi = createVisibilityApi(this._config.referenceWindow);
    this._config.visibilityHooks.push(() => !visibilityApi.isHidden());
  }
  function nextState(visobj, currentState) {
    let newState = visobj.state(),
      percentage = newState.percentage;
    return currentState && percentage === currentState.percentage && currentState.percentage === currentState.previous.percentage ? currentState : newState.hidden ? VisSense.VisState.hidden(percentage, currentState) : newState.fullyvisible ? VisSense.VisState.fullyvisible(percentage, currentState) : VisSense.VisState.visible(percentage, currentState);
  }
  function VisMon(visobj, config) {
    const _config = defaults(config, {
      strategy: [new VisMon.Strategy.PollingStrategy(), new VisMon.Strategy.EventStrategy()],
      async: !1,
    });
    this._visobj = visobj, this._state = {}, this._started = !1;
    const anyTopicName = `*#${now()}`;
    this._pubsub = new PubSub({
      async: _config.async,
      anyTopicName,
    }), this._events = [anyTopicName, 'start', 'stop', 'update', 'hidden', 'visible', 'fullyvisible', 'percentagechange', 'visibilitychange'],
      this._strategy = new VisMon.Strategy.CompositeStrategy(_config.strategy), this._strategy.init(this),
      this._pubsub.on('update', (monitor) => {
        let newValue = monitor._state.percentage,
          oldValue = monitor._state.previous.percentage;
        newValue !== oldValue && monitor._pubsub.publish('percentagechange', [monitor, newValue, oldValue]);
      }), this._pubsub.on('update', (monitor) => {
        monitor._state.code !== monitor._state.previous.code && monitor._pubsub.publish('visibilitychange', [monitor]);
      }), this._pubsub.on('visibilitychange', (monitor) => {
        monitor._state.visible && !monitor._state.previous.visible && monitor._pubsub.publish('visible', [monitor]);
      }), this._pubsub.on('visibilitychange', (monitor) => {
        monitor._state.fullyvisible && monitor._pubsub.publish('fullyvisible', [monitor]);
      }), this._pubsub.on('visibilitychange', (monitor) => {
        monitor._state.hidden && monitor._pubsub.publish('hidden', [monitor]);
      }), forEach(this._events, function (event) {
        isFunction(_config[event]) && this.on(event, _config[event]);
      }, this);
  }
  const createVisibilityApi = function (referenceWindow) {
      return (function (document, undefined) {
        let entry = function (propertyName, eventName) {
            return {
              property: propertyName,
              event: eventName,
            };
          },
          event = 'visibilitychange',
          dict = [entry('webkitHidden', `webkit${event}`), entry('msHidden', `ms${event}`), entry('mozHidden', `moz${event}`), entry('hidden', event)],
          api = forEach(dict, entry => document[entry.property] !== undefined ? {
            isHidden() {
              return !!document[entry.property] || !1;
            },
            onVisibilityChange(callback) {
              return document.addEventListener(entry.event, callback, !1), function () {
                document.removeEventListener(entry.event, callback, !1);
              };
            },
          } : void 0);
        return api || {
          isHidden() {
            return !1;
          },
          onVisibilityChange() {
            return noop;
          },
        };
      }((referenceWindow || window).document));
    };
  const PubSub = (function (undefined) {
      function PubSub(config) {
        this._cache = {}, this._onAnyCache = [], this._config = defaults(config, {
          async: !1,
          anyTopicName: '*',
        });
      }
      const syncFireListeners = function (consumers, args) {
        forEach(consumers, (consumer) => {
          consumer(args);
        });
      };
      return PubSub.prototype.on = function (topic, callback) {
        if (!isFunction(callback)) return noop;
        const applyCallback = args => callback(...args || []);
        const listener = !this._config.async ? applyCallback : async(applyCallback);
      var unregister = (listener, array, topic) => { // eslint-disable-line
        return function () {
          const index = array.indexOf(listener);
          return index > -1 ? (array.splice(index, 1), !0) : !1;
        };
      };
        return topic === this._config.anyTopicName ? (this._onAnyCache.push(listener), unregister(listener, this._onAnyCache, '*')) : (this._cache[topic] || (this._cache[topic] = []),
        this._cache[topic].push(listener), unregister(listener, this._cache[topic], topic));
      }, PubSub.prototype.publish = function (topic, args) {
        const listeners = (this._cache[topic] || []).concat(topic === this._config.anyTopicName ? [] : this._onAnyCache);
        const enableAsync = !!this._config.async;
        let syncOrAsyncPublish = null;
        if (enableAsync) {
          syncOrAsyncPublish = async(syncFireListeners);
        } else {
          syncOrAsyncPublish = function syncOrAsyncPublish(listeners, args) {
            syncFireListeners(listeners, args);
            return noop;
          };
        }

        console.debug('publishing topic', enableAsync ? '(async)' : '(sync)', topic, 'to', listeners.length, 'listeners');

        return syncOrAsyncPublish(listeners, args || []);
      }, PubSub;
    }());
  VisSense.prototype.state = function () {
    const hiddenByHook = forEach(this._config.visibilityHooks, function (hook) {
      return hook(this._element) ? void 0 : VisSense.VisState.hidden(0);
    }, this);
    return hiddenByHook || (function (visobj, element, config) {
      const perc = visobj._round(config.percentageHook(element, config.referenceWindow));
      return perc <= config.hidden ? VisSense.VisState.hidden(perc) : perc >= config.fullyvisible ? VisSense.VisState.fullyvisible(perc) : VisSense.VisState.visible(perc);
    }(this, this._element, this._config));
  }, VisSense.prototype.percentage = function () {
    return this.state().percentage;
  }, VisSense.prototype.element = function () {
    return this._element;
  }, VisSense.prototype.referenceWindow = function () {
    return this._config.referenceWindow;
  }, VisSense.prototype.isFullyVisible = function () {
    return this.state().fullyvisible;
  }, VisSense.prototype.isVisible = function () {
    return this.state().visible;
  }, VisSense.prototype.isHidden = function () {
    return this.state().hidden;
  }, VisSense.fn = VisSense.prototype, VisSense.of = function (element, config) {
    return new VisSense(element, config);
  };
  const STATES = {
    HIDDEN: [0, 'hidden'],
    VISIBLE: [1, 'visible'],
    FULLY_VISIBLE: [2, 'fullyvisible'],
  };
  return VisSense.VisState = (function () {
    function newVisState(state, percentage, previous) {
      return previous && delete previous.previous, {
        code: state[0],
        state: state[1],
        percentage,
        previous: previous || {},
        fullyvisible: state[0] === STATES.FULLY_VISIBLE[0],
        visible: state[0] === STATES.VISIBLE[0] || state[0] === STATES.FULLY_VISIBLE[0],
        hidden: state[0] === STATES.HIDDEN[0],
      };
    }
    return {
      hidden(percentage, previous) {
        return newVisState(STATES.HIDDEN, percentage, previous);
      },
      visible(percentage, previous) {
        return newVisState(STATES.VISIBLE, percentage, previous);
      },
      fullyvisible(percentage, previous) {
        return newVisState(STATES.FULLY_VISIBLE, percentage, previous);
      },
    };
  }()), VisMon.prototype.visobj = function () {
    return this._visobj;
  }, VisMon.prototype.publish = function (eventName, args) {
    const isInternalEvent = this._events.indexOf(eventName) >= 0;
    if (isInternalEvent) throw new Error(`Cannot publish internal event "${eventName}" from external scope.`);
    return this._pubsub.publish(eventName, args);
  }, VisMon.prototype.state = function () {
    return this._state;
  }, VisMon.prototype.start = function (config) {
    if (this._started) return this;
    const _config = defaults(config, {
      async: !1,
    });
    return this._cancelAsyncStart && this._cancelAsyncStart(), _config.async ? this.startAsync() : (this._started = !0,
      this.update(), this._pubsub.publish('start', [this]), this._strategy.start(this),
      this);
  }, VisMon.prototype.startAsync = function (config) {
    this._cancelAsyncStart && this._cancelAsyncStart();
    let me = this,
      cancelAsyncStart = defer(() => {
        me.start(extend(defaults(config, {}), {
          async: !1,
        }));
      });
    return this._cancelAsyncStart = function () {
      cancelAsyncStart(), me._cancelAsyncStart = null;
    }, this;
  }, VisMon.prototype.stop = function () {
    this._cancelAsyncStart && this._cancelAsyncStart(), this._started && (this._strategy.stop(this),
      this._pubsub.publish('stop', [this])), this._started = !1;
  }, VisMon.prototype.update = function () {
    this._started && (this._state = nextState(this._visobj, this._state), this._pubsub.publish('update', [this]));
  }, VisMon.prototype.on = function (topic, callback) {
    return this._pubsub.on(topic, callback);
  }, VisMon.Builder = (function () {
    const combineStrategies = function (config, strategies) {
      let combinedStrategies = null,
        forceDisableStrategies = config.strategy === !1,
        enableStrategies = !forceDisableStrategies && (config.strategy || strategies.length > 0);
      if (enableStrategies) {
        let configStrategyIsDefined = !!config.strategy,
          configStrategyIsArray = isArray(config.strategy),
          configStrategyAsArray = configStrategyIsDefined ? configStrategyIsArray ? config.strategy : [config.strategy] : [];
        combinedStrategies = configStrategyAsArray.concat(strategies);
      } else combinedStrategies = forceDisableStrategies ? [] : config.strategy;
      return combinedStrategies;
    };
    return function (visobj) {
      let config = {},
        strategies = [],
        events = [],
        productBuilt = !1,
        product = null;
      return {
        set(name, value) {
          return config[name] = value, this;
        },
        strategy(strategy) {
          return strategies.push(strategy), this;
        },
        on(event, handler) {
          return events.push([event, handler]), this;
        },
        build(consumer) {
          let manufacture = function () {
              const combinedStrategies = combineStrategies(config, strategies);
              config.strategy = combinedStrategies;
              const monitor = visobj.monitor(config);
              return forEach(events, (event) => {
                monitor.on(event[0], event[1]);
              }), productBuilt = !0, product = monitor;
            },
            monitor = productBuilt ? product : manufacture();
          return isFunction(consumer) ? consumer(monitor) : monitor;
        },
      };
    };
  }()), VisMon.Strategy = function () {}, VisMon.Strategy.prototype.init = noop, VisMon.Strategy.prototype.start = noop,
    VisMon.Strategy.prototype.stop = noop, VisMon.Strategy.CompositeStrategy = function (strategies) {
      this._strategies = isArray(strategies) ? strategies : [strategies];
    }, VisMon.Strategy.CompositeStrategy.prototype = Object.create(VisMon.Strategy.prototype),
    VisMon.Strategy.CompositeStrategy.prototype.init = function (monitor) {
      forEach(this._strategies, (strategy) => {
        isFunction(strategy.init) && strategy.init(monitor);
      });
    }, VisMon.Strategy.CompositeStrategy.prototype.start = function (monitor) {
      forEach(this._strategies, (strategy) => {
        isFunction(strategy.start) && strategy.start(monitor);
      });
    }, VisMon.Strategy.CompositeStrategy.prototype.stop = function (monitor) {
      forEach(this._strategies, (strategy) => {
        isFunction(strategy.stop) && strategy.stop(monitor);
      });
    }, VisMon.Strategy.PollingStrategy = function (config) {
      this._config = defaults(config, {
        interval: 1e3,
      }), this._started = !1;
    }, VisMon.Strategy.PollingStrategy.prototype = Object.create(VisMon.Strategy.prototype),
    VisMon.Strategy.PollingStrategy.prototype.start = function (monitor) {
      return this._started || (this._clearInterval = (function (interval) {
        const intervalId = setInterval(() => {
          monitor.update();
        }, interval);
        return function () {
          clearInterval(intervalId);
        };
      }(this._config.interval)), this._started = !0), this._started;
    }, VisMon.Strategy.PollingStrategy.prototype.stop = function () {
      return this._started ? (this._clearInterval(), this._started = !1, !0) : !1;
    }, VisMon.Strategy.EventStrategy = function (config) {
      this._config = defaults(config, {
        throttle: 50,
      }), this._config.debounce > 0 && (this._config.throttle = +this._config.debounce),
      this._started = !1;
    }, VisMon.Strategy.EventStrategy.prototype = Object.create(VisMon.Strategy.prototype),
    VisMon.Strategy.EventStrategy.prototype.start = function (monitor) {
      return this._started || (this._removeEventListeners = (function (update) {
        let referenceWindow = monitor.visobj().referenceWindow(),
          visibilityApi = createVisibilityApi(referenceWindow),
          removeOnVisibilityChangeEvent = visibilityApi.onVisibilityChange(update);
        return referenceWindow.addEventListener('scroll', update, !1), referenceWindow.addEventListener('resize', update, !1),
          referenceWindow.addEventListener('touchmove', update, !1), function () {
            referenceWindow.removeEventListener('touchmove', update, !1), referenceWindow.removeEventListener('resize', update, !1),
            referenceWindow.removeEventListener('scroll', update, !1), removeOnVisibilityChangeEvent();
          };
      }(throttle(() => {
        monitor.update();
      }, this._config.throttle))), this._started = !0), this._started;
    }, VisMon.Strategy.EventStrategy.prototype.stop = function () {
      return this._started ? (this._removeEventListeners(), this._started = !1, !0) : !1;
    }, VisSense.VisMon = VisMon, VisSense.PubSub = PubSub, VisSense.fn.monitor = function (config) {
      return new VisMon(this, config);
    }, VisSense.Utils = {
      async,
      debounce,
      defaults,
      defer,
      extend,
      forEach,
      fireIf,
      identity,
      isArray,
      isDefined,
      isElement,
      isFunction,
      isObject,
      isPageVisible,
      isVisibleByStyling,
      noop,
      now,
      once,
      throttle,
      percentage,
      VisibilityApi: createVisibilityApi(),
      createVisibilityApi,
      _viewport: viewport,
      _isInViewport: isInViewport,
      _isDisplayed: isDisplayed,
      _computedStyle: computedStyle,
      _styleProperty: styleProperty,
    }, VisSense;
}));
