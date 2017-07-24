/**
 * Created by Manhhailua on 11/23/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
import postscribe from 'postscribe';
import { Banner as BannerModel } from '../models';
import { dom } from '../mixins';
import { util, macro } from '../vendor';

const Banner = Vue.component('banner', {

  props: {
    model: {
      type: Object,
    },
    iframe: {
      type: Object,
      default: () => ({
        el: document.createElement('iframe'),
        frameBorder: 0,
        marginWidth: 0,
        marginHeight: 0,
      }),
    },
  },

  mixins: [dom],

  data() {
    return {
      isRendered: false,
      isRotate: false,
    };
  },

  computed: {
    current() {
      return (this.model instanceof BannerModel) ? this.model : new BannerModel(this.model);
    },
  },

  created() {
    // Init global container object
    window.arfBanners = window.arfBanners || {};
    window.arfBanners[this.current.id] = this;
  },

  mounted() {
    if (this.current.isIFrame) {
      console.log('renderBannerIframe');
      this.renderToIFrame();
    } else {
      console.log('renderBannerNoIframe');
      this.renderBannerNoIframe();
    }
    /**
     * send log
     */
    if (this.current.preview) {
      this.$on('renderFinish', () => {
        // log view
        this.current.bannerLogging(0);
        // log true view
        this.setupLogging();
      });
    }
    this.current.countFrequency();
    if (this.current.isRelative && this.current.preview !== true) {
      this.$parent.$emit('relativeBannerRender', this.current.keyword);
    }
  },

  methods: {
    /**
     * render ads inside an iframe
     */
    renderToIFrame() {
      const vm = this;
      const wait = setInterval(() => {
        const container = document.getElementById(vm.current.id);
        if (container) {
          container.innerHTML = '';
          const iframe = document.createElement('iframe');

          iframe.onload = () => {
            if (vm.$data.isRendered === false) {
              iframe.width = vm.current.width;
              iframe.height = vm.current.height;
              iframe.id = `iframe-${vm.current.id}`;
              iframe.frameBorder = vm.iframe.frameBorder;
              iframe.marginWidth = vm.iframe.marginWidth;
              iframe.marginHeight = vm.iframe.marginHeight;
              iframe.scrolling = 'no'; // Prevent iframe body scrolling

              iframe.contentWindow.document.open();
              if (this.current.bannerType.isUpload !== undefined &&
                this.current.bannerType.isUpload === true) {
                iframe.contentWindow.document.write(`<img src="${vm.current.imageUrl}">`);
              } else {
                const bannerData = macro.replaceMacro(vm.current.html, true);
                /* eslint-disable */
                // const scriptCode = util.getScriptTag(bannerData).scripts;
                // let marginBanner = '';
                // if (scriptCode.length > 0 && scriptCode[0].indexOf('ads_box') !== -1) {
                //   // eslint-disable-next-line
                //   const bannerCode = scriptCode[0].split('/')[scriptCode[0].split('/').length - 1].split('.')[0].match(/\d+/ig)[0];
                //   const bannerContainer = `ads_zone${bannerCode}`;
                //   marginBanner = `<script> var bannerParentID = "${bannerContainer}";` +
                //     `setTimeout(function() {
                //      var bannerParent = document.getElementById(bannerParentID);` + // eslint-disable-line
                //     'if (bannerParent) {' +
                //     '   bannerParent.childNodes[1].style.marginLeft = 0;' +
                //     '}}, 200);</script>';
                // }
                // const bannerDataWithMacro = macro.replaceMacro(vm.current.html);
                /* eslint-enable */
                iframe.contentWindow.document.write(bannerData /* + marginBanner */);
                // iframe.contentWindow.document.write(bannerDataWithMacro);
              }
              iframe.contentWindow.document.close();

              // Prevent scroll on IE
              if (iframe.contentWindow.document.body !== null) {
                iframe.contentWindow.document.body.style.margin = 0;
              }

              // resize iframe fit with content
              if (document.readyState === 'complete') {
                  // Already loaded!
                setTimeout(() => {
                  if (document.getElementById(`iframe-${vm.current.id}`)) {
                    util.resizeIFrameToFitContent(iframe);
                  }
                }, 1000);
              } else {
                  // Add onload or DOMContentLoaded event listeners here
                window.addEventListener('onload', () => {
                  setTimeout(() => {
                    if (document.getElementById(`iframe-${vm.current.id}`)) {
                      util.resizeIFrameToFitContent(iframe);
                    }
                  }, 1000);
                }, false);
                  // or
                  // document.addEventListener("DOMContentLoaded", function () {/* code */}, false);
              }

              // Prevent AppleWebKit iframe.onload loop
              vm.$data.isRendered = true;
            }
          };

          try {
            // vm.$el.replaceChild(iframe, vm.$refs.banner); // Do the trick
            vm.$el.appendChild(iframe);
            if (vm.current.preview !== true) {
              vm.$parent.$emit('renderFinish');
              vm.$emit('renderFinish');
            }
            clearInterval(wait);
          } catch (error) {
            clearInterval(wait);
            throw new Error(error);
          }
        }
      }, 500);
    },
    /**
     * render ads async code without iframe
     */
    renderBannerNoIframe() {
      const vm = this;
      const htmlData = vm.current.html;
      console.log('htmlData', htmlData);
      const loadAsync = setInterval(() => {
        try {
          const container = document.getElementById(vm.current.id);
          if (container) {
            container.innerHTML = '';
            const writeAsync = postscribe;
            writeAsync(`#${vm.current.id}`, htmlData, {
              error() {
                clearInterval(loadAsync);
              },
              done() {
                if (vm.current.preview !== true) {
                  vm.$parent.$emit('renderFinish');
                  vm.$emit('renderFinish');
                }
              },
            });
            clearInterval(loadAsync);
          }
        } catch (error) {
          clearInterval(loadAsync);
          throw new Error('Banner Error!');
        }
      }, 100);
        // const loadAsync = setInterval(() => {
        //   const idw = document.getElementById(`${vm.current.id}`);
        //   if (idw) {
        // util.executeJS(htmlData, vm.current.id);
        //     clearInterval(loadAsync);
        //   }
        // }, 500);
    },
    /**
     * logging
     */
    setupLogging() {
      const banner = document.getElementById(this.current.id);
      const objMonitor = ViewTracking(banner);
      const monitor = ViewTracking.VisMon.Builder(objMonitor);
        // throttle -> update time
      monitor
          .strategy(new ViewTracking.VisMon.Strategy.EventStrategy({ throttle: 200 }))
          .strategy(new ViewTracking.VisMon.Strategy.PercentageTimeTestEventStrategy('30%/1s', {
            percentageLimit: 0.3,
            timeLimit: 200,
            interval: 100,
          }))
          .on('30%/1s', () => {
            this.current.bannerLogging(2);
            console.log('[Visibility Monitor] Banner display was >30% visible for 1 seconds!');
          })
          .build()
          .start();
      banner.addEventListener('click', () => {
        this.current.bannerLogging(1);
        console.log('clickBanner');
      });
    },
    /**
     * Callback other banner cpm > cpd
     */
    bannerCallback() {
      if (this.current.preview !== false) this.$parent.$emit('callbackBanner');
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;
    if (this.current.isRotate) {
      vm.$data.isRendered = false;
      vm.renderToIFrame();
      // logging when rotate.
      this.current.bannerLogging(3);
    }
    // const height = setInterval(() => {
    //   if (document.getElementById(`${vm.current.id}`)) {
    //     this.$parent.$emit('bannerHeight', document.getElementById(`${vm.current.id}`)
    // .clientHeight);
    //     clearInterval(height);
    //   }
    // }, 100);
    return (
      <div
        id={vm.current.id}
        class="arf-banner"
        style={{
          width: `${vm.current.width}px`,
          // height: `${vm.current.height}px`,
        }}
      >
        <div ref="banner" />
      </div>
    );
  },

});

export default Banner;
