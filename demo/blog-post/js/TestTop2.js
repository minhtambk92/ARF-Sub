/**
 * Created by tamleminh on 13/06/2017.
 */
/*!
 * Advertisement data
 * Template file v0.8.1
 * Copyright 2016-2017 Manhhailua
 * Zone: f5f832bd-fe91-4191-b2de-e729daf345c9
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
    el: document.getElementById('f5f832bd-fe91-4191-b2de-e729daf345c9'),
    propsData: {
      model: {
        id: 'f5f832bd-fe91-4191-b2de-e729daf345c9',
        name: 'Zone Top 980x90',
        description: 'Zone Top Xa Hoi 980x90',
        css: '',
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
        createdAt: '2017-04-24T04:58:03.000Z',
        updatedAt: '2017-06-13T07:55:16.000Z',
        deletedAt: null,
        siteId: 'e047f76d-70ce-4d89-ba1d-2ce6584069ef',
        zoneTypeId: 'bbdafc59-1c45-4145-b39e-f9760627d954',
        zoneSizeTypeId: null,
        characterSetId: null,
        shares: [{
          id: '47331aa1-21b6-411c-8797-00645468aa62',
          name: 'Zone Top  980x90 Single',
          css: '.arf-placement {\nmargin: auto;\n}',
          outputCss: '#share-e7a63f32-c24a-491e-bc63-c7451cfc490a .arf-placement {\n  margin: auto;\n}\n',
          width: 980,
          height: 90,
          classes: '',
          isRotate: false,
          type: 'single',
          description: 'Zone Top Xa Hoi 980x90',
          createdAt: '2017-04-24T04:58:03.000Z',
          updatedAt: '2017-06-13T07:50:43.000Z',
          deletedAt: null,
          zoneId: 'f5f832bd-fe91-4191-b2de-e729daf345c9',
          placements: [{
            id: '3262cfd8-b858-43bf-8fa0-cbe2f1d16906',
            name: 'Placement-cpd-980x90-home',
            description: '',
            width: 980,
            height: 90,
            weight: 1,
            isRotate: false,
            price: 1000,
            startTime: '2017-06-11T17:00:00.000Z',
            revenueType: 'cpd',
            cpdPercent: 33,
            relative: 0,
            positionOnShare: 0,
            endTime: null,
            status: 'active',
            createdAt: '2017-06-12T08:59:56.000Z',
            updatedAt: '2017-06-12T08:59:56.000Z',
            deletedAt: null,
            campaignId: 'f74adf5b-cd01-4dc4-84b3-07fa5ec7a5c1',
            SharePlacement: {
              status: 'active',
              createdAt: '2017-06-13T07:50:43.000Z',
              updatedAt: '2017-06-13T07:50:43.000Z',
              deletedAt: null,
              shareId: 'e7a63f32-c24a-491e-bc63-c7451cfc490a',
              placementId: '3262cfd8-b858-43bf-8fa0-cbe2f1d16906',
            },
            banners: [{
              id: 'a683efec-4601-4a5c-be9a-9da0ee835037',
              name: 'Banner-980x90-home-1',
              html: '<div id="" style="position:relative;width:980px; height:90px;">\n<img src="//adi.admicro.vn/adt/banners/nam2015/148/cmsadsbeta/980x90.jpg" />\n<div style="color:#fff;font:bold 38px/90px arial,tahoma; text-shadow: 3px 3px #f00; text-align:center; display:block; position:absolute; top:0; left:0;width:100%; height:90px; " >Box 980x90</div>\n</div>',
              width: 980,
              height: 90,
              keyword: '',
              weight: 1,
              description: '',
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
              activationDate: '2017-06-11T17:00:00.000Z',
              expirationDate: null,
              status: 'active',
              createdAt: '2017-06-12T09:01:02.000Z',
              updatedAt: '2017-06-13T07:56:40.000Z',
              deletedAt: null,
              placementId: '3262cfd8-b858-43bf-8fa0-cbe2f1d16906',
              bannerHtmlTypeId: 'f7aace90-c849-45b2-8d8c-cb23e0f6f051',
              bannerTypeId: '374da180-02c6-4558-8985-90cad792f14f',
              adsServerId: '8c154646-8327-47e9-aeac-2efc32862536',
              channelId: 'd249ced3-b749-4b27-a45a-2be82147a548',
              channel: {
                id: 'd249ced3-b749-4b27-a45a-2be82147a548',
                name: 'dantri-home',
                description: 'Dantri-trang chá»§',
                status: 'active',
                createdAt: '2016-12-24T04:58:26.000Z',
                updatedAt: '2017-06-09T07:53:39.000Z',
                deletedAt: null,
                siteId: 'e047f76d-70ce-4d89-ba1d-2ce6584069ef',
                options: [{
                  id: '4c07323f-4516-432c-8acd-addc9ed0ca7d',
                  name: 'dantri-trang chá»§',
                  logical: 'or',
                  globalVariables: '_ADM_Channel',
                  comparison: '=~',
                  value: '/home/',
                  createdAt: '2017-06-09T07:41:05.000Z',
                  updatedAt: '2017-06-09T07:58:59.000Z',
                  deletedAt: null,
                  channelId: 'd249ced3-b749-4b27-a45a-2be82147a548',
                  optionChannelTypeId: '334288f0-8a58-4372-b262-2fba4fffabf9',
                  optionChannelType: {
                    id: '334288f0-8a58-4372-b262-2fba4fffabf9',
                    name: 'Variable',
                    isInputLink: false,
                    isSelectOption: false,
                    isVariable: true,
                    isMultiSelect: false,
                    userId: null,
                    status: 'active',
                    createdAt: '2017-01-19T07:53:31.000Z',
                    updatedAt: '2017-01-19T07:53:31.000Z',
                    deletedAt: null,
                    optionChannelValues: [],
                  },
                }, {
                  id: 'f9e8ce0a-68f3-46a9-b959-cd1145a991ce',
                  name: 'Site Page-URL',
                  logical: 'or',
                  globalVariables: '',
                  comparison: '==',
                  value: 'http://dantri.com.vn/',
                  createdAt: '2017-06-09T07:43:53.000Z',
                  updatedAt: '2017-06-09T07:43:53.000Z',
                  deletedAt: null,
                  channelId: 'd249ced3-b749-4b27-a45a-2be82147a548',
                  optionChannelTypeId: '3b8cc1bc-aff2-436f-9829-4e4088a6fc7e',
                  optionChannelType: {
                    id: '3b8cc1bc-aff2-436f-9829-4e4088a6fc7e',
                    name: 'Site Page-URL',
                    isInputLink: true,
                    isSelectOption: false,
                    isVariable: false,
                    isMultiSelect: false,
                    userId: null,
                    status: 'active',
                    createdAt: '2017-01-19T07:49:59.000Z',
                    updatedAt: '2017-01-19T07:49:59.000Z',
                    deletedAt: null,
                    optionChannelValues: [],
                  },
                }],
              },
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
                id: 'f7aace90-c849-45b2-8d8c-cb23e0f6f051',
                name: 'Generic HTML',
                value: 'generic-html',
                weight: 0,
                userId: null,
                status: 'active',
                createdAt: '2017-01-09T00:15:40.000Z',
                updatedAt: '2017-01-09T00:15:40.000Z',
                deletedAt: null,
              },
            }],
            campaign: {
              id: 'f74adf5b-cd01-4dc4-84b3-07fa5ec7a5c1',
              name: 'PR-test',
              startTime: '2017-06-11T17:00:00.000Z',
              endTime: null,
              views: 1000,
              viewPerSession: 10,
              timeResetViewCount: 24,
              weight: 1,
              description: '',
              revenueType: 'tenancy',
              expireValueCPM: 0,
              maxCPMPerDay: 0,
              status: 'active',
              createdAt: '2017-06-12T08:35:10.000Z',
              updatedAt: '2017-06-12T08:35:10.000Z',
              deletedAt: null,
              advertiserId: 'c7822598-6887-4def-9ac1-eaf8186d8ad4',
            },
          }],
        }],
        site: {
          id: 'e047f76d-70ce-4d89-ba1d-2ce6584069ef',
          domain: 'http://dantri.com.vn',
          name: 'Dan Tri',
          email: 'contact@dantri.com.vn',
          description: 'ÄÆ¡n vá»‹ Ä‘á»‘i tÃ¡c cá»§a admicro',
          status: 'active',
          createdAt: '2016-12-24T04:58:25.000Z',
          updatedAt: '2016-12-24T04:58:25.000Z',
          deletedAt: null,
          globalFilters: [],
        },
      },
    },
  });
}]));
// # sourceMappingURL=Template.min.js.map
