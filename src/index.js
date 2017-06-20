/**
 * Created by Manhhailua on 11/23/16.
 */

import Vue from 'vue';
import {
  Zone,
  Share,
  Placement,
  Banner,
} from './components';

// These code run only on client side
if (typeof window !== 'undefined' && window.document) {
  // load tracking -> this provide location
  // const trackingJs = document.getElementById('adm-tracking');
  // if (trackingJs == null) {
  //   const b = document.createElement('script');
  //   b.id = 'adm-tracking';
  //   b.type = 'text/javascript';
  //   b.async = !0;
  //   b.src = '//media1.admicro.vn/core/adm_tracking.js?id=1';
  //   const c = document.getElementsByTagName('script')[0];
  //   c.parentNode.insertBefore(b, c);
  // }
  /**
   * Init queues
   * @type {Array}
   */
  window.arfZonesQueue = window.arfZonesQueue || [];
  window.arfBannersQueue = window.arfBannersQueue || [];

  /**
   * Render ads from queue
   * @param queue
   * @param Entity
   */
  const renderEntities = (queue, Entity) => {
    if (
      !(queue instanceof Array) || queue.length === 0 ||
      JSON.stringify(Entity) !== JSON.stringify(Zone) ||
      JSON.stringify(Entity) !== JSON.stringify(Banner)
    ) {
      return;
    }

    while (queue.length > 0) {
      new Entity(queue.shift()); // eslint-disable-line no-new
    }
  };

  /**
   * Create a watcher of global queues
   * Render every zones or banners which pushed to
   * "window.arfBannersQueue" & "window.arfZonesQueue"
   */
  new Vue({ // eslint-disable-line no-new
    data: {
      zonesQueue: window.arfZonesQueue,
      bannersQueue: window.arfBannersQueue,
    },
    // Render once at component created event
    created() {
      renderEntities(this.zonesQueue, Zone);
      renderEntities(this.bannersQueue, Banner);
    },
    // Watch and render every times an entity is pushed to queue
    watch: {
      zonesQueue(value) {
        renderEntities(value, Zone);
      },
      bannersQueue(value) {
        renderEntities(value, Banner);
      },
    },
  });
}

export { Zone, Share, Placement, Banner };
export default { Zone, Share, Placement, Banner };
