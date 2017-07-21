/**
 * Created by Manhhailua on 12/5/16.
 */

/* eslint-disable import/no-extraneous-dependencies */

import Vue from 'vue';
import { Share as ShareModel } from '../models';
import { Placement } from '../components';
import { dom } from '../mixins';

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
    this.$on('relativeKeywordsInPlacement', (campaignId, relativeCode, keywords) => {
      console.log('relativeKeywordsInPlacement', relativeCode, keywords);
      const isExistCampaignId = window.ZoneConnect.relativePlacement.reduce((acc, item, index) => {
        if (index === 0) {
          return item.campaignId === campaignId;
        }
        return acc || item.campaignId === campaignId;
      }, 0);
      if (!isExistCampaignId && relativeCode !== 0) {
        window.ZoneConnect.relativePlacement.push({ campaignId, relativeCodes: [relativeCode] });
      } else {
        const indexOfCampaign = window.ZoneConnect.relativePlacement.map(x => x.campaignId).indexOf(campaignId);
        const relativeCodes = window.ZoneConnect.relativePlacement[indexOfCampaign].relativeCodes;
        const isExistRelativeCodes = relativeCodes.indexOf(relativeCode) !== -1;
        if (!isExistRelativeCodes) relativeCodes.push(relativeCodes);
        window.ZoneConnect.relativePlacement[indexOfCampaign].relativeCodes = relativeCodes;
      }
    });
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
