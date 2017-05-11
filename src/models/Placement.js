/**
 * Created by Manhhailua on 11/30/16.
 */

import Entity from './Entity';
import Banner from './Banner';
import { util } from '../vendor';

class Placement extends Entity {

  constructor(placement) {
    super(placement);

    this.id = `placement-${placement.id}`;
    this.banners = placement.banners;
    this.revenueType = placement.revenueType;
    this.cpdPercent = placement.cpdPercent;
    this.pr = placement.pr;
    this.cpd = placement.cpd;
    this.cpm = placement.cpm;
    this.campaign = placement.campaign;
    this.positionOnShare = placement.positionOnShare;
  }

  get PlacementArea() {
    return util.convertArea(this.height, this.width);
  }

  /**
   * Get all banners from this placement
   * @returns [Banner]
   */
  get allBanners() {
    return this.banners.map(banner => new Banner(banner));
  }

  filterBanner() {
    let result = this.allBanners.filter(x => x.isRenderable());
    const arrayKeyword = window.ZoneConnect.relativeKeyword.split(',').map(item => item.replace(' ', ''));
    if (arrayKeyword.length > 0) {
      const filterBannerWithKeyword = result.filter(banner => banner.keyword.split(',').map(item => item.replace(' ', '')).filter(item => arrayKeyword.indexOf(item) !== -1).length > 0);
      if (filterBannerWithKeyword.length > 0) {
        result = filterBannerWithKeyword;
      }
    }
    if (result.length === 0) {
      return this.allBanners;
    }
    return result;
  }

  /**
   * Get active banner by its weight
   * @returns {Banner}
   */
  activeBanner() {
    const allBanner = this.filterBanner();
    if (allBanner.length > 0) {
      const isExitsWeight = allBanner.reduce((acc, banner, index) => {
        if (index === 0) {
          return banner.weight > 0;
        }
        return acc && banner.weight > 0;
      }, 0);
      console.log('isExitsWeight', isExitsWeight);
      if (!isExitsWeight) {
        const weight = 100 / allBanner.length;
        allBanner.reduce((acc, banner) => (banner.weight = weight), 0); // eslint-disable-line
      }
      const randomNumber = Math.random() * 100;
      const ratio = allBanner.reduce((tmp, banner) => (tmp + banner.weight), 0) / 100;

      return allBanner.reduce((range, banner) => {
        const nextRange = range + (banner.weight / ratio);

        if (typeof range === 'object') {
          return range;
        }

        if (randomNumber >= range && randomNumber < nextRange) {
          return banner;
        }

        return nextRange;
      }, 0);
    }

    // default banner here
    return util.getDefaultBanner(this.width, this.height);
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

}

export default Placement;
