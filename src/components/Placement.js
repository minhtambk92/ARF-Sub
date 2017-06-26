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

  mounted() {
    // this.$on('bannerHeight', (bannerHeight) => {
    //   document.getElementById(`${this.current.id}`).style.height = `${bannerHeight}px`;
    //   this.$parent.$emit('PlaceHeight', bannerHeight);
    // });
    this.$on('renderFinish', () => {
      console.log('renderFinish');
      // make a trigger to parent component(share) and send place;
      this.$parent.$emit('render', this.current.id, this.current.revenueType);
    });
    // setInterval(() => {
    //   this.$forceUpdate();
    // }, 3000);
  },

  computed: {
    current() {
      return (this.model instanceof PlacementModel) ? this.model : new PlacementModel(this.model);
    },
  },

  methods: {
    activeBannerModel() {
      return this.current.activeBanner();
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;
    const dev = location.search.indexOf('checkPlace=dev') !== -1;
    const currentBanner = vm.activeBannerModel();
    console.log('currentBanner', currentBanner);
    if (dev) {
      if (vm.activeBannerModel() !== false) {
        return (
          <div
            id={vm.current.id}
            class="arf-placement"
            style={{
              width: `${vm.current.width}px`,
              height: `${vm.current.height}px`,
            }}
          >
            <Banner model={vm.activeBannerModel()} />
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
