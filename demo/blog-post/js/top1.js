/*!
 * Advertisement data
 * Template file v0.8.1
 * Copyright 2016-2017 Manhhailua
 * Zone: c86f5c79-70d7-45a7-aecd-077dc9a373c0
 */
!(function (e) {
  function t(r) {
    if (n[r]) return n[r].exports;
    const o = n[r] = {
      i: r,
      l: !1,
      exports: {},
    };
    return e[r].call(o.exports, o, o.exports, t), o.l = !0, o.exports;
  }
  var n = {};
  t.m = e, t.c = n, t.i = function (e) {
    return e;
  }, t.d = function (e, n, r) {
    t.o(e, n) || Object.defineProperty(e, n, {
      configurable: !1,
      enumerable: !0,
      get: r,
    });
  }, t.n = function (e) {
    const n = e && e.__esModule ? function () {
      return e.default;
    } : function () {
      return e;
    };
    return t.d(n, 'a', n), n;
  }, t.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }, t.p = '', t(t.s = 0);
}([function (e, t, n) {
  let r = location.search.indexOf('corejs_env=dev') !== -1 ? '' : '.min',
    o = document.createElement('script');
  o.id = 'arf-core-js', o.type = 'application/javascript', o.src = `//localhost:63342/ARF-Sub/build/Arf${r}.js`, document.getElementById(o.id) || document.getElementsByTagName('body')[0].appendChild(o), window.arfZonesQueue = window.arfZonesQueue || [], window.arfZonesQueue.push({
    el: document.getElementById('c86f5c79-70d7-45a7-aecd-077dc9a373c0'),
    propsData: {
      model: {
        id: 'c86f5c79-70d7-45a7-aecd-077dc9a373c0',
        name: 'Zone Test 3',
        description: 'abc',
        css: 'css',
        height: 600,
        width: 300,
        targetIFrame: '0',
        isShowBannerAgain: true,
        source: '',
        isShowCampaignAgain: true,
        isShowTextBanner: false,
        isCustomSize: true,
        supportThirdParty: '0',
        isIncludeDescription: true,
        status: 'active',
        createdAt: '2017-07-17T17:17:33.000Z',
        updatedAt: '2017-07-17T17:17:33.000Z',
        deletedAt: null,
        siteId: 'a7a821b7-9b08-414d-b903-d6328c8b3642',
        zoneTypeId: 'bbdafc59-1c45-4145-b39e-f9760627d954',
        zoneSizeTypeId: null,
        characterSetId: null,
        shares: [{
          id: '0ee519fe-b2f0-45cf-87f5-e7a5a22271f7',
          name: 'Share single ',
          css: '',
          outputCss: '',
          width: 300,
          height: 600,
          classes: '',
          isRotate: false,
          type: 'single',
          format: '',
          description: 'single',
          createdAt: '2017-07-17T17:20:33.000Z',
          updatedAt: '2017-07-17T17:20:33.000Z',
          deletedAt: null,
          zoneId: 'c86f5c79-70d7-45a7-aecd-077dc9a373c0',
          sharePlacements: [],
        }, {
          id: '1f10f65f-5100-4351-8676-c198522eca6a',
          name: 'Share Multi',
          css: '',
          outputCss: '',
          width: 300,
          height: 600,
          classes: '',
          isRotate: false,
          type: 'multiple',
          format: '1,1',
          description: 'multi',
          createdAt: '2017-07-17T17:22:00.000Z',
          updatedAt: '2017-07-17T17:22:00.000Z',
          deletedAt: null,
          zoneId: 'c86f5c79-70d7-45a7-aecd-077dc9a373c0',
          sharePlacements: [],
        }],
        site: {
          id: 'a7a821b7-9b08-414d-b903-d6328c8b3642',
          domain: 'http://dulich.tuoitre.vn',
          name: 'du lá»‹ch tuá»•i tráº»',
          email: 'dulichtuoitre@gmail.com',
          description: '',
          status: 'active',
          createdAt: '2017-06-21T04:38:27.000Z',
          updatedAt: '2017-06-23T08:41:55.000Z',
          deletedAt: null,
          globalFilters: [],
        },
      },
    },
  });
}]));
// # sourceMappingURL=Template.min.js.map
