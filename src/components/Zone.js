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
    if ((typeof window.ZoneConnect === 'undefined' && window.ZoneConnect === undefined)) {
      window.ZoneConnect = {
        relativeKeyword: '',
        setRelativeKeyword(keyword) {
          this.relativeKeyword += `${this.relativeKeyword === '' ? '' : ','}${keyword}`;
        },
        clearRelativeKeyword() {
          this.relativeKeyword = '';
        },
      };
    }
    // Init global container object
    window.arfZones = window.arfZones || {};
    window.arfZones[this.current.id] = this;
  },

  mounted() {
    // this.$on('shareHeight', (height) => {
    //   document.getElementById(`${this.current.id}`).style.height = `${height}px`;
    // });

    this.$on('placementRendered', (index, revenueType, placeID) => {
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
      const zoneCookieUpdate = `${zoneCookie}${separateChar}${domain})(${index})(${revenueType})(${placeID}`;
      cookie = `${cookie}`.replace(zoneCookie, zoneCookieUpdate);
      adsStorage.setStorage('_cpt', cookie, '', '/', domain);
    });
  },

  computed: {
    current() {
      return (this.model instanceof ZoneModel) ? this.model : new ZoneModel(this.model);
    },

    activeShareModel() {
      return this.current.activeShare(window.ZoneConnect.relativeKeyword);
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;

    return (
      <div
        id={vm.current.id}
        class="arf-zone"
        // style={{
        //   // width: `${vm.current.width}px`,
        //   // height: 'auto',
        //   margin: 'auto',
        // }}
      >
        <Share model={vm.activeShareModel} />
      </div>
    );
  },

});

export default Zone;
