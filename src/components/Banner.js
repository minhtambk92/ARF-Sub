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
          iframe.contentWindow.document.write(vm.current.html);
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
