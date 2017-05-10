/**
 * Created by Manhhailua on 11/23/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
import { Banner as BannerModel } from '../models';
import { dom } from '../mixins';
import { util } from '../vendor';

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
    if (this.current.bannerType.isInputData !== undefined &&
      this.current.bannerType.isInputData === true && this.current.isIFrame === true) {
      console.log('renderBannerHTML');
      this.renderBannerHTML();
    } else if (this.current.bannerType.isInputData !== undefined &&
      this.current.bannerType.isInputData === false && this.current.isIFrame === true &&
      this.current.bannerType.isUpload !== undefined &&
      this.current.bannerType.isUpload === false) {
      console.log('renderToIFrame');
      this.renderToIFrame();
    } else if (this.current.bannerType.isInputData !== undefined &&
      this.current.bannerType.isInputData === false && this.current.isIFrame === false) {
      console.log('renderBannerNoIframe');
      this.renderBannerNoIframe();
    }
    if (this.current.bannerType.isUpload !== undefined &&
      this.current.bannerType.isUpload === true) {
      // this.renderBannerImg();
      this.renderToIFrame();
    }
    this.current.countFrequency();
    if (this.current.isRelative) {
      // this.$parent.$emit('relativeBannerRender', this.current.keyword);
      window.ZoneConnect.setRelativeKeyword(this.current.keyword);
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
            iframe.contentWindow.document.write(vm.current.html);
          }
          iframe.contentWindow.document.close();

          // Prevent scroll on IE
          iframe.contentWindow.document.body.style.margin = 0;

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
      const urlCore = 'http://admicro1.vcmedia.vn/core/admicro_core_nld.js';
      const loadAsync = setInterval(() => {
        if (window.isLoadLib !== undefined && window.isLoadLib) {
          const idw = document.getElementById(`${vm.current.id}`);
          if (idw) {
            idw.innerHTML = '';
            const data = vm.current.html;
            admExecJs(data, `${vm.current.id}`);  // eslint-disable-line no-undef
          }
          clearInterval(loadAsync);
        }
      }, 500);
      util.admLoadJs(urlCore, 'admicro_core_nld', () => {
        const idw = document.getElementById(`${vm.current.id}`);
        if (idw) {
          idw.innerHTML = '';
          const data = vm.current.html;
          admExecJs(data, `${vm.current.id}`);  // eslint-disable-line no-undef
        }
        clearInterval(loadAsync);
      });
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
        <div ref="banner">{'banner content'}</div>
      </div>
    );
  },

});

export default Banner;
