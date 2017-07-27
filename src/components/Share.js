/**
 * Created by Manhhailua on 12/5/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
import { Share as ShareModel } from '../models';
import { Placement } from '../components';
import { dom } from '../mixins';
import { util } from '../vendor';

const Share = Vue.component('share', {

  props: {
    model: {
      type: Object,
    },
  },

  mixins: [dom],

  created() {
    // Init global container object
    window.arfShares = window.arfShares || {};
    window.arfShares[this.current.id] = this;
  },

  beforeMount() {
    if (this.current.preview === true) {
      try {
        this.current.placements.map(item => item.preview = true); // eslint-disable-line
      } catch (err) {
        throw new Error(err);
      }
    } else {
      this.$on('relativeKeywordsInPlacement', (campaignId, relativeCode, keywords) => {
        console.log('relativeKeywordsInPlacement', relativeCode, keywords, this.current.zoneId);
        if (relativeCode !== 0) util.setRelative(this.current.zoneId, campaignId, relativeCode);
      });
    }
  },

  mounted() {
    // this.$on('PlaceHeight', (PlaceHeight) => {
    //   let count = 0;
    //   let height = 0;
    //   height += PlaceHeight;
    //   count += 1;
    //   if (count === this.current.allPlacements.length) {
    //     document.getElementById(`${this.current.id}`).style.height = `${height}px`;
    //     this.$parent.$emit('shareHeight', height);
    //   }
    // });
    if (this.current.preview !== true) {
      this.$parent.$emit('shareRender', this.current.currentCampaignLoad);
      this.$on('render', (placeID, revenueType) => {
        console.log('testEmit', placeID, revenueType);
        const placeIndex = this.activePlacementsModels.reduce((acc, item, index) => {
          if (item.id === placeID) {
            return index;
          }
          return acc;
        }, 0);
        this.$parent.$emit('placementRendered', placeIndex, revenueType, placeID);
      });
    }
  },

  computed: {
    current() {
      const shareModel = (this.model instanceof ShareModel) ?
        this.model : new ShareModel(this.model);
      return shareModel;
    },

    activePlacementsModels() {
      return this.current.activePlacements();
    },
  },

  render(h) { // eslint-disable-line no-unused-vars
    const vm = this;
    const activePlacements = vm.activePlacementsModels;
    if (activePlacements.length > 0) {
      return (
        <div
          id={vm.current.id}
          class="arf-share"
        >
          {vm.activePlacementsModels.map(placement => (
            <Placement model={placement} />
          ))}
        </div>
      );
    }
    return (
      <div
        id={vm.current.id}
        class="arf-share"
      />
    );
  },

});

export default Share;
