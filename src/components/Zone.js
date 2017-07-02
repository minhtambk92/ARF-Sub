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
    if (window.ZoneConnect === undefined) {
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

  data() {
    return {
      lastShare: null,
      isReCompute: false,
      isRotate: false,
      activeShareModel: null,
    };
  },

  beforeMount() {
    const currentShare = this.current.activeShare(window.ZoneConnect.relativeKeyword, false, '');
    console.log('currentShare', currentShare);
    this.$set(this, 'activeShareModel', currentShare);
  },

  mounted() {
    // if (this.activeShareModel.isRotate) {
    //   const shareFormat = this.activeShareModel.format;
    //   setInterval(() => {
    //     this.$data.isRotate = true;
    //     this.$set(this, 'activeShareModel', this.current.activeShare(window.ZoneConnect.relativeKeyword, true, shareFormat, this.$data.lastShare));
    //     this.$forceUpdate();
    //   }, 5000);
    // }
    this.setupRotate();
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
    this.current.zoneLogging();
  },

  computed: {
    current() {
      return (this.model instanceof ZoneModel) ? this.model : new ZoneModel(this.model);
    },
    initActiveShareModel: {
      cache: true,
      get() {
        const res = this.current.activeShare(window.ZoneConnect.relativeKeyword, false, '');
        this.$data.lastShare = JSON.stringify(res.placements.map(x => x.id));
        return res;
      },
    },
  },

  methods: {
    setupRotate() {
      const zone = document.getElementById(this.current.id);
      const objMonitor = ViewTracking(zone);
      const monitor = ViewTracking.VisMon.Builder(objMonitor);
      let isTrack = false;
      let isRotate = null;
      // throttle -> update time
      monitor
        .strategy(new ViewTracking.VisMon.Strategy.EventStrategy({ throttle: 200 }))
        .on('update', (track) => {
              /*  at least 80% -> setup rotate  */
          if (track.state().percentage >= 0.8 && isTrack === false) {
            console.log('testMonitorZone', track.state().percentage);
            isTrack = true;
            const aaa = ViewTracking(zone);
            aaa.onPercentageTimeTestPassed(() => {
              if (this.activeShareModel.isRotate) {
                const shareFormat = this.activeShareModel.format;
                if (isRotate === null) {
                  console.log('Zone display was >80% visible for 1 seconds!', isRotate);
                  isRotate = setInterval(() => {
                    this.$data.isRotate = true;
                    this.$set(this, 'activeShareModel', this.current.activeShare(window.ZoneConnect.relativeKeyword, true, shareFormat, this.$data.lastShare));
                    this.$forceUpdate();
                  }, 5000);
                }
              }
              isTrack = false;
            }, {
              percentageLimit: 0.8,
              timeLimit: 3000,
              interval: 100,
            });
          }
              /* under 20% -> cancel rotate */
          if (track.state().percentage <= 0.2 && isRotate !== null) {
            console.log('clearInterval');
            clearInterval(isRotate);
            isRotate = null;
          }
        })
        .build()
        .start();
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;
    const currentShare = vm.activeShareModel;
    vm.$data.lastShare = JSON.stringify(currentShare.placements.map(x => x.id));
    if (currentShare) {
      return (
        <div
          id={vm.current.id}
          class="arf-zone"
          style={{
            width: `${vm.current.width}px`,
            height: 'auto',
            margin: 'auto',
          }}
        >
          <Share model={currentShare} />
        </div>
      );
    }
    return (
      <div
        id={vm.current.id}
        class="arf-zone"
        style={{
          width: `${vm.current.width}px`,
          height: 'auto',
          margin: 'auto',
        }}
      />
    );
  },

});

export default Zone;
