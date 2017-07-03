/**
 * Created by Manhhailua on 11/24/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
import { Placement as PlacementModel } from '../models';
import { Banner } from '../components';
import { dom } from '../mixins';

const Placement = Vue.component('placement', {

  props: {
    model: {
      type: Object,
    },
  },

  mixins: [dom],

  created() {
    // Init global container object
    window.arfPlacements = window.arfPlacements || {};
    window.arfPlacements[this.current.id] = this;
  },

  data() {
    return {
      lastBanner: null,
      activeBannerModel: null,
    };
  },

  beforeMount() {
    const currentBanner = this.current.activeBanner(false, '');
    this.$set(this, 'activeBannerModel', currentBanner);
  },

  mounted() {
    // this.$on('bannerHeight', (bannerHeight) => {
    //   document.getElementById(`${this.current.id}`).style.height = `${bannerHeight}px`;
    //   this.$parent.$emit('PlaceHeight', bannerHeight);
    // });

    // const conditional = (this.current.isRotate && this.current.filterBanner().length > 1);
    // if (conditional) {
    //   const rotateBanner = setInterval(() => {
    //     if (!conditional) clearInterval(rotateBanner);
    //     this.$set(this, 'activeBannerModel', this.current.activeBanner(conditional, this.$data.lastBanner));
    //     this.$forceUpdate();
    //   }, 5000);
    // }
    setTimeout(() => {
      this.setupRotate();
    }, 1000);
    this.$on('renderFinish', () => {
      console.log('renderFinish');
      // make a trigger to parent component(share) and send place;
      this.$parent.$emit('render', this.current.id, this.current.revenueType);
    });
  },

  computed: {
    current() {
      return (this.model instanceof PlacementModel) ? this.model : new PlacementModel(this.model);
    },
  },

  methods: {
    // activeBannerModel(lastBanner) {
    //   console.log('lastBanner', lastBanner);
    //   return this.current.activeBanner();
    // },
    setupRotate() {
      const conditional = (this.current.isRotate && this.current.filterBanner().length > 1);
      console.log('conditional', this.current.filterBanner().length);
      if (conditional) {
        const placement = document.getElementById(this.current.id);
        const objMonitor = ViewTracking(placement);
        const monitor = ViewTracking.VisMon.Builder(objMonitor);
        let isTrack = false;
        let isRotate = null;
        // throttle -> update time
        monitor
          .strategy(new ViewTracking.VisMon.Strategy.EventStrategy({ throttle: 200 }))
          .on('update', (track) => {
            console.log('testUpdatePlacement');
            /*  at least 80% -> setup rotate  */
            if (track.state().percentage >= 0.8 && isTrack === false) {
              isTrack = true;
              const aaa = ViewTracking(placement);
              aaa.onPercentageTimeTestPassed(() => {
                if (isRotate === null) {
                  isRotate = setInterval(() => {
                    this.$set(this, 'activeBannerModel', this.current.activeBanner(conditional, this.$data.lastBanner));
                    this.$forceUpdate();
                  }, 3000);
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
      }
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;
    const dev = location.search.indexOf('checkPlace=dev') !== -1;
    const currentBanner = this.current.isRotateFromShare ? this.$set(this, 'activeBannerModel', this.current.activeBanner(true, null)) : this.activeBannerModel;
    vm.$data.lastBanner = currentBanner.id;
    // currentBanner.isRotate = vm.current.isRotate || vm.$data.isRotateBanner;
    console.log('currentBanner', currentBanner);
    if (dev) {
      if (currentBanner !== false) {
        return (
          <div
            id={vm.current.id}
            class="arf-placement"
            style={{
              width: `${vm.current.width}px`,
              height: `${vm.current.height}px`,
            }}
          >
            <Banner model={currentBanner} />
            <div
              style={{
                zIndex: 9999,
                margin: 'auto',
                position: 'relative',
                color: 'red',
                paddingTop: '5px',
                // backgroundColor: 'yellow',
                // opacity: 0.5,
                width: `${vm.current.width}px`,
                height: `${vm.current.height}px`,
              }}
            ><p
              style={{
                backgroundColor: 'black',
                color: 'white',
                fontSize: '15pt',
                width: '35%',
                textAlign: 'center',
              }}
            >{vm.current.revenueType} {vm.current.positionOnShare}</p></div>
          </div>
        );
      }
      return (
        <div
          id={vm.current.id}
          class="arf-placement"
          style={{
            width: `${vm.current.width}px`,
            height: `${vm.current.height}px`,
          }}
        >
          <div
            style={{
              zIndex: 9999,
              margin: 'auto',
              position: 'relative',
              color: 'red',
              paddingTop: '5px',
              // backgroundColor: 'yellow',
              // opacity: 0.5,
              width: `${vm.current.width}px`,
              height: `${vm.current.height}px`,
            }}
          ><p
            style={{
              backgroundColor: 'black',
              color: 'white',
              fontSize: '15pt',
              width: '35%',
              textAlign: 'center',
            }}
          >{vm.current.revenueType}</p></div>
        </div>
      );
    }
    if (currentBanner !== false) {
      return (
        <div
          id={vm.current.id}
          class="arf-placement"
          style={{
            width: `${vm.current.width}px`,
            // height: `${vm.current.height}px`,
          }}
        >
          <Banner model={currentBanner} />
        </div>
      );
    }
    return (
      <div
        id={vm.current.id}
        class="arf-placement"
      />
    );
  },

});

export default Placement;
