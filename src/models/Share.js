/**
 * Created by Manhhailua on 12/5/16.
 */

import Entity from './Entity';
import Placement from './Placement';
import { util } from '../vendor';

class Share extends Entity {

  constructor(share) {
    super(share);

    this.id = `share-${share.id}`;
    this.placements = share.placements;
    this.sharePlacements = share.sharePlacements;
    this.format = share.format;
    this.zoneId = share.zoneId;
    this.isRotate = share.isRotate;
    this.currentCampaignLoad = share.currentCampaignLoad;
  }

  get shareArea() {
    return util.convertArea(this.height, this.width);
  }

  get allPlacements() {
    try {
      let allPlace = this.placements.map(placement => new Placement(placement));
      allPlace = allPlace.filter(item => item.checkAvailable);
      const isUsePlacePosition = allPlace.reduce((acc, item, index) => {
        if (index === 0) {
          return item.positionOnShare !== undefined && item.positionOnShare !== 0;
        }
        return acc && (item.positionOnShare !== undefined && item.positionOnShare !== 0);
      }, 0);
      console.log('isUsePlacePosition', isUsePlacePosition);
      if (isUsePlacePosition) {
        allPlace.sort((a, b) => a.positionOnShare - b.positionOnShare);
        console.log('sort', allPlace);
        return allPlace;
      }
      console.log('allPlaceNew', allPlace);
      return allPlace;
    } catch (err) {
      return [];
    }
  }
  /**
   * Get all placements from this share
   * @returns [Placement]
   */
  get allsharePlacements() {
    // const allPlace = this.placements.map(placement => new Placement(placement));
    const allPlace = this.sharePlacements.filter(sharePlacement =>
    sharePlacement.placement !== null);

    allPlace.map(item => item.placement.shareType = this.type); // eslint-disable-line
    /* eslint-disable */
    allPlace.reduce((acc, item) => {
      item.placement.zoneId = this.zoneId;
      item.placement = new Placement(item.placement);
    }, 0);
    /* eslint-enable */
    const isUsePlacePosition = allPlace.reduce((acc, item, index) => {
      if (index === 0) {
        return item.positionOnShare !== undefined && item.positionOnShare !== 0;
      }
      return acc && (item.positionOnShare !== undefined && item.positionOnShare !== 0);
    }, 0);

    console.log('isUsePlacePosition', isUsePlacePosition);
    if (isUsePlacePosition) {
      allPlace.sort((a, b) => a.positionOnShare - b.positionOnShare);
      console.log('sort', allPlace);
      return allPlace;
    }
    return allPlace;
  }

  /**
   * Pull out one placement randomly by its "weight"
   * @returns {Placement}
   */
  activePlacement() {
    const randomNumber = Math.random() * 100;
    const allPlacement = this.allPlacements;
    const ratio = allPlacement.reduce((tmp, place) => {
      if (place.weight === undefined) {
        place.weight = 100 / allPlacement.length; // eslint-disable-line
      }
      return (place.weight + tmp);
    }, 0) / 100;
    const res = allPlacement.reduce((range, placement) => {
      const nextRange = range + (placement.weight / ratio);

      if (typeof range === 'object') {
        return range;
      }

      if (randomNumber >= range && randomNumber < nextRange) {
        return placement;
      }

      return nextRange;
    }, 0);
    return res;
  }

  /**
   * Check for share type then return array of placements
   * @returns [Placement]
   */
  activePlacements() {
    if (this.type === 'multiple') {
      return this.allPlacements;
    }

    return [this.activePlacement()];
  }

}

export default Share;
