/*!
 * Advertisement data
 * Template file v0.8.1
 * Copyright 2016-2017 Manhhailua
 * Zone: db460741-e8a3-42fb-8e53-6db31f2b99a9
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
  t.m = e, t.c = n, t.d = function (e, n, r) {
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
    el: document.getElementById('db460741-e8a3-42fb-8e53-6db31f2b99a9'),
    propsData: {
      model: {
        id: 'db460741-e8a3-42fb-8e53-6db31f2b99a9',
        name: 'Mobile',
        description: 'sdsd',
        css: 'css',
        height: 100,
        width: 300,
        targetIFrame: '0',
        isShowBannerAgain: true,
        source: '',
        isShowCampaignAgain: true,
        isShowTextBanner: false,
        isCustomSize: false,
        supportThirdParty: '0',
        isIncludeDescription: true,
        status: 'active',
        createdAt: '2017-08-21T08:26:53.000Z',
        updatedAt: '2017-08-21T08:26:53.000Z',
        deletedAt: null,
        siteId: 'b757d18b-3f84-4703-951b-52698bc14652',
        zoneTypeId: 'bbdafc59-1c45-4145-b39e-f9760627d954',
        zoneSizeTypeId: '30f30e80-cdbb-4f7c-b2bc-4dd82c7eb7a8',
        characterSetId: null,
        shares: [{
          id: 'a4bfe906-8c6e-4485-913b-22ff19e254cb',
          name: 'Mobile',
          css: '',
          outputCss: '',
          width: 300,
          height: 100,
          classes: '',
          isRotate: false,
          type: 'single',
          format: '',
          description: 'sdsd',
          createdAt: '2017-08-21T08:26:54.000Z',
          updatedAt: '2017-08-21T08:27:43.000Z',
          deletedAt: null,
          zoneId: 'db460741-e8a3-42fb-8e53-6db31f2b99a9',
          sharePlacements: [{
            id: '05656d5f-ac0c-4a50-b4b5-cdd03709ec46',
            positionOnShare: 0,
            deletedAt: null,
            createdAt: '2017-08-21T09:50:51.000Z',
            updatedAt: '2017-08-21T09:50:51.000Z',
            placementId: '94ce2dc1-2588-41af-a026-e737a4cf7345',
            shareId: 'a4bfe906-8c6e-4485-913b-22ff19e254cb',
            placement: {
              id: '94ce2dc1-2588-41af-a026-e737a4cf7345',
              name: 'PlacementMobile',
              description: 'asda',
              width: 312,
              height: 213,
              weight: 12,
              isRotate: false,
              price: 12,
              startTime: '2017-08-20T17:00:00.000Z',
              revenueType: 'cpm',
              cpdPercent: 0,
              relative: 0,
              endTime: null,
              status: 'active',
              createdAt: '2017-08-21T09:50:41.000Z',
              updatedAt: '2017-08-21T09:50:41.000Z',
              deletedAt: null,
              campaignId: '036ba116-6d4f-437b-885f-27678ea310a7',
              banners: [{
                id: 'ab6d7c12-06a3-4347-a603-90fd96cb18b1',
                name: 'BannerMobileTest',
                html: "<script>var _ADM_Channel = '%2fhome%2f';</script>\n<script src=\"http://media1.admicro.vn/ads_codes/mb_box_7249.ads\"></script>",
                width: 600,
                height: 600,
                keyword: '',
                weight: 1,
                description: 'asd',
                imageUrl: '',
                url: '',
                target: '',
                isIFrame: true,
                isCountView: true,
                isFixIE: false,
                isDefault: false,
                isRelative: false,
                adStore: '',
                impressionsBooked: -1,
                clicksBooked: -1,
                activationDate: '2017-08-20T17:00:00.000Z',
                expirationDate: null,
                status: 'active',
                createdAt: '2017-08-21T08:29:00.000Z',
                updatedAt: '2017-08-21T16:59:30.000Z',
                deletedAt: null,
                placementId: '94ce2dc1-2588-41af-a026-e737a4cf7345',
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
                id: '036ba116-6d4f-437b-885f-27678ea310a7',
                name: 'dulich_tuoitre',
                startTime: '2017-08-13T17:00:00.000Z',
                endTime: null,
                views: 1000,
                viewPerSession: 1980,
                timeResetViewCount: 24,
                weight: 1,
                description: '',
                revenueType: 'cpd',
                pageLoad: 0,
                expireValueCPM: 0,
                maxCPMPerDay: 0,
                status: 'active',
                createdAt: '2017-07-18T04:07:39.000Z',
                updatedAt: '2017-08-14T03:26:17.000Z',
                deletedAt: null,
                advertiserId: '5fc5a35d-c12e-4fef-96c4-d2a718dd0738',
              },
            },
          }],
        }],
        site: {
          id: 'b757d18b-3f84-4703-951b-52698bc14652',
          domain: 'http://dulich.tuoitre.vn/',
          name: 'dulich_tuoitre',
          email: 'dulichtuoitre@gmail.com',
          description: '',
          status: 'active',
          createdAt: '2017-07-18T04:12:37.000Z',
          updatedAt: '2017-07-18T04:12:49.000Z',
          deletedAt: null,
          globalFilters: [],
        },
      },
    },
  });
}]));
// # sourceMappingURL=Template.min.js.map
