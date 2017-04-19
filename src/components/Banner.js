/**
 * Created by Manhhailua on 11/23/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
import { Banner as BannerModel } from '../models';
import { dom } from '../mixins';

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
    this.renderToIFrame();
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
          iframe.frameBorder = vm.iframe.frameBorder;
          iframe.marginWidth = vm.iframe.marginWidth;
          iframe.marginHeight = vm.iframe.marginHeight;
          iframe.scrolling = 'no'; // Prevent iframe body scrolling

          iframe.contentWindow.document.open();
          iframe.contentWindow.document.write(vm.current.script);
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
      const iframe = vm.iframe.el;
      const urlCore = 'http://admicro1.vcmedia.vn/core/admicro_core_nld.js';
      const admLoadJs = (c, b) => { // eslint-disable-line no-unused-vars, class-methods-use-this
        const a = document.createElement('script');
        a.type = 'text/javascript';
        a.src = c;
        /* eslint-disable no-unused-expressions */
        /* eslint-disable no-mixed-operators */
        arguments.length >= 2 && (a.onload = b, a.onreadystatechange = function () {
          (a.readyState !== 4) && (a.readyState !== 'complete') || b();
        });
        document.getElementsByTagName('head')[0].appendChild(a);
      };
      admLoadJs(urlCore, () => {
        const ifrm = iframe;
        ifrm.style.width = '300px';
        ifrm.style.height = '600px';
        ifrm.style.display = 'block';
        ifrm.style.border = 'none';
        ifrm.scrolling = 'no';
        ifrm.allowfullscreen = 'true';
        ifrm.webkitallowfullscreen = 'true';
        ifrm.mozallowfullscreen = 'true';
        ifrm.src = 'about:blank';

        document.getElementById('banner').appendChild(ifrm);
        /* eslint-disable no-useless-concat */

        window.data = vm.current.html;

        const ifrmlRender = ifrm.contentWindow || ifrm.contentDocument.document
          || ifrm.contentDocument;
        ifrmlRender.document.open();
        ifrmlRender.document.write(`${'<head>' +
          '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">' +
          '<script>inDapIF = true;function mobileCallbackMedium(){window.parent.callbackMedium();}</sc' + 'ript>' +
          '</head><body style="border: none;display: block;margin: 0 auto;">' +
          '<scri' + 'pt>'} </scr` + 'ipt>' +
          '<scri' + 'pt src="http://media1.admicro.vn/core/sponsoradx3.js" type="text/javascript"> </scr' + 'ipt>' +
          '<script>sponsoradx(parent.data)</scr' +
          'ipt></body>');
        ifrmlRender.document.close();
        document.getElementById('banner').style.display = 'block';
      });
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;

    return (
      <div
        id={vm.current.id}
        class="arf-banner"
        style={{
          width: `${vm.current.width}px`,
          height: `${vm.current.height}px`,
        }}
      >
        <div ref="banner">{vm.current.html}</div>
      </div>
    );
  },

});

export default Banner;
