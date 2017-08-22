/**
 * Created by Manhhailua on 11/25/16.
 */

import Entity from './Entity';
import Share from './Share';
import Placement from './Placement';
import { util, adsStorage, term, detectDevices } from '../vendor';

class Zone extends Entity {

  constructor(zone) {
    super(zone);

    this.id = `zone-${zone.id}`;
    this.shares = zone.shares;
    this.globalFilters = zone.site.globalFilters;
  }

  passGlobalFiltersToBanner() {
    try {
      this.shares.map(share => share.sharePlacements.filter(sharePlacement => sharePlacement.placement !== null)
      .map(sharePlacement => sharePlacement.placement.banners
      .map(banner => banner.globalFilters = this.globalFilters))); // eslint-disable-line
    } catch (err) {
      throw new Error(err);
    }
  }

  fixZoneHeight(height) {
    this.height = height;
  }
  /**
   * Get all shares from this zone
   * @returns [Share]
   */
  allShares() {
    return this.shares.map(share => new Share(share));
  }

  pageLoad() {
    const allShare = this.allShares();
    const allSharePlacements = allShare.reduce((acc, item, index) => { // eslint-disable-line
      if (index === 0) {
        return item.allsharePlacements;
      }
      return acc.concat(item.allsharePlacements);
    }, 0);
    const campaignContainPageLoad = allSharePlacements.reduce((result, sharePlacement) => {
      const campaign = sharePlacement.placement.campaign;
      if (campaign.pageLoad !== 0) {
        if (result === 0) {
          // campaign.sharePlacements = [sharePlacement];
          return [campaign];
        }
        const indexOfCampaign = result.map(item => item.id).indexOf(campaign.id);
        if (indexOfCampaign === -1) {
          // campaign.sharePlacements = [sharePlacement];
          result.push(campaign);
          return result;
        }
        // result[indexOfCampaign].sharePlacements.push(sharePlacement);
        return result;
      }
      return result;
    }, 0);
    return campaignContainPageLoad;
  }

  get ZoneArea() {
    return util.convertArea(this.height, this.width);
  }

  get zoneType() {
    if (((this.height >= 257) && (this.width <= 600 && this.width >= 160)) || detectDevices.isMobile().any) {
      return 'right';
    }
    return 'top';
  }

  /**
   * create all share and filter them fit with conditions
   */

  filterShare(isRotate, formatRotate, lastShare) {
    console.log('newUpdate2');
    const relativePlacement = window.ZoneConnect.relativePlacement;
    if (relativePlacement.length > 0) console.log('relativePlacement', relativePlacement);
    console.log('relativePlacement', relativePlacement, this.id);
    /**
     * setup page load
     */
    let pageLoads = this.pageLoad();
    const activePageLoad = (pLs) => {
      const randomNumber = Math.random() * 3;
      const ratio = pLs.reduce((acc, campaignLoad) =>
          (campaignLoad.pageLoad + acc), 0) / 3;
      const result = pLs.reduce((acc, campaignLoad) => {
        const nextRange = acc + (campaignLoad.pageLoad / ratio);

        if (typeof acc === 'object') {
          return acc;
        }

        if (randomNumber >= acc && randomNumber < nextRange) {
          return campaignLoad;
        }

        return nextRange;
      }, 0);
      return result;
    };
    let currentCampaignLoad = null;
    const campaignRichLimit = [];


    if (this.preview !== true && pageLoads !== 0) {
      const currentDomain = encodeURIComponent(util.getThisChannel(term.getCurrentDomain('Site:Pageurl')).slice(0, 2));
      const pageLoadCookie = adsStorage.getStorage('_pls');

      let pageLoadCampaign = adsStorage.subCookie(pageLoadCookie, `${currentDomain}:`, 0);
      // console.log('pageLoadCampaign', pageLoadCampaign);
      if (pageLoadCampaign === '') {
        currentCampaignLoad = activePageLoad(pageLoads).id;
      } else {
        pageLoadCampaign = pageLoadCampaign.slice(pageLoadCampaign.indexOf(':') + 1);
        const lastAllCampaignLoad = pageLoadCampaign.split('|').filter(item => item !== '');
        let nearestCampaignLoad = null;
        // browse lastAllCampaignLoad to get nearestCampaignLoad.
        lastAllCampaignLoad.reverse();
        for (let i = 0, length = lastAllCampaignLoad.length; i < length; i += 1) {
          const cpl = lastAllCampaignLoad[i].split('#');
          if (i === 0) {
            nearestCampaignLoad = cpl[1];
            if (cpl[1] !== 'null' && cpl[1] !== 'undefined') break;
          } else if (cpl[0] === this.id) break;
          else if (cpl[1] !== 'null' && cpl[1] !== 'undefined') {
            nearestCampaignLoad = cpl[1];
            break;
          }
        }
        lastAllCampaignLoad.reverse();
        console.log('testChooseNearest', nearestCampaignLoad, lastAllCampaignLoad);
        if (nearestCampaignLoad === 'undefined' || nearestCampaignLoad === 'null') {
          console.log('pageLoadsTest', pageLoads);
          nearestCampaignLoad = activePageLoad(pageLoads).id;
        }
        console.log('nearestCampaignLoad', nearestCampaignLoad);
        const lastCampaignLoad = lastAllCampaignLoad.filter(item => item.indexOf(this.id) !== -1);
        const lastTwoCampaignLoad = lastCampaignLoad.length > 2 ? lastCampaignLoad.slice(Math.max(lastCampaignLoad.length - 2, 1)) : lastCampaignLoad;

        const isExistNearestPageLoad = pageLoads.reduce((res, item) => (res !== true ? item.id === nearestCampaignLoad : true), 0);
        if (isExistNearestPageLoad) {
          const timesAppearOfNearestCampaignLoad = lastTwoCampaignLoad.reduce((result, item) => {
            if (item.split('#')[1] === nearestCampaignLoad) return (result + 1);
            return result;
          }, 0);
          console.log('timesAppearOfNearestCampaignLoad', timesAppearOfNearestCampaignLoad);
          if (timesAppearOfNearestCampaignLoad === 0) {
            currentCampaignLoad = nearestCampaignLoad;
          } else {
            const percentLoadOfNearest = pageLoads.filter(item => item.id === nearestCampaignLoad)[0].pageLoad;
            console.log('percentLoadOfNearest', percentLoadOfNearest, timesAppearOfNearestCampaignLoad);
            if (timesAppearOfNearestCampaignLoad >= percentLoadOfNearest) {
              pageLoads = pageLoads.filter(item => item.id !== nearestCampaignLoad);
              campaignRichLimit.push(nearestCampaignLoad);
              console.log('pageLoadsAfterFilter', pageLoads);
              currentCampaignLoad = activePageLoad(pageLoads).id;
              currentCampaignLoad = (currentCampaignLoad === undefined ? 'undefined' : currentCampaignLoad);
            } else {
              currentCampaignLoad = nearestCampaignLoad;
            }
          }
        }
        console.log('lastTwoCampaignLoad', lastAllCampaignLoad, lastCampaignLoad, lastTwoCampaignLoad);
      }
      console.log('currentCampaignLoad', this.id, currentCampaignLoad);
    } else {
      currentCampaignLoad = 'none';
    }
    // pageLoadCookie = pageLoadCampaign === '' ? `${pageLoadCookie};${currentDomain}:;` : pageLoadCookie;
    // pageLoadCampaign = adsStorage.subCookie(pageLoadCookie, `${currentDomain}:`, 0);
    // console.log('currentCampaignLoad', activePageLoad(pageLoads).id);
    // const pageLoadCookieUpdate = `${pageLoadCookie}|${activePageLoad(pageLoads).id}`;
    // adsStorage.setStorage('_pls', pageLoadCookieUpdate, '', '/', currentDomain);

    console.log('pageLoad', pageLoads);

    /**
     * end setup page load
     */

    /**
     * [region: create Share construct]
     *
     */
    let allShare = this.allShares();
    allShare = allShare.filter(item => item.allsharePlacements.length > 0);
    if (allShare.length === 0) return [];
    let allSharePlaces = allShare.reduce((acc, item, index) => { // eslint-disable-line
      if (index === 0) {
        return item.allsharePlacements;
      }
      return acc.concat(item.allsharePlacements);
    }, 0);
                    /* filter place fit with current channel */
    let allSharePlaceInCurrentChannel = allSharePlaces.filter(place => this.preview === true || place.placement.filterBanner().length > 0);

    const allSharePlaceInPageLoadAndChannel = allSharePlaceInCurrentChannel.filter(item => ((currentCampaignLoad !== '' && currentCampaignLoad !== 'none' && currentCampaignLoad !== 'undefined') ? item.placement.campaignId === currentCampaignLoad : true));

    if (allSharePlaceInPageLoadAndChannel.length > 0) allSharePlaceInCurrentChannel = allSharePlaceInPageLoadAndChannel;

    const allSharePlaceFilterGlobal = allSharePlaces.filter(place => this.preview === true || place.placement.filterBannerGlobal().length > 0);
    // allSharePlace.reduce((acc, item) => { // eslint-disable-line
    //   if (item.positionOnShare !== 0)
    // item.positionOnShare = item.positionOnShare - 1; // eslint-disable-line
    // }, 0);


          /* This function to get placement have smallest area */
    const getMinPlace = (allSharePlacement) => {
      if (this.zoneType === 'right') {
        let min = allSharePlacement[0].placement.height;
        for (let i = 0, length = allSharePlacement.length; i < length; i += 1) {
          if (allSharePlacement[i].placement.height < min) {
            min = allSharePlacement[i].placement.height;
          }
        }
        return min;
      }
      let min = allSharePlacement[0].placement.width;
      for (let i = 0, length = allSharePlacement.length; i < length; i += 1) {
        if (allSharePlacement[i].placement.width < min) {
          min = allSharePlacement[i].placement.width;
        }
      }
      return min;
    };

    const minPlace = getMinPlace(allSharePlaces);

    console.log('minPlace', minPlace);

          /* This function to get number of part which take in zone like placement,.. */
    const getNumberOfParts = (height, isRoundUp) => {
      if (this.zoneType === 'right') {
        if (height % minPlace > 0 && isRoundUp) {
          return Math.round(height / minPlace) + 1;
        }
        return Math.round(height / minPlace);
      }
      if (((height / minPlace) % 1) > 0.1 && isRoundUp) {
        return Math.round(height / minPlace) + 1;
      }
      return Math.round(height / minPlace);
    };

    const numberOfPlaceInShare = this.zoneType === 'right' ? getNumberOfParts(this.height) : getNumberOfParts(this.width);

    const shareConstruct = [];


        /* if cpdShare take all share percent in a place order -> filter */
    const shareStructure = [];
    console.log('allSharePlaces', allSharePlaces, allSharePlaceInCurrentChannel);
    const listPositionOnShare = allSharePlaceInCurrentChannel.map(x => (x.positionOnShare === 0 ? 1 : x.positionOnShare));

    const countPositionOnShare = util.uniqueItem(listPositionOnShare).length;
    console.log('countPositionOnShare', countPositionOnShare, listPositionOnShare);

    for (let i = 0; i < countPositionOnShare; i += 1) {
      const allSharePlaceInThisPosition = allSharePlaceInCurrentChannel.filter(place =>
      (place.positionOnShare === 0 ? place.positionOnShare : place.positionOnShare - 1) === i);
      console.log('allSharePlaceInThisPosition', allSharePlaceInThisPosition, allSharePlaceInCurrentChannel);

      const allPlaceTypeInPosition = [];

      allSharePlaceInThisPosition.reduce((acc, item) => { //eslint-disable-line
        const type = item.placement.revenueType;
        if (JSON.stringify(allPlaceTypeInPosition).indexOf(type) !== -1 || type === 'pb') return acc;
        allPlaceTypeInPosition.push(type);
      }, 0);

      console.log('allPlaceTypeInPosition', allPlaceTypeInPosition);
      const getAllPlaceType = [];
      const isExistPlacePa = allPlaceTypeInPosition.indexOf('pa') !== -1;
      allSharePlaceInThisPosition.reduce((acc, item) => {
        const type = item.placement.revenueType;
        if (type === 'pb') return acc;
        let weight = 0;
        if (type === 'pa') weight = 100;
        else {
          const cpdWeight = allSharePlaceInThisPosition.reduce((acc2, place) =>
            acc2 + (place.placement.cpdPercent), 0);
          if (type === 'cpd') {
            weight = isExistPlacePa ? 0 : cpdWeight;
          } else {
            weight = isExistPlacePa ? 0 : ((100 - cpdWeight) / allPlaceTypeInPosition.filter(x => x !== 'pa' && x !== 'cpd').length);
          }
        }
        if (getAllPlaceType.map(x => x.type).indexOf(type) !== -1) return acc;
        getAllPlaceType.push({ type, weight });
        return acc;
      }, 0);
      console.log('getAllPlaceType', getAllPlaceType);
      shareConstruct.push(getAllPlaceType);
    }
    console.log('shareConstruct', shareConstruct);
    let cookie = adsStorage.getStorage('_cpt');
    let zoneCookie = adsStorage.subCookie(cookie, `${this.id}:`, 0);
    zoneCookie = zoneCookie.slice(zoneCookie.indexOf(':') + 1);
    const ShareRendered = zoneCookie.split('|');
    console.log('shareRender', ShareRendered);

    const activeRevenue = (allRevenueType) => {
      const randomNumber = Math.random() * 100;
      const ratio = allRevenueType.reduce((acc, revenueType) =>
          (revenueType.weight + acc), 0) / 100;
      const result = allRevenueType.reduce((acc, revenueType) => {
        const nextRange = acc + (revenueType.weight / ratio);

        if (typeof acc === 'object') {
          return acc;
        }

        if (randomNumber >= acc && randomNumber < nextRange) {
          return revenueType;
        }

        return nextRange;
      }, 0);
      return result;
    };

          /* build construct of current share. */
    let lastThreeShare = ShareRendered.slice(Math.max(ShareRendered.length - 2, 1));
    console.log('lastThreeShare', lastThreeShare);
    const numberOfChannel = util.uniqueItem(lastThreeShare.map(item => item.split(')(')[0])).length;
    if (numberOfChannel > 1) {
      lastThreeShare = [];
      const domain = util.getThisChannel(term.getCurrentDomain('Site:Pageurl')).slice(0, 2).join('.');
      cookie = `${cookie}`.replace(zoneCookie, '');
      adsStorage.setStorage('_cpt', cookie, '', '/', domain);
    }

    for (let i = 0; i < countPositionOnShare; i += 1) {
      if (shareConstruct[i].filter(x => x.type === 'pa').length > 0) {
        shareStructure.push('pa');
      } else {
        const lastPlaceType = [];
        lastThreeShare.map((share) => { // eslint-disable-line
          const shareTemp = share.split('][');
          shareTemp.map((item) => { // eslint-disable-line
            if (item.split(')(')[1] === i.toString()) lastPlaceType.push(item.split(')(')[2]);
          });
        });
        console.log('lastPlaceType', lastPlaceType, i, numberOfPlaceInShare);
        const indexOfCpd = shareConstruct[i].map(x => x.type).indexOf('cpd');
        const cpdPercent = indexOfCpd !== -1 ? shareConstruct[i][indexOfCpd].weight : 0;
        const cpdAppear = lastPlaceType.reduce((acc, place) =>
          (place === 'cpd' ? acc + 1 : acc + 0), 0);
        const cpmAppear = lastPlaceType.reduce((acc, place) =>
          (place === 'cpm' ? acc + 1 : acc + 0), 0);
        console.log('cpmAppear', cpmAppear, cpdAppear);
        console.log('everyThings1', shareConstruct);
        if (shareConstruct[i].length > 1) {
          if (cpdPercent > 0 && cpdPercent <= (100 / 3)) {
            let isRemove = false;
            if (cpdAppear >= 1 && lastPlaceType.length >= 1) {
              const index = shareConstruct[i].map(x => x.type).indexOf('cpd');
              if (index !== -1) shareConstruct[i].splice(index, 1);
              isRemove = true;
            }
            if (cpmAppear >= 2 && lastPlaceType.length >= 2) {
              const index = shareConstruct[i].map(x => x.type).indexOf('cpm');
              if (index !== -1 && isRemove === false) shareConstruct[i].splice(index, 1);
            }
          } else if (cpdPercent > (100 / 3) && cpdPercent <= (200 / 3)) {
            let isRemove = false;
            if (cpdAppear >= 2 && lastPlaceType.length >= 2) {
              const index = shareConstruct[i].map(x => x.type).indexOf('cpd');
              if (index !== -1) shareConstruct[i].splice(index, 1);
              isRemove = true;
            }
            if (cpmAppear >= 1 && lastPlaceType.length >= 1) {
              const index = shareConstruct[i].map(x => x.type).indexOf('cpm');
              if (index !== -1 && isRemove === false) shareConstruct[i].splice(index, 1);
            }
          }
        }
        console.log('everyThings2', shareConstruct);
        const activeType = activeRevenue(shareConstruct[i]);
        console.log('everyThings3', activeType);
        shareStructure.push(activeType.type);
      }
    }
    console.log('buildShareConstructXXX', shareStructure);
    /**
     * [end region: create Share structure]
     */
    /**
     * filer placements suit with share structure and channel
     */
               /* filter place fit with share construct */
    const allSharePlaceFitShareStructure = allSharePlaceInCurrentChannel.filter(item =>
      (item.placement.revenueType === shareStructure[item.positionOnShare === 0 ? item.positionOnShare : item.positionOnShare - 1]) || (item.placement.revenueType === 'pb'));
    console.log('allSharePlaceFitShareStructure', allSharePlaceFitShareStructure);

                /* filter place fit with current channel */
    // allSharePlaceFitShareStructure = allSharePlaceFitShareStructure.filter(place =>
    //   place.placement.filterBanner().length > 0);
    // console.log('filterPlacement', allSharePlaceFitShareStructure);
    /**
     * end
     */

    /**
     * get all monopoly placements
     */
    const monopolyPlacesFitShareStructure = allSharePlaceFitShareStructure.filter(y =>
    y.placement.AdsType.revenueType === 'pa' || y.placement.AdsType.revenueType === 'cpd');
    console.log('monopolyPlacements', monopolyPlacesFitShareStructure);

    const monopolyPlaces = allSharePlaces.filter(y =>
    y.placement.AdsType.revenueType === 'pa' || y.placement.AdsType.revenueType === 'cpd');
    /**
     * end
     */

    /**
     * get share format in data
     */
    let shareFormats;
    try {
      shareFormats = allShare.map(x => (x.type === 'single' ? [1] : x.format.split(',').map(item => parseInt(item, 10))));
    } catch (err) {
      throw new Error('shareFormat Error!');
    }
    console.log('shareFormats', shareFormats);
    const checkShareFormat = (format, format2) => {
      if (format2 === undefined || format2 === '') {
        if (format.length > 1) {
          return shareFormats.reduce((acc, item, index) => {
            if (index === 0) return util.checkTwoArrayEqual(item, format);
            return acc || util.checkTwoArrayEqual(item, format);
          }, 0);
        }
        if (format.length === 1) {
          return shareFormats.reduce((acc, item, index) => {
            if (index === 0) return item.length === 1;
            return acc || item.length === 1;
          }, 0);
        }
      }
      let x;
      if (typeof format === 'string') x = format;
      if (typeof format === 'object' && Array.isArray(format)) x = format.join();
      let y;
      if (typeof format2 === 'string') y = format2;
      if (typeof format2 === 'object' && Array.isArray(format2)) y = format2.join();
      return x === y;
    };
    const getShareInfo = (format) => {
      let result = null;
      for (let i = 0, length = allShare.length; i < length; i += 1) {
        if (format.length > 1 && allShare[i].format === format.join()) {
          result = allShare[i];
          break;
        } else if (format.length === 1 && allShare[i].type === 'single') {
          result = allShare[i];
          break;
        }
      }
      if (result !== null) {
        const cpdWeightInOnePosition = result.allsharePlacements.filter(x => x.placement.filterBanner().length > 0).reduce((res, item, index, arr) => {
          if (index === 0) {
            if (arr.length > 1) return [{ positionOnShare: item.positionOnShare, percent: item.placement.cpdPercent }];
            return { positionOnShare: item.positionOnShare, percent: item.placement.cpdPercent };
          }
          if (!res.reduce((check, item2) => (check !== true ? item2.positionOnShare === item.positionOnShare : true), 0)) {
            res.push({ positionOnShare: item.positionOnShare, percent: item.placement.cpdPercent });
            if (index === (arr.length - 1)) {
              return res.reduce((r, it, i) => {
                if (i === 0) {
                  return it;
                }
                if (r.percent < it.percent) {
                  return it;
                }
                return r;
              }, 0);
            }
            return res;
          }
          console.log('testResutl', res);
          res.map((x) => { if (x.positionOnShare === item.positionOnShare) x.percent += item.placement.cpdPercent; }); // eslint-disable-line
          if (index === (arr.length - 1)) {
            return res.reduce((r, it, i) => {
              if (i === 0) {
                return it;
              }
              if (r.percent < it.percent) {
                return it;
              }
              return r;
            }, 0);
          }
          return res;
        }, 0);
        result.cpdWeightInOnePosition = cpdWeightInOnePosition;
        console.log('cpdWeightInOnePosition', cpdWeightInOnePosition);
        return result;
      }
      return false;
    };
    /**
     * end
     */
    const activePlacement = (allPlaces, type, previousPlace) => {
      if (type === 'random') return allPlaces[Math.floor(Math.random() * allPlaces.length)];
      const randomNumber = Math.random() * 100;

      let filterPlace = null;
      if (type === 'cpd') {
        const filterLimitView = allPlaces.filter((sharePlace) => {
          const cpdPercent = sharePlace.placement.cpdPercent;
          const timesCpdAppear = previousPlace.reduce((result, item) => (
              (sharePlace.placement.revenueType === 'cpd' && sharePlace.placement.id === item) ? result + 1 : result), 0);
          console.log('testActiveCpd', sharePlace.placement.id, cpdPercent, timesCpdAppear);
          if (cpdPercent > 0 && cpdPercent <= 100 / 3) {
            if (timesCpdAppear >= 1) return false;
          } else if (cpdPercent > 100 / 3 && cpdPercent <= 200 / 3) {
            if (timesCpdAppear >= 2) return false;
          }
          return true;
        });
        if (filterLimitView.length > 0) {
          filterPlace = filterLimitView;
        } else {
          filterPlace = allPlaces;
        }
      } else {
        filterPlace = allPlaces;
      }
      console.log('testFilterPlace', filterPlace);
      const ratio = filterPlace
        .reduce((tmp, place) => ((type === 'cpd' ? place.placement.cpdPercent : place.placement.weight) + tmp), 0) / 100;
      return filterPlace.reduce((range, placement) => {
        const nextRange = range + ((type === 'cpd' ? placement.placement.cpdPercent : placement.placement.weight) / ratio);

        if (typeof range === 'object') {
          return range;
        }

        if (randomNumber >= range && randomNumber < nextRange) {
          return placement;
        }

        return nextRange;
      }, 0);
    };
    const isInPageLoad = (item) => {
      if ((currentCampaignLoad !== '' && currentCampaignLoad !== 'none' && currentCampaignLoad !== 'undefined')) {
        return item.placement.campaignId === currentCampaignLoad; // if currentCampaignLoad available => filter out all placement in this campaign
      } else if (currentCampaignLoad !== 'none' && (currentCampaignLoad === '' || currentCampaignLoad === 'undefined')) {
        /* if currentCampaignLoad in not available but exist pageLoads =>
         => check campaign reach the limit page load then drop all placement in these campaigns. */
        if (campaignRichLimit.length > 0) {
          return campaignRichLimit.reduce((res, cLmt) => (res !== true ? item.placement.campaignId !== cLmt : true), 0);
        }
      }
      return true;
    };
    // const filterPlaceWithKeyword = (places, arrRelativeKeyword) => {
    //   const placesWithKeyword = places.filter(place =>
    //     place.data.allBanners.reduce((acc1, banner) => {
    //       const bannerKeyword = banner.keyword.split(',').map(item => item.replace(' ', ''));
    //       return arrRelativeKeyword.filter(key =>
    //           bannerKeyword.reduce((acc2, bannerKey, index2) =>
    //             (index2 === 0 ? bannerKey === key :
    //               (acc2 || bannerKey === key)), 0)).length > 0;
    //     }, 0));
    //   return placesWithKeyword;
    // };
    /**
     * This function to create share
     * @param placeMonopolies
     * @param isRotate
     * @returns {Array}
     */
    const createShare = (placeMonopolies, currentCampaignLoad, isRotate, format, lastShare) => { // eslint-disable-line
      const lastShareTemp = lastShare !== '' && lastShare !== undefined && lastShare !== null ?
        JSON.parse(lastShare) : null;
      console.log('lastShareInCreate', lastShareTemp);
      const shares = [];
      const shareDatas = [];
      for (let i = 1; i <= numberOfPlaceInShare; i += 1) {
        /*

         divide share base on free area and number of part.

          */
        const createShareFormat = util.ComputeShare(numberOfPlaceInShare, i);
        console.log('createShareFormat', createShareFormat);
        /*

         Browse each shareRatio on above and create a share for it.

         */
        createShareFormat.reduce((temp, shareFormat) => {
          const checkS = checkShareFormat(shareFormat, format);
          console.log('checkSnew', checkS);
          if (checkS) {
            /*

             this variable to store places in a share which are chosen bellow.

             */
            const shareInfo = getShareInfo(shareFormat);
            let allSharePlace = shareInfo.allsharePlacements
              .filter(item =>
                (item.placement.revenueType === shareStructure[item.positionOnShare === 0 ? item.positionOnShare : item.positionOnShare - 1])
                || (item.placement.revenueType === 'pb'))
              .filter(place => (place.placement.filterBanner().length > 0 || this.preview === true));
            if (lastShareTemp !== null) {
              const listPreviousPlace = lastShareTemp.placements.map(item => item.id);
              console.log('listPreviousPlace', this.id, listPreviousPlace);
              const removePreviousPlace = allSharePlace.filter(item => (listPreviousPlace.indexOf(item.placement.id) === -1), 0);
              console.log('removePreviousPlace', this.id, removePreviousPlace);
              if (removePreviousPlace.length > 0) allSharePlace = removePreviousPlace;
            }
            console.log('campaignRichLimit', campaignRichLimit, currentCampaignLoad);
            const allSharePlacementInPageLoad = allSharePlace.filter(item => isInPageLoad(item));
            if (allSharePlacementInPageLoad.length > 0) allSharePlace = allSharePlacementInPageLoad;
            console.log('allSharePlace', this.id, allSharePlace, shareInfo);
            const share = { places: [], id: shareInfo.id, css: shareInfo.css, type: shareInfo.type, isRotate: shareInfo.isRotate, cpdWeightInOnePosition: shareInfo.cpdWeightInOnePosition.percent };// eslint-disable-line
            console.log('shareInfo', share);
            /*

             Browse each placeRatio in shareRatio, then find a placement fit it.

             */
            shareFormat.reduce((temp2, placeRatio, index) => {
              console.log('testxxx', index);
              const placeChosen = [];
                                       /* fill monopoly place first */
              if (placeMonopolies.length > 0 && relativePlacement.length === 0) {
                let listMonopolies = placeMonopolies.filter(x => (`share-${x.shareId}` === shareInfo.id || x.placement.revenueType === 'pa'));
                listMonopolies = listMonopolies.filter(
                  (x) => {
                    if (share.type === 'single') {
                      return x.placement.shareType === 'single';
                    }
                    return (x.positionOnShare === 0 ? x.positionOnShare === index : x.positionOnShare === (index + 1)) &&
                      (getNumberOfParts(this.zoneType === 'right' ? x.placement.height : x.placement.width) === placeRatio);
                  });
                /* filter with pageLoads */
                const listMonopoliesInPageLoad = listMonopolies.filter(item => isInPageLoad(item));
                if (listMonopoliesInPageLoad.length > 0) listMonopolies = listMonopoliesInPageLoad;

                console.log('listMonopoliesAfterFilter', listMonopolies);

                if (listMonopolies.length > 0) {
                  console.log('listMonopolies', listMonopolies.length);
                  const previousPlace = [];
                    lastThreeShare.map((share) => { // eslint-disable-line
                      const shareTemp = share.split('][');
                      shareTemp.map((item) => { // eslint-disable-line
                        if (item.split(')(')[1] === index.toString()) previousPlace.push(item.split(')(')[3]);
                      });
                    });
                  console.log('previousPlace', index, previousPlace);
                  const place = listMonopolies.length === 1 ? listMonopolies[0] :
                    activePlacement(listMonopolies, shareStructure[index], previousPlace);
                  placeChosen.push(place);
                  share.places.push(place.placement);
                  return 0;
                }
              }
              /*

               Then, find all placement fit with area place for the rest part.

               */
              const normalPlace = allSharePlace.filter(place => place.placement.revenueType !== 'pb' &&
              place.placement.revenueType !== 'pa' &&
              place.placement.revenueType !== 'cpd' &&
              (place.positionOnShare === 0 ? place.positionOnShare === index : (place.positionOnShare === (index + 1))));
              console.log('normalPlace', this.id, normalPlace);
              const passBackPlaces = allSharePlace.filter(place => place.placement.revenueType === 'pb' && (place.positionOnShare === 0 ? place.positionOnShare === index : (place.positionOnShare === (index + 1))));
              console.log('passBackPlaces', passBackPlaces, allSharePlace, index);
              let places = normalPlace.filter(place => (
                // eslint-disable-next-line
              (share.type !== 'single' ? (getNumberOfParts(this.zoneType === 'right' ? place.placement.height : place.placement.width) === placeRatio) : place.placement.shareType === 'single') &&
                (placeChosen.length > 0 ? placeChosen.reduce((acc, item, index2) => {
                  if (index2 === 0) return item.placement.id !== place.placement.id;
                  return acc && item.placement.id !== place.placement.id;
                }, 0) : true) &&
                  /* if isRotate = true -> check share structure will cancel */
                (isRotate ? true :
                  place.placement.revenueType === shareStructure[index])));
              console.log('placementsForShare', this.id, places);
              /*

               filter place with relative

                */
              let placesRelative = [];
              console.log('testRelative', relativePlacement);
              if (relativePlacement.length > 0 && (currentCampaignLoad === '' || currentCampaignLoad === 'none' || currentCampaignLoad === 'undefined')) {
                // placesWithKeyword = filterPlaceWithKeyword(places, relativePlacement);
                const filterRelative = (relativePlace, place) => {
                  const campaignId = place.placement.campaign.id;
                  const relativeCode = place.placement.relative;
                  const indexOfCampaignId = relativePlace.map(x => x.campaignId).indexOf(campaignId);
                  if (indexOfCampaignId !== -1 && relativeCode !== 0) return relativePlace[indexOfCampaignId].relativeCodes.indexOf(relativeCode) !== -1;
                  return false;
                };
                placesRelative = allSharePlace.filter(item => filterRelative(relativePlacement, item));
                console.log('placesRelative', placesRelative, places);
                if (placesRelative.length > 0) {
                  places = placesRelative;
                }
              }
              /* fill pass back place if don't have any placement fit with conditional */
              if (places.length === 0) {
                // places = passBackPlaces.filter(place => (
                // getNumberOfParts(this.zoneType === 'right' ? place.placement.height : place.placement.width) === placeRatio &&
                // (placeChosen.length > 0 ? placeChosen.reduce((acc, item, index2) => { // eslint-disable-line
                //   if (index2 === 0) return item.placement.id !== place.placement.id;
                //   return acc && item.placement.id !== place.placement.id;
                // }, 0) : true)));
                places = passBackPlaces;
                console.log('runPB', places);
              }
              /*

               if don't have any places fit in area => make a random choose in all placement in this position.

               */
              if (places.length === 0) {
                // share.places = [];
                // share.id = '';
                // share.css = '';
                // return 0;
                const collection = allSharePlaceInCurrentChannel.filter(place =>
                (share.type !== 'single' ? (getNumberOfParts(this.zoneType === 'right' ? place.placement.height : place.placement.width) === placeRatio) : place.placement.shareType === 'single') &&
                (placeChosen.length > 0 ? placeChosen.reduce((acc, item, index2) => {
                  if (index2 === 0) return item.placement.id !== place.placement.id;
                  return acc && item.placement.id !== place.placement.id;
                }, 0) : true));
                if (collection.length > 0) places = collection;
                else {
                  places = allSharePlaceFilterGlobal.filter(place =>
                  (share.type !== 'single' ? (getNumberOfParts(this.zoneType === 'right' ? place.placement.height : place.placement.width) === placeRatio) : place.placement.shareType === 'single') &&
                  (placeChosen.length > 0 ? placeChosen.reduce((acc, item, index2) => {
                    if (index2 === 0) return item.placement.id !== place.placement.id;
                    return acc && item.placement.id !== place.placement.id;
                  }, 0) : true));
                }

                if (places.length > 0) {
                  const place = activePlacement(places, 'random');
                  const placeTemp = JSON.parse(JSON.stringify(place));
                  placeTemp.placement.default = true;
                  console.log('placeTemp', placeTemp);
                  places = [placeTemp];
                  console.log('defaultPlace', places);
                } else {
                  const place = new Placement({ id: 'placement-backup', banners: [], default: true });
                  places = [{ placement: place }];
                }
              }
              let place;
              if (places.length === 1) {
                place = places[0];
              } else {
                place = activePlacement(places, shareStructure[index]);
              }

              placeChosen.push(place);
              share.places.push(place.placement);
              return 0;
            }, 0);
            // if (relativePlacement.length > 0 && isRelative) {
            //   console.log('ShareTest', share);
            //   relativePlacemen
            //   shares.push(share);
            //   isRelative = false;
            // }
            console.log('ShareTest', share);
            shares.push(share);
            return '';
          }
          return; // eslint-disable-line
        }, 0);
      }
      if (shares.length > 0) {
        const normalWeight = 100 / shares.length;
        let bestShare = shares.reduce((share, item, index, arr) => {
          const current = item.places.reduce((count, p) => {
            if (p.default !== true && (p.revenueType === 'cpd' || p.revenueType === 'pa')) return count + 1;
            return count;
          }, 0);
          if (index === 0) {
            return [{ item, index }];
          }
          const last = share[0].item.places.reduce((count, p) => {
            if ((p.revenueType === 'cpd' || p.revenueType === 'pa') && p.default !== true) return count + 1;
            return count;
          }, 0);
          console.log('testABC', current, last, item, share);
          if (last < current) {
            return [{ item, index }];
          }
          if (last === current) {
            if (index === (arr.length - 1) && current === 0) return false;
            share.push({ item, index });
            return share;
          }
          return share;
        }, 0);
        console.log('first', bestShare);
        // remove pb
        const filterPB = bestShare ? bestShare.filter(x => x.item.places.reduce((res, item) => (res !== false ? item.revenueType !== 'pb' : false), 0)) : [];
        if (filterPB.length > 0) bestShare = filterPB;
        console.log('second', bestShare);
        if (!bestShare) {
          bestShare = shares.filter((item) => {
            const isUsePassBack = item.places.reduce((acc, itm, i) => {
              if (i === 0) return itm.revenueType === 'pb';
              return acc || itm.revenueType === 'pb';
            }, 0);
            const isUseDefault = item.places.reduce((acc, itm, i) => {
              if (i === 0) return itm.default === true;
              return acc || itm.default === true;
            }, 0);
            console.log('shareTTT', (isUseDefault && !isUsePassBack), shares, isUseDefault, isUsePassBack);
            if (isUseDefault && !isUsePassBack) return false;
            return true;
          }).map(item => ({ item, index: shares.reduce((res, itm, i) => (item.id === itm.id ? i : res), 0) }));
          console.log('third', bestShare);
        }
        const placementBelongTo = (listPlacement) => {
          if (listPlacement.length === 1) {
            return allShare.filter(item => item.type === 'single')[0].id;
          }
          return listPlacement.reduce((res, placementID, i, arr) => {
            const listBelong = allShare.reduce((result, item, index) => {
              if (item.allsharePlacements.map(x => x.placement.id).indexOf(placementID) !== -1) {
                if (index === 0 || result === 0) return [item.id];
                if (result.indexOf(item.id) !== -1) result.push(item.id);
                return result;
              }
              return result;
            }, 0);
            if (i === 0) return listBelong;
            if (i === arr.length - 1) {
              const share = util.getIntersect(res, listBelong)[0];
              console.log('testIntersect', share, res, listBelong);
              if (share !== undefined) return share;
              const returnValue = allShare.reduce((result, item, index) => {
                if (item.allsharePlacements.map(x => x.placement.id).indexOf(listPlacement[0]) !== -1) {
                  if (index === 0 || result === 0) return item.id;
                  // if (result.indexOf(item.id) !== -1) result.push(item.id);
                  return result;
                }
                return result;
              }, 0);
              console.log('returnValue', returnValue);
              return returnValue;
            }
            return util.getIntersect(res, listBelong);
          }, 0);
        };
        const lastTwoShareFormat = lastThreeShare.map(item => item.split('][').map(x => x.split(')(').slice(-1)[0])).map(item => placementBelongTo(item));
        console.log('lastTwoShareFormat', lastTwoShareFormat);
        // filter with numbers of times CPD appear
        bestShare = bestShare ? bestShare.filter((item) => {
          if ((item.item.cpdWeightInOnePosition > 0 && item.item.cpdWeightInOnePosition <= 33)) {
            if (lastTwoShareFormat.indexOf(item.item.id) !== -1) return false;
          }
          if (item.item.cpdWeightInOnePosition > 33 && item.item.cpdWeightInOnePosition <= 66) {
            if (
              lastTwoShareFormat.indexOf(item.item.id) !== -1 &&
              lastTwoShareFormat.indexOf(item.item.id) !== lastTwoShareFormat.lastIndexOf(item.item.id)) return false;
          }
          return true;
        }) : false;
        console.log('indexOfBestShare', bestShare);
        for (let i = 0; i < shares.length; i += 1) {
          const isUsePassBack = shares[i].places.reduce((acc, item, index) => {
            if (index === 0) return item.revenueType === 'pb';
            return acc || item.revenueType === 'pb';
          }, 0);
          let weight = 0;
          console.log('testBestShare', bestShare.reduce((res, item) => {
            const aa = (res !== true ? item.index === i : true);
            console.log('checkcheck', aa, res, item);
            return aa;
          }, 0), i);
          if (bestShare && bestShare.reduce((res, item) => (res !== true ? item.index === i : true), 0)) {
            console.log('runBestShare', bestShare);
            weight = bestShare.length === 1 ? 100 : bestShare.reduce((res, item) => {
              let r = 0;
              if (item.index === i) {
                if (item.item.places.reduce((c, itm) => (c !== true ? itm.revenueType === 'pa' : true), 0)) {
                  r = 100;
                } else {
                  r = item.item.cpdWeightInOnePosition;
                }
              } else {
                r = res;
              }
              if (r !== undefined) return r;
              return item.index === i ? (100 / bestShare.length) : res;
            }, 0);
          } else if (bestShare && !bestShare.reduce((res, item) => (res !== true ? item.index === i : true), 0)) {
            weight = 0;
          } else {
            weight = isUsePassBack && shares.length > 1 ? 0 : normalWeight;
          }
          const id = shares[i].id.replace('share-', '');
          const outputCss = shares[i].css;
          const placements = shares[i].places;
          const type = shares[i].type;
          const isShareRotate = shares[i].isRotate;
          const campaignLoad = currentCampaignLoad;
          const zoneId = this.id;
          console.log('checkRotate', shares[i].isRotate);
          const newShare = new Share({ id, outputCss, placements, weight, type, isRotate: isShareRotate, currentCampaignLoad: campaignLoad, zoneId });
          shareDatas.push(newShare);
        }
      }
      return shareDatas;
    };
    /**
     * [compute Share]
     */
    if (isRotate) {
      /* if isRotate = true ->
        * 1. Create a sets placementsInSharePosition placements
         * that have a placement per a share position.
        * 2. make a combination (1->k) of n :
         * k number of share position - n is placementsInSharePosition.
         * 3. Create share with these sets after combination */

      /*  1  */
      const lastShareTemp = lastShare !== '' && lastShare !== undefined && lastShare !== null ?
        JSON.parse(lastShare) : null;
      let sharePlacementsFitChannel = allSharePlaces.filter(place =>
      place.placement.filterBanner().length > 0);
      if (lastShareTemp !== null) {
        const listPreviousPlace = lastShareTemp.placements.map(item => item.id);
        const removePreviousPlace = sharePlacementsFitChannel.filter(item => (listPreviousPlace.indexOf(item.placement.id) === -1), 0);
        if (removePreviousPlace.length > 0) sharePlacementsFitChannel = removePreviousPlace;
      }
      let placementsInSharePosition = [];
      const monopolyPositions = util.uniqueItem(monopolyPlaces.map(x => (x.positionOnShare === 0 ? x.positionOnShare : (x.positionOnShare - 1))));
      monopolyPositions.reduce((acc, item) =>
                                      /* make a random choice placement in each share position */
        placementsInSharePosition.push(activePlacement(sharePlacementsFitChannel.filter(x => ((x.positionOnShare === 0 ? x.positionOnShare === item : (x.positionOnShare === (item + 1))) && x.placement.revenueType !== 'pr')), 'random')), 0);
      placementsInSharePosition = util.flatten(placementsInSharePosition);
      console.log('placementsInSharePosition', placementsInSharePosition);

      /* 2 */
      const combinationPlaceInShare = placementsInSharePosition.length === 1 ?
        [placementsInSharePosition] : util.combinations(placementsInSharePosition);
      console.log('combinationPlaceInShare', combinationPlaceInShare);

      /* 3 */
      console.log('lastShare', lastShare);
      let result = [];
      if (placementsInSharePosition.length <= 0) result = createShare([], 'none', true, formatRotate, lastShare); // eslint-disable-line
      else combinationPlaceInShare.map((x) => { result = result.concat(createShare(x, 'none', true, formatRotate, lastShare)); }); // eslint-disable-line
      // const result = createShare(monopolyPlacesFitShareStructure);
      console.log('hohohoho', result);
      return result;
      /*  */
    }
          /* if isRotate = false -> just create share with truly monopoly placement
                            and share structure */
    const result = createShare(monopolyPlacesFitShareStructure, currentCampaignLoad, '', '', lastShare);
    console.log('newShareFilter', result);
    return result;
    /**
     *[end compute share]
     */
  }

  /**
   * Get a active share randomly by its weight
   * @return {Share}
   */
  activeShare(isRotate, formatRotate, lastShare) {
    const allShare = this.filterShare(isRotate, formatRotate, lastShare);
    // if (allShare.length === 1) return allShare[0];
    if (allShare.length > 0) {
      const randomNumber = Math.random() * 100;
      const isNoneWeight = allShare.reduce((acc, item, index) => {
        if (index === 0) return item.weight === undefined || item.weight === 0;
        return acc && (item.weight === undefined || item.weight === 0);
      }, 0);
      if (isNoneWeight) allShare.map(item => item.weight = (100 / allShare.length)); // eslint-disable-line
      const ratio = allShare.reduce((tmp, share) => {
        if (share.weight === undefined) {
            share.weight = 0; // eslint-disable-line
        }
        return (share.weight + tmp);
      }, 0) / 100;

      const res = allShare.reduce((range, share) => {
        const nextRange = range + (share.weight / ratio);

        if (typeof range === 'object') {
          return range;
        }

        if (randomNumber >= range && randomNumber < nextRange) {
          return share;
        }

        return nextRange;
      }, 0);
      // if share lack of place, it'll fill default place into share.
      // res = util.fixShare(res);
      // clear cookie _cpt
      const domain = util.getThisChannel(term.getCurrentDomain('Site:Pageurl')).slice(0, 2).join('.');
      let cookie = adsStorage.getStorage('_cpt');
      let zoneCookie = adsStorage.subCookie(cookie, `${this.id}:`, 0);
      zoneCookie = zoneCookie.slice(zoneCookie.indexOf(':') + 1);
      const ShareRendered = zoneCookie.split('|');
      const numberOfChannel = util.uniqueItem(ShareRendered.slice(Math.max(ShareRendered.length - 3, 1)).map(item => item.split(')(')[0])).length;
      if (numberOfChannel > 1 || ShareRendered.length > 50) {
        cookie = `${cookie}`.replace(zoneCookie, '');
        adsStorage.setStorage('_cpt', cookie, '', '/', domain);
      }
      console.log('current share:', res);
      console.log('current Weight', res.weight / ratio);
      // const isFixHeight = res.placements.reduce((acc, place, index1) => {
      //   if (index1 === 0) {
      //     place.allBanners.reduce((acc2, banner, index2) => {
      //       if (index2 === 0) {
      //         return ((banner.bannerType.isInputData !== undefined &&
      //         banner.bannerType.isInputData) ||
      //         (!(banner.bannerType.isInputData !== undefined &&
      //         banner.bannerType.isInputData) &&
      //         banner.isIFrame));
      //       }
      //       return acc2 && ((banner.bannerType.isInputData !== undefined &&
      //         banner.bannerType.isInputData) ||
      //         (!(banner.bannerType.isInputData !== undefined &&
      //         banner.bannerType.isInputData) &&
      //         banner.isIFrame));
      //     }, 0);
      //   }
      //   return acc && place.allBanners.reduce((acc2, banner, index2) => {
      //     if (index2 === 0) {
      //       return ((banner.bannerType.isInputData !== undefined &&
      //       banner.bannerType.isInputData) ||
      //         (!(banner.bannerType.isInputData !== undefined &&
      //         banner.bannerType.isInputData) &&
      //         banner.isIFrame));
      //     }
      //     return acc2 && ((banner.bannerType.isInputData !== undefined &&
      //       banner.bannerType.isInputData) ||
      //       (!(banner.bannerType.isInputData !== undefined &&
      //       banner.bannerType.isInputData) &&
      //       banner.isIFrame));
      //   }, 0);
      // }, 0);
      if (isRotate) res.placements.map(item => (item.isRotateFromShare = true)); // eslint-disable-line
      return res;
    }
    return false;
  }

  /**
   * Get array of active placements
   * @returns [Placement]
   */
  activePlacements() {
    const activeShareModel = this.activeShare();
    return activeShareModel.activePlacements();
  }

  /**
   * get link advb to send log
   * Track @zone load
   */
  zoneLogging() {
    const zoneID = this.id.indexOf('zone-') !== -1 ? this.id.replace('zone-', '') : this.id;
    const domain = encodeURIComponent(term.getCurrentDomain('Site:Pageurl'));
    const domainLog = 'http://lg1.logging.admicro.vn';
    const linkLog = `${domainLog}/advbcms?dmn=${domain}&zid=${zoneID}`;
    console.log('ZoneLog', linkLog);
    const img = new Image();
    img.src = linkLog;
  }
}

export default Zone;
