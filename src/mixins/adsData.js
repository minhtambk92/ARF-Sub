/**
 * Created by tlm on 06/03/2017.
 */

import Vue from 'vue';
import { adsStorage } from '../vendor';

// Init data for checking
const adsData = Vue.mixin({
  beforeCreate() {
    if (!window.init) {
      // set local storage for check data
      window.admislocalStorage = (function admislocalStorage() {
        if (!('localStorage' in window && window.localStorage !== null)) return !1;
        try {
          localStorage.setItem('_admstorage', '');
          localStorage.removeItem('_admstorage');
        } catch (a) {
          return !1;
        }
        return !0;
      }());

      // load tracking -> this provide location
      const trackingJs = document.getElementById('adm-tracking');
      if (trackingJs == null) {
        const b = document.createElement('script');
        b.id = 'adm-tracking';
        b.type = 'text/javascript';
        b.async = !0;
        b.src = '//media1.admicro.vn/core/adm_tracking.js?id=1';
        const c = document.getElementsByTagName('script')[0];
        c.parentNode.insertBefore(b, c);
      }
      window.init = true;
    }
    // get data about location.
    window.ADSData = {
      ADSLocation: adsStorage.getStorage('__R'),
      ADSCity: adsStorage.getStorage('__RC'),
      ADSCityMain: '',
    };

    if (window.ADSData.ADSLocation !== '') {
      if (parseInt(window.ADSData.ADSLocation, 10) >= 0 &&
        parseInt(window.ADSData.ADSLocation, 10) <= 3) {
        if (window.ADSData.ADSCity === '' || (typeof (window.ADSData.ADSCity) === 'undefined')) {
          window.helpers.setStorage('__RC', window.ADSData.ADSLocation, '', '/');
        }
      } else {
        // mien bac
        const res1 = parseInt(window.ADSData.ADSLocation, 10) === 4 ||
          (parseInt(window.ADSData.ADSLocation, 10) >= 7 &&
          parseInt(window.ADSData.ADSLocation, 10) < 31);
        if (res1) {
          window.helpers.setStorage('__R', '1', '', '/');
        } else if (parseInt(window.ADSData.ADSLocation, 10) >= 31 ||
          parseInt(window.ADSData.ADSLocation, 10) <= 51) { // mien trung
          window.helpers.setStorage('__R', '2', '', '/');
        } else {
          window.helpers.setStorage('__R', '3', '', '/');
        }
        window.helpers.setStorage('__RC', window.ADSData.ADSLocation, '', '/');
      }

      if (window.ADSData.ADSLocation === '0' && window.ADSData.ADSCity !== '0') {
        const res2 = parseInt(window.ADSData.ADSCity, 10) === 4 ||
          (parseInt(window.ADSData.ADSCity, 10) >= 7 &&
          parseInt(window.ADSData.ADSCity, 10) < 31);
        if (res2) {
          window.ADSData.ADSLocation = 1;
          window.helpers.setStorage('__R', '1', '', '/');
        } else if (parseInt(window.ADSData.ADSCity, 10) >= 31 &&
          parseInt(window.ADSData.ADSCity, 10) <= 51) {
          window.ADSData.ADSLocation = 2;

          window.helpers.setStorage('__R', '2', '', '/');
        } else if (parseInt(window.ADSData.ADSCity, 10) <= 100) {
          window.ADSData.ADSLocation = 3;
          window.helpers.setStorage('__R', '3', '', '/');
        }
      }
    }

    // ADScity = 101 -> foreign
    window.ADSData.ADSCityMain = window.ADSData.ADSCity;
    if (window.ADSData.ADSCity != null && window.ADSData.ADSCity !== '' && !isNaN(parseInt(window.ADSData.ADSCity, 10))) {
      if (parseInt(window.ADSData.ADSCity, 10) > 101) {
        window.ADSData.ADSCityMain = parseInt(window.ADSData.ADSCity, 10);
        window.ADSData.ADSCity = 101;
      }
    }
  },
});

export default adsData;
