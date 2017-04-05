/**
 * Created by Manhhailua on 11/24/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
import { Zone as ZoneModel } from '../models';
import { Share } from '../components';
import { dom } from '../mixins';
import { adsStorage, term, util } from '../vendor';

const Zone = Vue.component('zone', {

  props: {
    model: {
      type: Object,
    },
  },

  mixins: [dom],

  created() {
    // Init global container object
    window.arfZones = window.arfZones || {};
    window.arfZones[this.current.id] = this;
  },

  mounted() {
    this.$on('placementRendered', (index, revenueType) => {
      console.log('compete', this.current.id, index, revenueType);
      const domain = util.getThisChannel(term.getCurrentDomain('Site:Pageurl')).slice(0, 2).join('.');
      let cookie = adsStorage.getStorage('_cpt');
      const checkCookie = adsStorage.subCookie(cookie, 'Ver:', 0);
      if (checkCookie === '') {
        cookie = 'Ver:25;';
      }
      adsStorage.setStorage('_cpt', cookie, '', '/', domain);
      let zoneCookie = adsStorage.subCookie(cookie, `${this.current.id}:`, 0);
      cookie = zoneCookie === '' || zoneCookie === undefined ? `${cookie};${this.current.id}:;` : cookie;
      zoneCookie = adsStorage.subCookie(cookie, `${this.current.id}:`, 0);
      const separateChar = `${index === 0 ? '|' : ']['}`;
      const zoneCookieUpdate = `${zoneCookie}${separateChar}${domain})(${index})(${revenueType}`;
      cookie = `${cookie}`.replace(zoneCookie, zoneCookieUpdate);
      adsStorage.setStorage('_cpt', cookie, '', '/', domain);
    });
  },

  computed: {
    current() {
      return (this.model instanceof ZoneModel) ? this.model : new ZoneModel(this.model);
    },

    activeShareModel() {
      return this.current.activeShare();
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;

    return (
      <div
        id={vm.current.id}
        class="arf-zone"
        style={{
          width: `${vm.current.width}px`,
          height: `${vm.current.height}px`,
        }}
      >
        <Share model={vm.activeShareModel} />
      </div>
    );
  },

});

export default Zone;
