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
    return this.allBanners.filter(x => x.isRenderable());
  }

  /**
   * Get active banner by its weight
   * @returns {Banner}
   */
  activeBanner() {
    if (this.filterBanner().length > 0) {
      const randomNumber = Math.random() * 100;
      const ratio = this.filterBanner().reduce((tmp, banner) => (tmp + banner.weight), 0) / 100;

      return this.filterBanner().reduce((range, banner) => {
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
    // // console.log(`place none banner: ${this.id} `);
    const randomNumber = Math.random() * 100;
    const ratio = this.allBanners.reduce((tmp, banner) => (tmp + banner.weight) / 100, 0);

    return this.allBanners.reduce((range, banner) => {
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
