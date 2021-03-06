/**
 * Created by Manhhailua on 11/30/16.
 */

import Entity from './Entity';
import Banner from './Banner';
import { util } from '../vendor';

class Placement extends Entity {

  constructor(placement) {
    super(placement);

    this.id = (typeof (placement.id) === 'string') ? (placement.id.indexOf('placement-') === -1 ? `placement-${placement.id}` : placement.id) : `placement-${placement.id}`; // eslint-disable-line
    this.banners = placement.banners;
    this.revenueType = placement.revenueType;
    this.cpdPercent = placement.cpdPercent;
    this.pr = placement.pr;
    this.cpd = placement.cpd;
    this.cpm = placement.cpm;
    this.campaign = placement.campaign;
    this.positionOnShare = placement.positionOnShare;
    this.zoneId = placement.zoneId;
    this.isRotate = placement.isRotate;
    this.isRotateFromShare = placement.isRotateFromShare;
    this.relative = placement.relative;
    this.shareType = placement.shareType;
    this.default = placement.default;
    this.campaignId = placement.campaignId;
  }

  get PlacementArea() {
    return util.convertArea(this.height, this.width);
  }

  /**
   * Get all banners from this placement
   * @returns [Banner]
   */
  get allBanners() {
    try {
      return this.banners.map(banner => new Banner(banner));
    } catch (err) {
      return [];
    }
  }

  filterBanner(lastBanner) {
    console.log('lastBanner', lastBanner, this.allBanners.length);
    console.log('testDefault', this.default);
    if (this.revenueType === 'pb' || this.default === true) {
      return this.allBanners;
    }
    const allBanner = (this.allBanners.length > 1 && (lastBanner !== undefined && lastBanner !== null)) ? this.allBanners.filter(item => item.id !== lastBanner) : this.allBanners;
    let result = allBanner.filter(x => x.isRenderable());
    if ((window.ZoneConnect !== undefined && window.ZoneConnect.relativeKeyword !== '')) {
      const arrayKeyword = window.ZoneConnect.relativeKeyword.split(',').map(item => item.replace(' ', ''));
      if (arrayKeyword.length > 0) {
        const filterBannerWithKeyword = result.filter(banner => banner.keyword.split(',').map(item => item.replace(' ', '')).filter(item => arrayKeyword.indexOf(item) !== -1).length > 0);
        if (filterBannerWithKeyword.length > 0) {
          result = filterBannerWithKeyword;
        }
      }
      console.log('numberOfBannerInPlacement', result, arrayKeyword);
    }
    return result;
  }

  filterBannerGlobal() {
    if (this.revenueType === 'pb' || this.default === true) {
      return this.allBanners;
    }
    const allBanner = this.allBanners;
    let result = allBanner.filter(x => x.checkChannel.checkGlobal);
    if ((window.ZoneConnect !== undefined && window.ZoneConnect.relativeKeyword !== '')) {
      const arrayKeyword = window.ZoneConnect.relativeKeyword.split(',').map(item => item.replace(' ', ''));
      if (arrayKeyword.length > 0) {
        const filterBannerWithKeyword = result.filter(banner => banner.keyword.split(',').map(item => item.replace(' ', '')).filter(item => arrayKeyword.indexOf(item) !== -1).length > 0);
        if (filterBannerWithKeyword.length > 0) {
          result = filterBannerWithKeyword;
        }
      }
      console.log('numberOfBannerInPlacement', result, arrayKeyword);
    }
    return result;
  }

  /**
   * Get active banner by its weight
   * @returns {Banner}
   */
  activeBanner(isRotate, lastBanner) {
    const allBanner = this.preview === true ? this.allBanners : this.filterBanner(lastBanner);
    if (allBanner.length > 0) {
      const isExitsWeight = allBanner.reduce((acc, banner, index) => {
        if (index === 0) {
          return banner.weight > 0;
        }
        return acc && banner.weight > 0;
      }, 0);
      console.log('isExitsWeight', isExitsWeight, allBanner.length);
      if (!isExitsWeight) {
        const weight = 100 / allBanner.length;
        allBanner.reduce((acc, banner) => (banner.weight = weight), 0); // eslint-disable-line
      }
      const randomNumber = Math.random() * 100;
      const ratio = allBanner.reduce((tmp, banner) => (tmp + banner.weight), 0) / 100;

      const result = allBanner.reduce((range, banner) => {
        const nextRange = range + (banner.weight / ratio);

        if (typeof range === 'object') {
          return range;
        }

        if (randomNumber >= range && randomNumber < nextRange) {
          return banner;
        }

        return nextRange;
      }, 0);
      result.zoneId = this.zoneId;
      result.campaignId = this.campaign.id;
      if (isRotate) result.isRotate = true;
      return result;
    }

    // default banner here
    return false;
  }

  get AdsType() {
    if (this.revenueType !== undefined) {
      if (this.revenueType === 'cpd') {
        return {
          revenueType: this.revenueType,
          cpdPercent: this.cpdPercent === 0 ? (1 / 3) : this.cpdPercent,
        };
      }
      return { revenueType: this.revenueType };
    }
    return '';
  }

  get getCampaign() {
    if (this.campaign) {
      return this.campaign;
    }
    return false;
  }

  get checkAvailable() {
    const campaign = this.campaign;
    const startTime = campaign.startTime;
    const endTime = campaign.endTime;
    return util.checkTime(startTime, endTime);
  }

}

export default Placement;
