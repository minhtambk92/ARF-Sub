/**
 * Created by tamleminh on 14/06/2017.
 */

import Vue from 'vue';

const trackView = Vue.mixin({
  beforeCreate() {
    console.log('trackView');
  },
});

export default trackView;
