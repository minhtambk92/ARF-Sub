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
      console.log('renderBannerHTML');
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
            const scriptCode = util.explodeScriptTag(bannerData).scripts;
            console.log('scriptCode', scriptCode, bannerData);
            let marginBanner = '';
            if (scriptCode.length > 0 && scriptCode[0].indexOf('ads_box') !== -1) {
            // eslint-disable-next-line
              const bannerCode = scriptCode[0].split('/')[scriptCode[0].split('/').length - 1].split('.')[0].match(/\d+/ig)[0];
              const bannerContainer = `ads_zone${bannerCode}`;
              marginBanner = `<script> var bannerParentID = "${bannerContainer}";` +
                `var removeMargin = setInterval(function() { var bannerParent = document.getElementById(bannerParentID);` + // eslint-disable-line
                'if (bannerParent) {' +
                '   bannerParent.childNodes[1].style.marginLeft = 0;' +
                'clearInterval(removeMargin);' +
                '}}, 100);</script>';
              console.log('bannerIDInsideIframe', bannerContainer);
            }
            // const bannerDataWithMacro = macro.replaceMacro(vm.current.html);
            console.log(bannerData);
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
            if (document.getElementById(`iframe-${vm.current.id}`)) {
              util.resizeIFrameToFitContent(iframe);
              clearInterval(fixIframe);
            }
          }, 500);

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
      const explode = (html) => {
        let element = html;
        const evlScript = [];
        const scripts = [];
        const trim = (str) => {
          let strTemp = str;
          strTemp = strTemp.replace(/^\s+/, '');
          for (let i = strTemp.length - 1; i >= 0; i -= 1) {
            if (/\S/.test(strTemp.charAt(i))) {
              strTemp = strTemp.substring(0, i + 1);
              break;
            }
          }
          return strTemp;
        };
        // boc tach script
        const allScriptTag = html.match(/<(script)[^>]*>(.*?)<\/(script)>/gi);

        if (allScriptTag) {
          let jsCodeInsideScriptTag = '';
          for (let i = 0, len = allScriptTag.length; i < len; i += 1) {
            element = element.replace(allScriptTag[i], '');
            jsCodeInsideScriptTag = allScriptTag[i].replace(/<(script)[^>]*>(.*?)<\/(script)>/gi, '$2');
            if (trim(jsCodeInsideScriptTag) !== '') {
              evlScript.push(trim(jsCodeInsideScriptTag));
            }

            const srcAttribute = allScriptTag[i].match(/src="([^"]*)"/gi);
            if (srcAttribute) {
              const linkSrc = srcAttribute[0].replace(/src="([^"]*)"/gi, '$1');
              scripts.push(linkSrc);
            }
          }
        }
        return { scripts, evlScript };
      };
      const getFileScript = (el, ...url) => {
        const a = document.createElement('script');
        a.type = 'text/javascript';
        a.async = true;
        a.src = url;
        if (url.length >= 2) {
          const arrLength = url[1];
          a.onload = function () {
            const arr = arrLength;
            const strUrl = arr[0];
            arr.shift();
            if (arr.length >= 1) {
              getFileScript(el, strUrl, arr);
            } else {
              getFileScript(el, strUrl);
            }
          };
        }
        if (el === '') {
          const c = document.getElementsByTagName('script')[0];
          console.log(c);
          c.parentNode.insertBefore(a, c);
        } else {
          el.appendChild(a);
        }
      };
      // const urlCore = 'http://admicro1.vcmedia.vn/core/admicro_core_nld.js';
      // const loadAsync = setInterval(() => {
      //   if (window.isLoadLib !== undefined && window.isLoadLib) {
      //     const idw = document.getElementById(`${vm.current.id}`);
      //     if (idw) {
      //       idw.innerHTML = '';
      //       const data = vm.current.html;
      //       admExecJs(data, `${vm.current.id}`);  // eslint-disable-line no-undef
      //     }
      //     clearInterval(loadAsync);
      //   }
      // }, 500);
      // util.admLoadJs(urlCore, 'admicro_core_nld', () => {
      //   const idw = document.getElementById(`${vm.current.id}`);
      //   if (idw) {
      //     idw.innerHTML = '';
      //     const data = vm.current.html;
      //     admExecJs(data, `${vm.current.id}`);  // eslint-disable-line no-undef
      //   }
      //   clearInterval(loadAsync);
      // });

      const HtmlData = vm.current.html;
      const loadAsync = setInterval(() => {
        const idw = document.getElementById(`${vm.current.id}`);
        if (idw) {
          idw.innerHTML = '';
          const dataBanner = explode(HtmlData);

          for (let i = 0; i < dataBanner.scripts.length; i += 1) {
            console.log('abc', dataBanner.scripts[i]);
            getFileScript(idw, dataBanner.scripts[i]);
          }
        }
        clearInterval(loadAsync);
      }, 500);
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
