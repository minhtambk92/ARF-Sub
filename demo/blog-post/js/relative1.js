/*!
 * Advertisement data
 * Template file v0.8.1
 * Copyright 2016-2017 Manhhailua
 * Zone: 7e989e7b-c93d-426d-b743-c5a68d668bdf
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
    el: document.getElementById('7e989e7b-c93d-426d-b743-c5a68d668bdf'),
    propsData: {
      model: {
        id: '7e989e7b-c93d-426d-b743-c5a68d668bdf',
        name: 'Zone Test 2',
        description: 'Test 2',
        css: 'css',
        height: 90,
        width: 980,
        targetIFrame: '0',
        isShowBannerAgain: true,
        source: '',
        isShowCampaignAgain: true,
        isShowTextBanner: false,
        isCustomSize: true,
        supportThirdParty: '0',
        isIncludeDescription: true,
        status: 'active',
        createdAt: '2017-07-04T02:52:14.000Z',
        updatedAt: '2017-07-04T02:53:03.000Z',
        deletedAt: null,
        siteId: 'a7a821b7-9b08-414d-b903-d6328c8b3642',
        zoneTypeId: 'bbdafc59-1c45-4145-b39e-f9760627d954',
        zoneSizeTypeId: null,
        characterSetId: null,
        shares: [{
          id: '39d0e309-4068-4041-be48-2e5d406c5cd7',
          name: 'Share 1',
          css: '',
          outputCss: '',
          width: 980,
          height: 90,
          classes: '',
          isRotate: false,
          type: 'single',
          format: '',
          description: '',
          createdAt: '2017-07-04T02:59:35.000Z',
          updatedAt: '2017-07-04T02:59:35.000Z',
          deletedAt: null,
          zoneId: '7e989e7b-c93d-426d-b743-c5a68d668bdf',
          sharePlacements: [{
            id: 'c5ae1762-baf3-4318-87d9-a7baba26c730',
            positionOnShare: 0,
            deletedAt: null,
            createdAt: '2017-07-04T03:02:43.000Z',
            updatedAt: '2017-07-04T03:02:43.000Z',
            placementId: '5cdbc68a-71c0-4f32-bb4d-ab10a483ad86',
            shareId: '39d0e309-4068-4041-be48-2e5d406c5cd7',
            placement: {
              id: '5cdbc68a-71c0-4f32-bb4d-ab10a483ad86',
              name: 'Placement top 980 * 90',
              description: '',
              width: 980,
              height: 90,
              weight: 100,
              isRotate: false,
              price: 123,
              startTime: '2017-07-03T17:00:00.000Z',
              revenueType: 'cpm',
              cpdPercent: 0,
              relative: 1,
              endTime: null,
              status: 'active',
              createdAt: '2017-07-04T03:02:38.000Z',
              updatedAt: '2017-07-04T03:16:58.000Z',
              deletedAt: null,
              campaignId: 'a8c44e3a-3ee6-49dc-ad93-350cd726b3c1',
              banners: [{
                id: 'cbf1da4a-963c-4dab-b66a-56ecb3ab2cb6',
                name: 'banner test 980 x 90',
                html: '<img src="http://www.swimbikerun.ph/wp-content/uploads/2015/07/FA-EnActiv-Web-Banner-980-x-90.png" width="980" height="90">',
                width: 980,
                height: 90,
                keyword: 'testRelative',
                weight: 1,
                description: 'abcccc',
                imageUrl: '',
                url: '',
                target: '',
                isIFrame: false,
                isCountView: true,
                isFixIE: false,
                isDefault: false,
                isRelative: false,
                adStore: '',
                impressionsBooked: -1,
                clicksBooked: -1,
                activationDate: '2017-07-03T17:00:00.000Z',
                expirationDate: null,
                status: 'active',
                createdAt: '2017-07-04T03:06:37.000Z',
                updatedAt: '2017-07-04T03:18:07.000Z',
                deletedAt: null,
                placementId: '5cdbc68a-71c0-4f32-bb4d-ab10a483ad86',
                bannerHtmlTypeId: 'd2ac74ae-e9e4-4518-b68a-d5e45e19c2dd',
                bannerTypeId: '374da180-02c6-4558-8985-90cad792f14f',
                adsServerId: '8c154646-8327-47e9-aeac-2efc32862536',
                optionBanners: [],
                bannerType: {
                  id: '374da180-02c6-4558-8985-90cad792f14f',
                  name: 'Script',
                  value: 'script',
                  isUpload: false,
                  userId: null,
                  status: 'active',
                  createdAt: '2017-04-18T09:57:18.000Z',
                  updatedAt: '2017-04-18T09:57:18.000Z',
                  deletedAt: null,
                },
                bannerHtmlType: {
                  id: 'd2ac74ae-e9e4-4518-b68a-d5e45e19c2dd',
                  name: 'CPM 7K Code hoáº·c Banner CPM BÃ¡m biÃªn pháº£i',
                  value: 'cpm-7k-code-hoac-banner-cpm-bam-bien-phai',
                  weight: 8,
                  userId: null,
                  status: 'active',
                  createdAt: '2017-01-09T08:48:59.000Z',
                  updatedAt: '2017-01-09T08:52:36.000Z',
                  deletedAt: null,
                },
              }],
              campaign: {
                id: 'a8c44e3a-3ee6-49dc-ad93-350cd726b3c1',
                name: 'CPM - Du Lich Tuá»•i Tráº»',
                startTime: '2017-06-20T17:00:00.000Z',
                endTime: null,
                views: 10000,
                viewPerSession: 10,
                timeResetViewCount: 24,
                weight: 1,
                description: '',
                revenueType: 'cpm',
                expireValueCPM: 1000,
                maxCPMPerDay: 1000,
                status: 'active',
                createdAt: '2017-06-21T04:37:10.000Z',
                updatedAt: '2017-06-21T04:37:10.000Z',
                deletedAt: null,
                advertiserId: '90696765-60de-42de-a67d-d6b8c40d79e5',
              },
            },
          }],
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
