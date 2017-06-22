/**
 * Created by Manhhailua on 11/23/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
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
    this.current.countFrequency();
    if (this.current.isRelative) {
      // this.$parent.$emit('relativeBannerRender', this.current.keyword);
      window.ZoneConnect.setRelativeKeyword(this.current.keyword);
    }
    const banner = document.getElementById(this.current.id);
    if (banner) {
      const objMonitor = ViewTrackingLibrary(banner);
      const monitor = ViewTrackingLibrary.VisMon.Builder(objMonitor);
        // let isMonitor = false;
        // let isUpdating = false;
        /* eslint-disable */
        // throttle -> update time
        monitor
          // .strategy(new VisSense.VisMon.Strategy.ConfigurablePollingStrategy({
          //   hidden: 1000,
          //   visible: 2000,
          //   fullyvisible: 5000
          // }))
          .strategy(new ViewTrackingLibrary.VisMon.Strategy.EventStrategy({ throttle: 200 }))
          .strategy(new ViewTrackingLibrary.VisMon.Strategy.PercentageTimeTestEventStrategy('30%/1s', {
            percentageLimit: 0.3,
            timeLimit: 1000,
            interval: 100
          }))
          // .on('update', (monitor) => {
          //   isUpdating = true;
          //   const a = setTimeout(() => {
          //     isUpdating = false;
          //   }, 1000);
          //   clearTimeout(a);
          // })
          // .on('start', (monitor) => {
          //   console.log('start');
          // })
          // .on('visible', (monitor) => {
          //   console.log('visible');
          // })
          // .on('fullyvisible', (monitor) => {
          //   console.log('fullyvisible');
          // })
          // .on('hidden', (monitor) => {
          //   console.log('hidden');
          // })
          // .on('visibilitychange', (monitor) => {
          //   console.log('visibilitychange');
          // })
          // .on('percentagechange', (monitor, newValue, oldValue) => {
          //   // console.log(`percentagechange ${oldValue} -> ${newValue}`);
          //   // const percentChange = newValue === undefined ? 0 : newValue;
          //   setTimeout(() => {
          //     const temp = newValue;
          //     const temp2 = oldValue;
          //     if (!isMonitor && (temp === newValue && temp2 === oldValue)) {
          //       isMonitor = true;
          //       objMonitor.onPercentageTimeTestPassed(() => {
          //         console.log('Banner display passed test for 30% visibility over 1 seconds.');
          //         isMonitor = false;
          //       }, {
          //         percentageLimit: 0.3,
          //         timeLimit: 1000,
          //         interval: 200
          //       });
          //     }
          //   }, 1000);
          // })
          .on('30%/1s', (monitor) => {
            this.current.bannerLogging(2);
            console.log('[Visibility Monitor] Banner display was >30% visible for 1 seconds!');
          })
          .build()
          .start();
        /* eslint-enable */
      banner.addEventListener('click', () => {
        this.current.bannerLogging(1);
        console.log('clickBanner');
      });
    }
  },

  methods: {
    /**
     * Wrap ads by an iframe
     */
    renderToIFrame() {
      const vm = this;
      const iframe = vm.iframe.el;

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
            const scriptCode = util.getScriptTag(bannerData).scripts;
            let marginBanner = '';
            if (scriptCode.length > 0 && scriptCode[0].indexOf('ads_box') !== -1) {
             // eslint-disable-next-line
              const bannerCode = scriptCode[0].split('/')[scriptCode[0].split('/').length - 1].split('.')[0].match(/\d+/ig)[0];
              const bannerContainer = `ads_zone${bannerCode}`;
              marginBanner = `<script> var bannerParentID = "${bannerContainer}";` +
                `setTimeout(function() {
           //  eslint-disable-next-line
                 var bannerParent = document.getElementById(bannerParentID);` + // eslint-disable-line
                'if (bannerParent) {' +
                '   bannerParent.childNodes[1].style.marginLeft = 0;' +
                '}}, 200);</script>';
            }
            // const bannerDataWithMacro = macro.replaceMacro(vm.current.html);
            iframe.contentWindow.document.write(bannerData + marginBanner);
            // iframe.contentWindow.document.write(bannerDataWithMacro);
          }
          iframe.contentWindow.document.close();

          // Prevent scroll on IE
          if (iframe.contentWindow.document.body !== null) {
            iframe.contentWindow.document.body.style.margin = 0;
          }

          // resize iframe fit with content
          const fixIframe = setInterval(() => {
            if (document.readyState === 'complete') {
             // Already loaded!
              if (document.getElementById(`iframe-${vm.current.id}`)) {
                util.resizeIFrameToFitContent(iframe);
              }
              clearInterval(fixIframe);
            } else {
             // Add onload or DOMContentLoaded event listeners here
              window.addEventListener('onload', () => {
                if (document.getElementById(`iframe-${vm.current.id}`)) {
                  util.resizeIFrameToFitContent(iframe);
                }
                clearInterval(fixIframe);
              }, false);
             // or
             // document.addEventListener("DOMContentLoaded", function () {/* code */}, false);
            }
          }, 100);

          // Prevent AppleWebKit iframe.onload loop
          vm.$data.isRendered = true;
        }
      };

      try {
        vm.$el.replaceChild(iframe, vm.$refs.banner); // Do the trick
      } catch (error) {
        throw new Error(error);
      }
    },
    renderBannerHTML() {
      const vm = this;
      const urlCore = 'http://admicro1.vcmedia.vn/core/admicro_core_nld.js';
      const sponsorFormat = vm.current.linkFormatBannerHtml;
      const writeIfrm = (ifrm) => {
        ifrm = ifrm.contentWindow ? ifrm.contentWindow.document : // eslint-disable-line
          ifrm.contentDocument ? ifrm.contentDocument : ifrm.document;
        ifrm.open();
        ifrm.write(`${`${'<head>' +
          '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">' +
          '<script>inDapIF = true;function mobileCallbackMedium(){window.parent.callbackMedium();}</script>' +
          '</head><body style="border: none;display: block;margin: 0 auto;">' +
          '<script>'} </script>` +
          '<script src="'}${sponsorFormat.toString()}" type="text/javascript"> </script>` +
          '<script >sponsoradx(parent.data)</script></body>');
        ifrm.close();
        document.getElementById(`${vm.current.id}`).style.display = 'block';
      };

      console.log('linkFormatBannerHtml', sponsorFormat);
      const loadIfrm = () => {
        const ifrm = vm.iframe.el;
        ifrm.onload = () => {
          ifrm.width = vm.current.width;
          // ifrm.height = vm.current.height;
          ifrm.id = `iframe-${vm.current.id}`;
          ifrm.frameBorder = vm.iframe.frameBorder;
          ifrm.marginWidth = vm.iframe.marginWidth;
          ifrm.marginHeight = vm.iframe.marginHeight;
          ifrm.scrolling = 'no'; // Prevent iframe body scrolling
          ifrm.style.display = 'block';
          ifrm.style.border = 'none';
          ifrm.scrolling = 'no';
          ifrm.allowfullscreen = 'true';
          ifrm.webkitallowfullscreen = 'true';
          ifrm.mozallowfullscreen = 'true';
          ifrm.src = 'about:blank';

          /* eslint-disable no-useless-concat */
          // window.data = JSON.parse(vm.current.dataBannerHtml.replace(/\r?\n|\r/g, ''));
          try {
            eval(`window.data = ${vm.current.dataBannerHtml.replace(/\r?\n|\r/g, '')};`); // eslint-disable-line
          } catch (err) {
            writeIfrm(ifrm);
          }
          // ifrm = ifrm.contentWindow ? ifrm.contentWindow.document : // eslint-disable-line
          //   ifrm.contentDocument ? ifrm.contentDocument : ifrm.document;
          // ifrm.open();
          // ifrm.write(`${`${'<head>' +
          //   '<meta name="viewport" content="width=device-width,
          // initial-scale=1.0, maximum-scale=1.0, user-scalable=0">' +
          //   '<script>inDapIF = true;
          // function mobileCallbackMedium(){window.parent.callbackMedium();}</sc' + 'ript>' +
          //   '</head><body style="border: none;display: block;margin: 0 auto;">' +
          //   '<scri' + 'pt>'} </scr` + 'ipt>' +
          //   '<scri' + 'pt src="'}${sponsorFormat.toString()}"
          // type="text/javascript"> </scr` + 'ipt>' +
          //   '<scri' + 'pt >sponsoradx(parent.data)</scr' +
          //   'ipt></body>');
          // ifrm.close();
          // document.getElementById(`${vm.current.id}`).style.display = 'block';
          writeIfrm(ifrm);
        };

        try {
          vm.$el.replaceChild(ifrm, vm.$refs.banner); // Do the trick
          const setHeightIframe = setInterval(() => {
            const iframe = document.getElementById(`iframe-${vm.current.id}`);
            if (iframe !== undefined) {
              const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
              iframe.height = innerDoc.documentElement.getElementsByTagName('body')[0].offsetHeight;
              clearInterval(setHeightIframe);
            }
          }, 100);
        } catch (error) {
          throw new Error(error);
        }
      };
      const loadAsync = setInterval(() => {
        if (window.isLoadLib !== undefined && window.isLoadLib) {
          loadIfrm();
          clearInterval(loadAsync);
        }
      }, 500);
      util.admLoadJs(urlCore, 'admicro_core_nld', () => {
        loadIfrm();
        clearInterval(loadAsync);
      });
    },
    renderBannerNoIframe() {
      const vm = this;
      try {
        const htmlData = vm.current.html;
        // const loadAsync = setInterval(() => {
        //   const idw = document.getElementById(`${vm.current.id}`);
        //   if (idw) {
        util.executeJS(htmlData, vm.current.id);
        //     clearInterval(loadAsync);
        //   }
        // }, 500);
      } catch (error) {
        throw new Error(error);
      }
    },
    // renderBannerImg() {
    //   console.log('renderBannerImg');
    //   const imgTag = document.createElement('img');
    //   imgTag.src = this.current.imageUrl;
    //   document.getElementById(`${this.current.id}`).appendChild(imgTag);
    // },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;
    // const height = setInterval(() => {
    //   if (document.getElementById(`${vm.current.id}`)) {
    //     this.$parent.$emit('bannerHeight', document.getElementById(`${vm.current.id}`)
    // .clientHeight);
    //     clearInterval(height);
    //   }
    // }, 100);
    const dev = location.search.indexOf('checkPlace=dev') !== -1;
    if (dev) {
      return (
        <div
          id={vm.current.id}
          class="arf-banner"
          style={{
            width: `${vm.current.width}px`,
            zIndex: 0,
            position: 'absolute',
            // height: `${vm.current.height}px`,
          }}
        >
          <div ref="banner">{'banner content'}</div>
        </div>
      );
    }
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
