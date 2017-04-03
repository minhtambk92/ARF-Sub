/**
 * Created by manhhailua on 1/4/17.
 */

/* eslint-disable quotes */

const env = (location.search.indexOf('corejs_env=dev') !== -1) ? '' : '.min';
const script = document.createElement('script');
script.id = 'arf-core-js';
script.type = 'text/javascript';
script.src = `//{{arfHost}}/build/Arf${env}.js`;

// Async load core-js script
if (!document.getElementById(script.id)) {
  document.getElementsByTagName('body')[0].appendChild(script);
}

// Init arfZonesQueue if not existed
window.arfZonesQueue = window.arfZonesQueue || [];

// Push current zone to arfZonesQueue
// In production mode, webpack will force double quotes for string
window.arfZonesQueue.push({
  el: document.getElementById("{{zoneId}}"),
  propsData: {
    model: "{{zoneDataObject}}",
  },
});
