/**
 * Created by Manhhailua on 11/24/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
import { Zone as ZoneModel } from '../models';
// import { Zone as ZoneModel, Share as ShareModel } from '../models';
import { Share } from '../components';
import { dom } from '../mixins';
import { adsStorage, term, util, detectDevices } from '../vendor';

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
      pageLoad: null,
    };
  },

  beforeMount() {
    if (this.current.preview === true) {
      const currentShare = this.current.activeShare(false, '');
      currentShare.preview = true;
      this.$set(this, 'activeShareModel', currentShare);
    } else {
      this.$on('shareRender', (currentCampaignLoad) => {
        if (currentCampaignLoad !== 'none') {
          this.$set(this, 'pageLoad', currentCampaignLoad);
          const currentDomain = encodeURIComponent(util.getThisChannel(term.getCurrentDomain('Site:Pageurl')).slice(0, 2));
          let pageLoadCookie = adsStorage.getStorage('_pls');
          // console.log('pageLoadCookie', pageLoadCookie);
          if (adsStorage.subCookie(pageLoadCookie, 'Ver:', 0) === '') {
            pageLoadCookie = 'Ver:25;';
          }

          let pageLoadCampaign = adsStorage.subCookie(pageLoadCookie, `${currentDomain}:`, 0);
          if (pageLoadCampaign === '') {
            pageLoadCookie = `${pageLoadCookie};${currentDomain}:;`;
          } else {
            const pageLoadCampaignTemp = pageLoadCampaign.slice(pageLoadCampaign.indexOf(':') + 1);
            const ArrayLastCampaignLoad = pageLoadCampaignTemp.split('|').filter(item => item !== '').filter(item => item.indexOf(this.current.id) !== -1);
            if (ArrayLastCampaignLoad.length > 3) {
              const lastCampaignLoad = ArrayLastCampaignLoad.slice(Math.max(ArrayLastCampaignLoad.length - 3, 1));
              const regex = new RegExp(`(${this.current.id})(.*?)([|])`, 'g');
              let shortenedPageLoadCampaign = '';
              if (pageLoadCampaign.slice(-1) !== '|') {
                shortenedPageLoadCampaign = `${pageLoadCampaign}|`.replace(regex, '');
              } else {
                shortenedPageLoadCampaign = `${pageLoadCampaign}`.replace(regex, '');
              }
              const updatePageLoadCampaign = shortenedPageLoadCampaign + lastCampaignLoad.join('|');
              // console.log('shortenedPageLoadCampaign', updatePageLoadCampaign, pageLoadCampaign);
              pageLoadCookie = `${pageLoadCookie}`.replace(pageLoadCampaign, updatePageLoadCampaign);
              // console.log('pageLoadCookieAfter', pageLoadCookie);
            }
          }
          pageLoadCampaign = adsStorage.subCookie(pageLoadCookie, `${currentDomain}:`, 0);
          // console.log('pageLoadCampaign', pageLoadCampaign);
          const pageLoadCookieUpdate = `${pageLoadCampaign}|${this.current.id}#${currentCampaignLoad}`;
          pageLoadCookie = `${pageLoadCookie}`.replace(pageLoadCampaign, pageLoadCookieUpdate);
          adsStorage.setStorage('_pls', pageLoadCookie, '', '/', currentDomain);
        }
      });

      // console.log('zoneRelative', this.isRelative() && this.$data.pageLoad === null);
      // let currentShare = this.current.activeShare(false, '');
      // // && Object.keys(window.arfZones).length > 1
      // if (this.isRelative() && this.$data.pageLoad === null) {
      //   const isRelative = currentShare.placements.reduce((res, placement) => (res !== true ? placement.relative !== 0 : true), 0);
      //   console.log('isWait', !isRelative);
      //   let listCampaigns = null;
      //   try {
      //     listCampaigns = this.current.shares.map(item => ((item instanceof ShareModel) ? item : new ShareModel(item)))
      //       .map(share => share.allsharePlacements.filter(sharePlacement => sharePlacement.placement.filterBanner().length > 0))
      //       .reduce((result, item) => (Array.isArray(result) ? result.concat(item) : item), 0)
      //       .filter(sharePlacement => sharePlacement.placement.relative !== 0)
      //       .map(sharePlacement => ({ campaignId: sharePlacement.placement.campaignId, code: sharePlacement.placement.relative }));
      //   } catch (err) {
      //     listCampaigns = [];
      //   }
      //   console.log('listCampaigns', this.current.id, listCampaigns);
      //   listCampaigns.map(item => util.setRelative(this.current.id, item.campaignId, item.code, false));
      //   if (isRelative && window.ZoneConnect.relativePlacement.length === 0) {
      //     // this.$set(this, 'activeShareModel', currentShare);
      //     currentShare.placements.map(placement => { // eslint-disable-line
      //       const relativeCode = placement.relative;
      //       if (placement.relative !== 0) {
      //         const campaignId = placement.campaignId;
      //         util.setRelative(this.current.id, campaignId, relativeCode, true);
      //       }
      //     });
      //   }
      //   const vm = this;
      //   let times = 0;
      //   const loadRelative = setInterval(() => {
      //     times += 1;
      //     const relativePlacement = window.ZoneConnect.relativePlacement;
      //       // const isContainCampaignInRelativePlacement = relativePlacement.reduce((result, item) =>
      //       //   (result !== true ? listCampaigns.indexOf(item.campaignId) !== -1 : true), 0);
      //     const intersect = util.getIntersect(relativePlacement.map(item => item.campaignId), listCampaigns);
      //     const relativeIntersect = relativePlacement.filter(item => intersect.indexOf(item.campaignId) !== -1);
      //     console.log('testIntersect', intersect, relativeIntersect);
      //     const check = relativeIntersect.reduce((res, item) => {
      //       const zones = item.zones;
      //       if (res !== true) {
      //         if (zones.length > 1) return true;
      //         return false;
      //       }
      //       return true;
      //     }, 0);
      //     console.log('isContainCampaignInRelativePlacement', this.current.id, check);
      //     if (check && relativePlacement.length > 0) {
      //       console.log('recreateShare', this.current.id);
      //       // currentShare = vm.current.activeShare(false, '');
      //       vm.$set(vm, 'activeShareModel', currentShare);
      //       clearInterval(loadRelative);
      //     } else {
      //       currentShare = vm.current.activeShare(false, '');
      //       const isRelativeNew = currentShare.placements.reduce((res, placement) => (res !== true ? placement.relative !== 0 : true), 0);
      //       if (isRelativeNew) currentShare.placements.map(placement => { // eslint-disable-line
      //         const relativeCode = placement.relative;
      //         if (placement.relative !== 0) {
      //           const campaignId = placement.campaignId;
      //           util.setRelative(this.current.id, campaignId, relativeCode);
      //         }
      //       });
      //     }
      //     if (times >= 8) {
      //       vm.$set(vm, 'activeShareModel', currentShare);
      //       clearInterval(loadRelative);
      //     }
      //   }, 100);
      //
      //
      //   // const loadRelative2 = setInterval(() => {
      //   //   // const othersRelatives = window.ZoneConnect.relativePlacement
      //   //   //   .filter(item => item.zoneId !== this.current.zoneId)
      //   //   //   .filter(item => item.relatives
      //   //   //   .reduce((result, relative) => relative.codes.reduce((checkCode, code) => (checkCode !== true ? code.active === true : true), 0), 0));
      //   //   // const thisRelaive = window.ZoneConnect.relativePlacement
      //   //   //   .filter(item => item.zoneId === this.current.zoneId)
      //   //   //   .filter(item => item.relatives
      //   //   //     .reduce((result, relative) => relative.codes.reduce((checkCode, code) => (checkCode !== true ? code.active === true : true), 0), 0));
      //   //   times += 1;
      //   //   const thisZoneRelative = window.ZoneConnect.relativePlacement
      //   //     .filter(item => item.zoneId === this.current.zoneId)[0].relatives;
      //   //   const indexOfThisZone = window.ZoneConnect.relativePlacement.map(x => x.zoneId).indexOf(vm.current.id);
      //   //   const findCampaign = window.ZoneConnect.relativePlacement.reduce((result, item, indexZone) => {
      //   //     const zoneId = item.zoneId;
      //   //     const relatives = item.relatives;
      //   //     if (zoneId !== vm.current.id) {
      //   //       const intersect = util.getIntersect(thisZoneRelative.map(x => x.campaignId), relatives.map(x => x.campaignId));
      //   //       if (intersect.length > 0) {
      //   //         const listActive = [];
      //   //         if (indexOfThisZone < indexZone) {
      //   //           thisZoneRelative.filter(x => intersect.indexOf(x.campaignId) !== -1)
      //   //             .map(z => { // eslint-disable-line
      //   //               z.codes.map(x => { // eslint-disable-line
      //   //                 if (x.active) {
      //   //                   const i = listActive.map(y => y.campaignId).indexOf(z.campaignId);
      //   //                   if (i === -1) listActive.push({ campaignId: z.campaignId, codes: [x] });
      //   //                   else listActive[i].codes.push(x);
      //   //                 }
      //   //               });
      //   //             });
      //   //         } else {
      //   //           relatives.filter(x => intersect.indexOf(x.campaignId) !== -1)
      //   //             .map(z => { // eslint-disable-line
      //   //               z.codes.map(x => { // eslint-disable-line
      //   //                 if (x.active) {
      //   //                   const i = listActive.map(y => y.campaignId).indexOf(z.campaignId);
      //   //                   if (i === -1) listActive.push({ campaignId: z.campaignId, codes: [x] });
      //   //                   else listActive[i].codes.push(x);
      //   //                 }
      //   //               });
      //   //             });
      //   //         }
      //   //       }
      //   //     }
      //   //     return [];
      //   //   }, 0);
      //   //   console.log('findCampaign', vm.current.id, findCampaign);
      //   //   if (times === 8) {
      //   //     clearInterval(loadRelative2);
      //   //   }
      //   // }, 100);
      // } else {
      //   this.$set(this, 'activeShareModel', currentShare);
      // }
      console.log('zoneRelative', this.isRelative());
      let currentShare = this.current.activeShare(false, '');
      // && Object.keys(window.arfZones).length > 1
      if (this.isRelative() && this.$data.pageLoad === null) {
        const isRelative = currentShare.placements.reduce((res, placement) => (res !== true ? placement.relative !== 0 : true), 0);
        console.log('isWait', !isRelative);
        if (isRelative) {
          // this.$set(this, 'activeShareModel', currentShare);
          currentShare.placements.map(placement => { // eslint-disable-line
            const relativeCode = placement.relative;
            if (placement.relative !== 0) {
              const campaignId = placement.campaignId;
              util.setRelative(this.current.id, campaignId, relativeCode);
            }
          });
        }
        const vm = this;
        let times = 0;
        let isSet = false;
        const loadRelative = setInterval(() => {
          times += 1;
          console.log('checkTimes', times);
          const relativePlacement = window.ZoneConnect.relativePlacement;
          if (relativePlacement.length > 0) {
            // const listRelative = currentShare.placements.reduce((res, item) => (Array.isArray(res) ? res.push({ campaignId: item.campaignId, code: item.relative }) : [{ campaignId: item.campaignId, code: item.relative }]), 0);
            // const isRelativeWithOthers = listRelative.reduce((res, item) => {
            //   const result = relativePlacement.filter(itm => itm);
            // }, 0);
            const relativeFilter = relativePlacement.filter(item => (item.zones.indexOf(this.current.id) !== -1 && item.zones.length > 1));
            // const isMoreOnZone = relativeFilter.reduce((res, item) => (res !== true ? item.zones.length > 1 : true), 0);
            // currentShare = vm.current.activeShare(false, '');
            if (relativeFilter.length > 0 && !isSet) {
              console.log('run2Cam1');
              vm.$set(vm, 'activeShareModel', currentShare);
              isSet = true;
              clearInterval(loadRelative);
            }
          } else if (window.ZoneConnect.relativePlacement.length > 0 && !isSet) {
            console.log('run2Cam2');
            const previous = JSON.stringify(currentShare);
            currentShare = vm.current.activeShare(false, '', previous);
            const isRelative2 = currentShare.placements.reduce((res, placement) => (res !== true ? placement.relative !== 0 : true), 0);
            if (isRelative2) {
                currentShare.placements.map(placement => { // eslint-disable-line
                  const relativeCode = placement.relative;
                  if (placement.relative !== 0) {
                    const campaignId = placement.campaignId;
                    util.setRelative(this.current.id, campaignId, relativeCode);
                  }
                });
              if (window.ZoneConnect.relativePlacement.filter(item => item.zones.indexOf(this.current.id) === -1).length > 0 &&
                  window.ZoneConnect.relativePlacement.length > 1) {
                vm.$set(vm, 'activeShareModel', currentShare);
                isSet = true;
                clearInterval(loadRelative);
              }
            }
          }


          if (times >= 8 && !isSet) {
            vm.$set(vm, 'activeShareModel', currentShare);
            isSet = true;
            clearInterval(loadRelative);
          }
        }, 100);
      } else {
        this.$set(this, 'activeShareModel', currentShare);
      }
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
    if (!this.isRelative() || this.$data.pageLoad === null) {
      console.log('runRotateShare', this.current.id);
      /* track zone after 7 seconds for sure zone load completed */
      setTimeout(() => {
        this.setupRotate();
      }, 7000);
    }
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
    // initActiveShareModel: {
    //   cache: true,
    //   get() {
    //     const res = this.current.activeShare(window.ZoneConnect.relativeKeyword, false, '');
    //     this.$data.lastShare = JSON.stringify(res.placements.map(x => x.id));
    //     return res;
    //   },
    // },
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
            console.log(`% Zone Display [${this.current.id}]: ${track.state().percentage * 100}`);
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
    const isMobile = detectDevices.isMobile().any;
    console.log('isMobile', isMobile);
    console.log('currentShare', currentShare);
    try {
      vm.$data.lastShare = currentShare ? JSON.stringify(currentShare) : null;
    } catch (err) {
      // do nothing.
      throw new Error(err);
    }
    if (currentShare && currentShare.placements.length > 0) {
      return (
        <div
          id={vm.current.id}
          class="arf-zone"
          style={{
            width: !isMobile ? `${vm.current.width}px` : '100%',
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
          width: !isMobile ? `${vm.current.width}px` : '100%',
          height: 'auto',
          margin: 'auto',
        }}
      />
    );
  },

});

export default Zone;
