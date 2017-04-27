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
  },

  computed: {
    current() {
      return (this.model instanceof PlacementModel) ? this.model : new PlacementModel(this.model);
    },

    activeBannerModel() {
      // console.log('placement is rendered', this.current.id);
      return this.current.activeBanner();
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;
    // make a trigger to parent component(share) and send place;
    this.$parent.$emit('render', this.current.id, this.current.revenueType);
    return (
      <div
        id={vm.current.id}
        class="arf-placement"
        style={{
          width: `${vm.current.width}px`,
          height: `${vm.current.height}px`,
        }}
      >
        <Banner model={vm.activeBannerModel} />
        <div
          style={{
            zIndex: 9999,
          }}
        ><p>{vm.current.revenueType}</p></div>
      </div>
    );
  },

});

export default Placement;
