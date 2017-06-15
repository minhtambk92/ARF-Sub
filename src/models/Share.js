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
  }

  get shareArea() {
    return util.convertArea(this.height, this.width);
  }

  get allPlacements() {
    const allPlace = this.placements.map(placement => new Placement(placement));
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
   * Get all placements from this share
   * @returns [Placement]
   */
  get allsharePlacements() {
    // const allPlace = this.placements.map(placement => new Placement(placement));
    const allPlace = this.sharePlacements.filter(sharePlacement =>
    sharePlacement.placement !== null);
    allPlace.reduce((acc, item) => {item.placement = new Placement(item.placement)}, 0); // eslint-disable-line
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
    const ratio = this.allPlacements.reduce((tmp, place) => {
      if (place.placement.weight === undefined) {
        place.placement.weight = 100 / this.allPlacements.length; // eslint-disable-line
      }
      return (place.placement.weight + tmp);
    }, 0) / 100;

    const res = this.allPlacements.reduce((range, placement) => {
      const nextRange = range + (placement.placement.weight / ratio);

      if (typeof range === 'object') {
        return range;
      }

      if (randomNumber >= range && randomNumber < nextRange) {
        return placement;
      }

      return nextRange;
    }, 0);

    console.log('abcc', res, this.allPlacements);

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
