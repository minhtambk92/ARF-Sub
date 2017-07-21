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
    this.current.passGlobalFiltersToBanner();
    if (window.ZoneConnect === undefined) {
      window.ZoneConnect = {
        relativePlacement: [],
        relativeKeyword: '',
        setRelativeKeyword(keyword) {
          this.relativeKeyword += `${this.relativeKeyword === '' ? '' : ','}${keyword}`;
        },
        clearRelativeKeyword() {
          this.relativePlacement = [];
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
    this.$on('shareRender', (currentCampaignLoad) => {
      if (currentCampaignLoad !== 'none') {
        const currentDomain = encodeURIComponent(util.getThisChannel(term.getCurrentDomain('Site:Pageurl')).slice(0, 2));
        let pageLoadCookie = adsStorage.getStorage('_pls');
        console.log('pageLoadCookie', pageLoadCookie);
        if (adsStorage.subCookie(pageLoadCookie, 'Ver:', 0) === '') {
          pageLoadCookie = 'Ver:25;';
        }

        let pageLoadCampaign = adsStorage.subCookie(pageLoadCookie, `${currentDomain}:`, 0);
        pageLoadCookie = pageLoadCampaign === '' ? `${pageLoadCookie};${currentDomain}:;` : pageLoadCookie;
        console.log('pageLoadCampaign', pageLoadCampaign);
        pageLoadCampaign = adsStorage.subCookie(pageLoadCookie, `${currentDomain}:`, 0);
        const pageLoadCookieUpdate = `${pageLoadCampaign}|${this.current.id}#${currentCampaignLoad}`;
        pageLoadCookie = `${pageLoadCookie}`.replace(pageLoadCampaign, pageLoadCookieUpdate);
        adsStorage.setStorage('_pls', pageLoadCookie, '', '/', currentDomain);
      }
    });


    console.log('zoneRelative', this.isRelative());
    let currentShare = this.current.activeShare(false, '');
  // && Object.keys(window.arfZones).length > 1
    if (this.isRelative()) {
      const isRelative = currentShare.placements.reduce((res, placement) => (res !== true ? placement.relative !== 0 : true), 0);
      console.log('isWait', !isRelative);
      if (isRelative) {
        this.$set(this, 'activeShareModel', currentShare);
      } else {
        const vm = this;
        let times = 0;
        const loadRelative = setInterval(() => {
          times += 1;
          const relativePlacement = window.ZoneConnect.relativePlacement;
          if (relativePlacement.length > 0) {
            currentShare = vm.current.activeShare(false, '');
            vm.$set(vm, 'activeShareModel', currentShare);
            clearInterval(loadRelative);
          }
          if (times >= 8) {
            vm.$set(vm, 'activeShareModel', currentShare);
          }
        }, 100);
      }
      console.log('currentShare', currentShare);
    } else {
      this.$set(this, 'activeShareModel', currentShare);
    }
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
      /**
       * set cookie for build share
       */
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
                    this.$set(this, 'activeShareModel', this.current.activeShare(true, shareFormat, this.$data.lastShare));
                    this.$forceUpdate();
                  }, 7000);
                }
              }
              isTrack = false;
            }, {
              percentageLimit: 0.8,
              timeLimit: 2000,
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
    isRelative() {
      const allShare = this.current.allShares();
      let isRelative = false;
      for (let i = 0; i < allShare.length; i += 1) {
        const share = allShare[i];
        isRelative = share.allsharePlacements.reduce((res, sharePlacement) => (res !== true ? sharePlacement.placement.relative !== 0 : true), 0);
        if (isRelative) {
          break;
        }
      }
      return isRelative;
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;
    const currentShare = vm.activeShareModel;
    vm.$data.lastShare = currentShare ? JSON.stringify(currentShare.placements.map(x => x.id)) : null;
    if (currentShare && currentShare.placements.length > 0) {
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
