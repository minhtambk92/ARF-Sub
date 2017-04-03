/**
 * Created by Manhhailua on 11/23/16.
 */

import chai from 'chai';
import { Zone, Share, Placement, Banner } from '../build/Arf';
import zone from './zone.json';

const expect = chai.expect;
let zoneComponent;

describe('Given an instance of zone object', () => {
  before(() => {
    zoneComponent = new Zone({
      propsData: {
        model: zone,
      },
    });
  });

  it('should successfully create a Zone component', () => {
    expect(zoneComponent).to.be.an.instanceof(Zone);
  });

  it('created Zone component should have array contains at least one Share as child', () => {
    expect(zoneComponent)
      .to.has.property('$children')
      .to.be.instanceof(Array);

    // All children must be Share
    zoneComponent.$children.forEach((share) => {
      expect(share).to.be.an.instanceof(Share);
    });
  });

  it('all Share components should have array contains Placement', () => {
    zoneComponent.$children.forEach((share) => {
      expect(share).to.has.property('$children');

      // All children must be Placement
      share.$children.forEach((placement) => {
        expect(placement).to.be.an.instanceof(Placement);
      });
    });
  });

  it('all Placement components should have array contains Banner', () => {
    zoneComponent.$children.forEach((share) => {
      // Fetch through all shares
      share.$children.forEach((placement) => {
        expect(placement).to.has.property('$children');

        // Fetch through all placements
        placement.$children.forEach((banner) => {
          // All children must be Banner
          expect(banner).to.be.an.instanceof(Banner);
        });
      });
    });
  });
});
