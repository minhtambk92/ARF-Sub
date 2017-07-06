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
    this.$on('relativeKeywordsInPlacement', (relativeCode, keywords) => {
      console.log('relativeKeywordsInPlacement', relativeCode, keywords);
      const isExistRelativeCode = window.ZoneConnect.relativePlacement.reduce((acc, item, index) => {
        if (index === 0) {
          return item.relativeCode === relativeCode;
        }
        return acc || item.relativeCode === relativeCode;
      }, 0);
      if (!isExistRelativeCode && relativeCode !== 0) window.ZoneConnect.relativePlacement.push({ relativeCode, keywords });
      else {
        const index = window.ZoneConnect.relativePlacement.map(x => x.relativeCode).indexOf(relativeCode);
        let key = window.ZoneConnect.relativePlacement[index].keywords;
        if (key.indexOf(keywords) === -1) key += `${key === '' ? '' : ','}${keywords}`;
        window.ZoneConnect.relativePlacement[index].keywords = key;
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
    console.log('activePlacementsModels', vm.activePlacementsModels);
    return (
      <div
        id={vm.current.id}
        class="arf-share"
        // style={{
        //   width: `${vm.current.width}px`,
        //   height: `${vm.current.height}px`,
        // }}
      >
        {vm.activePlacementsModels.map(placement => (
          <Placement model={placement} />
        ))}
      </div>
    );
  },

});

export default Share;
