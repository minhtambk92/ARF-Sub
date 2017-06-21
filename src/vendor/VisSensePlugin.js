/**
 * Created by tamleminh on 17/06/2017.
 */
/* eslint-disable */
// PercentageTimeMonitor
  !(function (root, factory) {
    factory(root, root.ViewTrackingLibrary, root.ViewTrackingLibrary.Utils);
  }(window, (window, VisSense, VisSenseUtils, undefined) => {
    let createInnerMonitor = function (outerMonitor, callback, config) {
        let timeElapsed = 0,
          timeStarted = null,
          timeLimit = config.timeLimit,
          percentageLimit = config.percentageLimit,
          interval = config.interval;
        return VisSense.VisMon.Builder(outerMonitor.visobj()).strategy(new VisSense.VisMon.Strategy.PollingStrategy({
          interval,
        })).on('update', (monitor) => {
          const percentage = monitor.state().percentage;
          if (percentageLimit > percentage) timeStarted = null; else {
            const now = VisSenseUtils.now();
            timeStarted = timeStarted || now, timeElapsed = now - timeStarted;
          }
          timeElapsed >= timeLimit && (monitor.stop(), outerMonitor.stop(), callback(monitor));
        }).on('stop', () => {
          timeStarted = null;
        }).build();
      },
      onPercentageTimeTestPassed = function (visobj, callback, config) {
        let _config = VisSenseUtils.defaults(config, {
            percentageLimit: 1,
            timeLimit: 1e3,
            interval: 100,
            strategy: undefined,
          }),
          hiddenLimit = Math.max(_config.percentageLimit - 0.001, 0),
          innerMonitor = null,
          outerMonitor = VisSense.VisMon.Builder(new VisSense(visobj.element(), {
            hidden: hiddenLimit,
            referenceWindow: visobj.referenceWindow(),
          })).set('strategy', _config.strategy).on('visible', (monitor) => {
            innerMonitor === null && (innerMonitor = createInnerMonitor(monitor, callback, _config)),
              innerMonitor.start();
          }).on('hidden', () => {
            innerMonitor !== null && innerMonitor.stop();
          }).on('stop', () => {
            innerMonitor !== null && innerMonitor.stop();
          }).build();
        return outerMonitor.start(), function () {
          outerMonitor.stop(), innerMonitor = null;
        };
      };
    VisSense.fn.onPercentageTimeTestPassed = function (callback, config) {
      onPercentageTimeTestPassed(this, callback, config);
    }, VisSense.fn.on50_1TestPassed = function (callback, options) {
      const config = VisSenseUtils.extend(VisSenseUtils.defaults(options, {
        interval: 100,
      }), {
        percentageLimit: 0.5,
        timeLimit: 1e3,
      });
      onPercentageTimeTestPassed(this, callback, config);
    }, VisSense.VisMon.Strategy.PercentageTimeTestEventStrategy = function (eventName, options) {
      let registerPercentageTimeTestHook = function (monitor, percentageTimeTestConfig) {
          var cancelTest = VisSenseUtils.noop,
            unregisterVisibleHook = monitor.on('visible', VisSenseUtils.once((monitor) => {
              cancelTest = onPercentageTimeTestPassed(monitor.visobj(), (innerMonitor) => {
                const report = {
                  monitorState: innerMonitor.state(),
                  testConfig: percentageTimeTestConfig,
                };
                monitor.update(), monitor.publish(eventName, [monitor, report]);
              }, percentageTimeTestConfig), unregisterVisibleHook();
            }));
          return function () {
            unregisterVisibleHook(), cancelTest();
          };
        },
        cancel = VisSenseUtils.noop;
      return {
        init(monitor) {
          cancel = registerPercentageTimeTestHook(monitor, options);
        },
        stop() {
          cancel();
        },
      };
    };
  }));

/*! { "name": "vissense-configurable-polling-strategy", "version": "0.0.1", "copyright": "(c) 2015 tbk" } */
  (function (root, factory) {
    const vissense = root.ViewTrackingLibrary;
    const utils = vissense.Utils;
    const strategy = vissense.VisMon.Strategy;
    factory(root, vissense, utils, strategy, root.Again);
  }(window, (window, VisSense, VisSenseUtils, Strategy, Again, undefined) => {
  /**
   * @license
   * Available under MIT license <http://opensource.org/licenses/MIT>
   */


  /**
   * @class
   * @name ConfigurablePollingStrategy
   * @extends VisSense.VisMon.Strategy
   * @memberof VisSense.VisMon.Strategy
   *
   * @param {VisSense.VisMon.Strategy.ConfigurablePollingStrategy#ConfigurablePollingStrategyConfig} [config={}] The config object
   *
   * @classdesc A strategy that will periodically update the objects
   * visibility state. Configurable!
   *
   * @example
   *
   * var visMon = VisSense(...).monitor({
 *   strategy: new VisSense.VisMon.Strategy.ConfigurablePollingStrategy({
 *     hidden: 5000
 *     visible: 3000,
 *     fullyvisible: 1000
 *   }),
 *   update: function() {
 *     console.log('updated.');
 *   }
 * }).start();
   *
   */
    Strategy.ConfigurablePollingStrategy = function (config) {
      const _config = VisSenseUtils.defaults(config, {
        fullyvisible: 1000,
        visible: 1000,
        hidden: 3000,
      });

      this._startInternal = function (monitor) {
        const againjs = Again.create();

        const stopUpdate = monitor.on('visibilitychange', (monitor) => {
          console.log(`[ConfigurablePollingStrategy] update againjs timer with ${monitor.state().state}`);
          againjs.update(monitor.state().state);
        });

        const stopAgainJs = againjs.every(() => {
          console.log(`[ConfigurablePollingStrategy] update monitor by AgainJs ${monitor.state().state}`);
          monitor.update();
        }, _config);

        console.log(`[ConfigurablePollingStrategy] starting againjs timer with "${monitor.state().state}"`);
        againjs.update(monitor.state().state);

        return function () {
          stopAgainJs();
          stopUpdate();
        };
      };
      this._stopInternal = null;

      this._started = false;
    };
    Strategy.ConfigurablePollingStrategy.prototype = Object.create(
    Strategy.prototype,
  );
  /**
   * @method
   * @name start
   *
   * @param {VisSense.VisMon} monitor
   *
   * @memberof VisSense.VisMon.Strategy.ConfigurablePollingStrategy#
   */
    Strategy.ConfigurablePollingStrategy.prototype.start = function (monitor) {
      if (!this._started) {
        this._stopInternal = this._startInternal(monitor);
        this._started = true;
      }
      return this._started;
    };
  /**
   * @method
   * @name stop
   *
   * @param {VisSense.VisMon} monitor
   *
   * @memberof VisSense.VisMon.Strategy.ConfigurablePollingStrategy#
   */
    Strategy.ConfigurablePollingStrategy.prototype.stop = function () {
      if (!this._started) {
        return false;
      }
      this._stopInternal();
      this._started = false;
      return true;
    };
  }));
