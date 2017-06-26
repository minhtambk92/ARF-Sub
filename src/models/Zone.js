/**
 * Created by Manhhailua on 11/25/16.
 */

import Entity from './Entity';
import Share from './Share';
import { util, adsStorage, term } from '../vendor';

class Zone extends Entity {

  constructor(zone) {
    super(zone);

    this.id = `zone-${zone.id}`;
    this.shares = zone.shares;
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

  get ZoneArea() {
    return util.convertArea(this.height, this.width);
  }

  get zoneType() {
    if ((this.height >= 257) && (this.width <= 600 && this.width >= 160)) {
      return 'right';
    }
    return 'top';
  }

  filterShareDynamic(relativeKeyword) {
    const chooseShare = () => {
      let allShare = this.allShares();
      allShare = allShare.filter((currentShare) => {
        let allPlace = [];
        [currentShare].reduce((temp, share) => allPlace.push(share.allsharePlacements.map(item =>
          ({ data: item.placement,
            index: (item.positionOnShare !== 0 ? item.positionOnShare - 1 : 0) }))), 0);
        allPlace = util.flatten(allPlace);
        // filter place fit with current channel
        allPlace = allPlace.filter(place => place.data.allBanners.reduce((acc, banner, index) => {
          if (index === 0) {
            return banner.checkChannel;
          }
          return acc && banner.checkChannel;
        }, 0));
        if (allPlace.length > 0) return true;
        return false;
      });
      if (allShare.length > 1) {
        const randomNumber = Math.random() * 100;
        const ratio = allShare.reduce((tmp, share) => {
          if (share.weight === undefined) {
              share.weight = 100 / allShare.length; // eslint-disable-line
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
        return res;
      } else if (allShare.length === 1) {
        return allShare[0];
      }
      return false;
    };
    // choose placement base on weight.
    const activePlacement = (allPlaces, type) => {
      const randomNumber = Math.random() * 100;
      const ratio = allPlaces.reduce((tmp, place) => ((type === 'cpd' ? place.data.cpdPercent : place.data.weight) + tmp), 0) / 100;
      return allPlaces.reduce((range, placement) => {
        const nextRange = range + ((type === 'cpd' ? placement.data.cpdPercent : placement.data.weight) / ratio);

        if (typeof range === 'object') {
          return range;
        }

        if (randomNumber >= range && randomNumber < nextRange) {
          return placement;
        }

        return nextRange;
      }, 0);
    };
    const filterPlaceWithKeyword = (places, arrRelativeKeyword) => {
      const placesWithKeyword = places.filter(place =>
        place.data.allBanners.reduce((acc1, banner) => {
          const bannerKeyword = banner.keyword.split(',').map(item => item.replace(' ', ''));
          return arrRelativeKeyword.filter(key =>
              bannerKeyword.reduce((acc2, bannerKey, index2) =>
                (index2 === 0 ? bannerKey === key :
                  (acc2 || bannerKey === key)), 0)).length > 0;
        }, 0));
      return placesWithKeyword;
    };
    // const allShare = this.allShares();
    // get css of share
    const getCss = (share) => {
      if (share.css !== undefined && share.css !== '') {
        return share.css;
      }
      return '.arf-placement {\n  margin: auto;\n}\n';
    };
    let arrayRelativeKeyword = [];
    let allPlace = [];
    const currentShare = [chooseShare()];
    if (!currentShare[0]) return [];
    console.log('shareTemplate', currentShare);
    currentShare.reduce((temp, share) => allPlace.push(share.allsharePlacements.map(item =>
          ({ data: item.placement,
            index: (item.positionOnShare !== 0 ? item.positionOnShare - 1 : 0) }))), 0);
    allPlace = util.flatten(allPlace);
    // filter place fit with current channel
    allPlace = allPlace.filter(place => place.data.allBanners.reduce((acc, banner, index) => {
      if (index === 0) {
        return banner.checkChannel;
      }
      return acc && banner.checkChannel;
    }, 0));
    console.log('allPlaceZone', allPlace);
    if (allPlace.length > 0) {
      arrayRelativeKeyword = relativeKeyword.split(',').map(item => item.replace(' ', ''));
      console.log('arrayRelativeKeyword', relativeKeyword, arrayRelativeKeyword);
      // console.log('all Place', allPlace);
      // get place min area
      const getMinPlace = (allPlaces) => {
        if (this.zoneType === 'right') {
          let min = allPlaces[0].data.height;
          for (let i = 0, leng = allPlaces.length; i < leng; i += 1) {
            if (allPlaces[i].data.height < min) {
              min = allPlaces[i].data.height;
            }
          }
          return min;
        }
        let min = allPlaces[0].data.width;
        for (let i = 0, leng = allPlaces.length; i < leng; i += 1) {
          if (allPlaces[i].data.width < min) {
            min = allPlaces[i].data.width;
          }
        }
        return min;
      };
      const minPlace = getMinPlace(allPlace);
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
      const getShareRatio = () => {
        const listRatio = [];
        currentShare.reduce((acc, share) => { //eslint-disable-line
          try {
            const ratio = share.type === 'multiple' ? share.format.split(',').map(x => parseInt(x, 10)) : [1];
            listRatio.push({ ratio, id: share.id, css: share.outputCss });
          } catch (error) {
            throw new Error(error);
          }
        }, 0);
        return listRatio;
      };
      const listRatio = getShareRatio();
      console.log('listRatio', listRatio);
      const numberOfPlaceInShare = this.zoneType === 'right' ? getNumberOfParts(this.height) : getNumberOfParts(this.width);
      console.log('minPlace', minPlace);
      /* eslint-disable */
      // const computeShareWithPlacementType = (allPlacement, placementType, shareConstruct) => {
      //   const shareTemplate = {
      //     id: 'DS',
      //     name: 'Dynamic Share',
      //     html: '<div class="hello"></div>',
      //     css: '.arf-placement{display:inline-block;margin-left:50px;}',
      //     outputCss: '',
      //     width: this.width,
      //     height: this.height,
      //     classes: '',
      //     weight: 0,
      //     type: 'multiple',
      //     description: `Share ${this.width}x${this.height}`,
      //     zoneId: this.id,
      //     placements: [],
      //   };
      //   const shares = [];
      //   const shareDatas = [];
      //
      //   // get all places have type === placementType
      // eslint-disable-next-line
      //   const monopolyPlaces = allPlacement.filter(y => y.data.AdsType.revenueType === placementType);
      //   console.log('monopolyPlaces', monopolyPlaces);
      //   const createShareByPlaceMonopolies = (placeMonopolies) => {
      //     // Create Share : S(zone) - S(p) = S(free)
      //     const SumPrArea = placeMonopolies.reduce((temp, item) =>
      //     temp + item.data.PlacementArea, 0);
      //     const FreeArea = this.ZoneArea - SumPrArea;
      //     // console.log('FreeArea', FreeArea);
      //
      //     for (let i = 1; i <= FreeArea; i += 1) {
      //       // console.log('i', i);
      //       // divide share base on free area and number of part.
      //       const shareRatios = util.ComputeShare(FreeArea, i);
      //       console.log('shareRatios', shareRatios);
      //       // Browse each shareRatio on above and create a share for it.
      //       shareRatios.reduce((temp, shareRatio) => {
      //         console.log('shareRatio', shareRatio);
      //         // this variable to store places in a share which are chosen bellow
      //         let share = [];
      //         placeMonopolies.reduce((x, y) =>
      //           shareRatio.splice(y.index, 0, y.data.PlacementArea), 0);
      //         let isRelative = false;
      //         // Browse each placeRatio in shareRatio, then find a placement fit it.
      //         shareRatio.reduce((temp2, placeRatio, index) => {
      //           console.log('placeRatio', placeRatio);
      //           if (placeMonopolies.map(item => item.index).indexOf(index) !== -1) {
      //             return 0;
      //           }
      //           // find all placement fit with area place
      //           let places = allPlacement.filter(place =>
      //             (place.data.PlacementArea === placeRatio &&
      //             placeMonopolies.indexOf(place) === -1 &&
      //             place.data.revenueType !== 'pr' &&
      //             // placeChosen.indexOf(place) === -1 &&
      //             place.index === index &&
      //             place.data.revenueType === shareConstruct[index].type));
      //
      //           // filter place with relative keyword
      //           let placesWithKeyword = [];
      //           if (arrayRelativeKeyword.length > 0) {
      //             placesWithKeyword = filterPlaceWithKeyword(places, arrayRelativeKeyword);
      //             if (placesWithKeyword.length > 0) {
      //               isRelative = true;
      //               places = placesWithKeyword;
      //             }
      //           }
      //
      //           // if don't have any places fit in area => return empty share
      //           if (places.length === 0) {
      //             share = [];
      //             return 0;
      //           } else { // eslint-disable-line no-else-return
      //             // choose random a placement which are collected on above
      //             // const randomIndex = parseInt(Math.floor(Math.random() * (places.length)), 10);
      //             // const place = places[randomIndex];
      //
      //             const place = activePlacement(places, shareConstruct[index]);
      //             console.log('activePlacement', place);
      //             share.push(place.data);
      //           }
      //           return 0;
      //         }, 0);
      //
      //         // if share available => insert monopoly places
      //         if (share.length !== 0) {
      //           // push (all places have type === placementType) into share.
      //           placeMonopolies.reduce((x, y) => share.splice(y.index, 0, y.data), 0);
      //           const SumArea = share.reduce((acc, item) =>
      //           acc + item.PlacementArea, 0);
      //           const Free = this.ZoneArea - SumArea;
      //           console.log('Freeasd', Free);
      //           if (Free === 0 && relativeKeyword !== '' && isRelative) {
      //             console.log('ShareTest', share);
      //             shares.push(share);
      //             isRelative = false;
      //             share = [];
      //           }
      //           if (Free === 0) {
      //             shares.push(share);
      //             isRelative = false;
      //             share = [];
      //           }
      //         }
      //         return '';
      //       }, 0);
      //     }
      //     console.log('shares', shares);
      //     shareTemplate.weight = 100 / shares.length;
      //     for (let i = 0; i < shares.length; i += 1) {
      //       shareTemplate.id = `DS-${i}`;
      //       shareTemplate.placements = shares[i];
      //       const shareData = new Share(shareTemplate);
      //       shareDatas.push(shareData);
      //     }
      //   };
      //   if (monopolyPlaces.length > 0) {
      //     if (placementType === 'pr') {
      //       createShareByPlaceMonopolies(monopolyPlaces);
      //
      //       console.log('shareDatas', shareDatas);
      //       return shareDatas;
      //     }
      //     // collect placements which share the place order with monopoly places ('cpd').
      //     let shareWith = [];
      //     monopolyPlaces.reduce((acc, monopolyPlace) => allPlace.reduce((acc2, place) => {
      //       if (place.index === monopolyPlace.index &&
      //         place.data.revenueType !== monopolyPlace.data.revenueType) {
      //         shareWith.push(place);
      //       }
      //       return 0;
      //     }, 0), 0);
      //     // filter keyword
      //     let shareWithKeyword = [];
      //     if (arrayRelativeKeyword.length > 0) {
      //       shareWithKeyword = filterPlaceWithKeyword(shareWith, arrayRelativeKeyword);
      //       if (shareWithKeyword.length > 0) {
      //         shareWith = shareWithKeyword;
      //       }
      //     }
      //
      //     // mix the monopoly share place with other place. array: monopolyPlace - lib: otherPlace
      //     const createMonopolyPlacesWithShare = (array, lib) => {
      //       const res = [];
      //       array.reduce((acc1, ArrayItem, index1, array1) => {
      //         const replace = (library, index2, arrTemp) => {
      //           const arrayTemp = arrTemp.map(item => item);
      //           library.reduce((acc2, item) => {
      //             if (item.index === array1[index2].index) {
      //               arrayTemp.splice(index2, 1, item);
      //               res.push(arrayTemp);
      //               if (index2 < (arrTemp.length - 1)) {
      //                 replace(library, index2 + 1, arrayTemp);
      //               }
      //             }
      //             return 0;
      //           }, 0);
      //         };
      //         replace(lib, index1, array1);
      //         return 0;
      //       }, 0);
      //       res.push(array);
      //       return res;
      //     };
      //     let combinationMonopolyPlaces = [];
      //     // const numberOfCombination = monopolyPlaces.length;
      //     const monopolyPlacesWithShare = createMonopolyPlacesWithShare(monopolyPlaces, shareWith);
      //     // console.log('monopolyPlaces', monopolyPlaces);
      //     console.log('monopolyPlacesWithShare', monopolyPlacesWithShare);
      //     // variable "conputeAll" to compute all cases combination.
      //     const computeAll = true;
      //     if (computeAll) {
      //       // can use function combinations (1-n combination n)
      //       // instead of k_combination (k Combination n) for compute all cases.
      //       for (let i = 0; i < monopolyPlacesWithShare.length; i += 1) {
      //         combinationMonopolyPlaces = combinationMonopolyPlaces.concat(
      //           util.combinations(monopolyPlacesWithShare[i]).filter(item =>
      //             item.reduce((acc, item2) =>
      //               ((acc + item2.data.PlacementArea) < this.ZoneArea), 0)));
      //       }
      //     } else {
      //       for (let i = 0; i < monopolyPlacesWithShare.length; i += 1) {
      //         combinationMonopolyPlaces = combinationMonopolyPlaces.concat(
      //           util.kCombinations(monopolyPlacesWithShare[i], 1).filter(item =>
      //             item.reduce((acc, item2) =>
      //               ((acc + item2.data.PlacementArea) < this.ZoneArea), 0)));
      //       }
      //     }
      // eslint-disable-next-line
      //     const numberOfMonopoly = shareConstruct.reduce((acc, item) => (item.type === 'cpd' ? (acc + 1) : (acc + 0)), 0);
      //     console.log('numberOfMonopoly', numberOfMonopoly);
      //     console.log('combinationMonopolyPlaces', combinationMonopolyPlaces);
      //     // filter place have revenueType same with share constructor
      //     combinationMonopolyPlaces = combinationMonopolyPlaces.filter(item =>
      //     (item.length >= numberOfMonopoly) && item.reduce((acc, item2, index) => {
      //       if (index === 0) {
      //         return item2.data.revenueType === shareConstruct[item2.index].type;
      //       }
      //       return acc && item2.data.revenueType === shareConstruct[item2.index].type;
      //     }, 0));
      //     console.log('combination', combinationMonopolyPlaces);
      //     combinationMonopolyPlaces.reduce((acc, item) => createShareByPlaceMonopolies(item), 0);
      //
      //     console.log('shareDatas', shareDatas);
      //     return shareDatas;
      //   }
      //   return [];
      // };
      /* eslint-enable */
      const computeShareWithPlacementType2 = (allPlacement, placementType, shareConstruct) => {
        const shareTemplate = {
          id: 'DS',
          name: 'Dynamic Share',
          html: '<div class="hello"></div>',
          css: '.arf-placement{display:inline-block;margin-left:50px;}',
          outputCss: '',
          width: this.width,
          height: this.height,
          classes: '',
          weight: 0,
          type: 'multiple',
          description: `Share ${this.width}x${this.height}`,
          zoneId: this.id,
          sharePlacements: [],
        };
        const shares = [];
        const shareDatas = [];
        const checkShare = shareRatio => listRatio.reduce((acc, item, index) => {
          if (index === 0) {
            const res = util.checkTwoArrayEqual(item.ratio, shareRatio);
            // return { check: res, id: item.id, css: item.css };
            return res;
          }
          const res = acc || util.checkTwoArrayEqual(item.ratio, shareRatio);
          return res;
        }, 0);
        const createShareByPlaceMonopolies = (placeMonopolies) => {
          // Create Share : S(zone) - S(p) = S(free)
          const SumPrArea = placeMonopolies.reduce((temp, item) =>
            (this.zoneType === 'right' ? temp + item.data.height : temp + item.data.width), 0);
          console.log('SumArea', SumPrArea, this.width);
          let FreeArea = this.zoneType === 'right' ? this.height - SumPrArea : this.width - SumPrArea;
          FreeArea = FreeArea < 0 || FreeArea ? 0 : FreeArea;
          console.log('FreeArea', FreeArea);
          // const numberOfParts = getNumberOfParts(FreeArea);
          const numberOfParts = getNumberOfParts(this.zoneType === 'right' ? this.height : this.width);
          console.log('numberOfParts', numberOfParts);
          // listRatio[0].ratio.reduce((acc, item) => acc + item, 0)
          for (let i = 1; i <= numberOfParts; i += 1) {
            // divide share base on free area and number of part.
            const shareRatios = util.ComputeShare(numberOfParts, i);
            console.log('shareRatios', shareRatios);
            // Browse each shareRatio on above and create a share for it.
            shareRatios.reduce((temp, shareRatio) => {
              const checkS = checkShare(shareRatio);
              console.log('checkS', checkS);
              if (checkS) {
                // this variable to store places in a share which are chosen bellow
                const share = { places: [], id: currentShare[0].id, css: getCss(currentShare[0]) };
                // placeMonopolies.reduce((x, y) =>
                // shareRatio.splice(y.index, 0, this.zoneType === 'right' ?
                // getNumberOfParts(y.data.height, true) :
                // getNumberOfParts(y.data.width, true)), 0);
                let isRelative = false;
                // Browse each placeRatio in shareRatio, then find a placement fit it.
                shareRatio.reduce((temp2, placeRatio, index) => {
                  const placeChosen = [];
                  if (placeMonopolies.map(item => item.index).indexOf(index) !== -1) {
                    const listMonopolies = placeMonopolies.filter(x => x.index === index);
                    // push (all places have type === placementType) into share.
                    // listMonopolies.reduce((x, y) => share.places.splice(y.index, 0, y.data), 0);
                    const place = activePlacement(listMonopolies, shareConstruct[index]);
                    console.log('placeMonopoliesInS', listMonopolies, place);
                    placeChosen.push(place);
                    share.places.push(place.data);
                    return 0;
                  }
                  // find all placement fit with area place
                  let places = allPlacement.filter(place => place.index === index);
                  console.log('passed', places);
                  if (places.length > 1) {
                    places = allPlacement.filter(place => (
                      // getNumberOfParts(place.data.height, true) < numberOfParts &&
                    getNumberOfParts(this.zoneType === 'right' ? place.data.height : place.data.width, true) === placeRatio &&
                    // place.data.PlacementArea === placeRatio &&
                    placeMonopolies.indexOf(place) === -1 &&
                    place.data.revenueType !== 'pr' &&
                    (placeChosen.length > 0 ? placeChosen.reduce((acc, item, index2) => { // eslint-disable-line
                      if (index2 === 0) return item.data.id !== place.data.id;
                      return acc && item.data.id !== place.data.id;
                    }, 0) : true) &&
                    place.index === index &&
                    place.data.revenueType === shareConstruct[index].type));
                  }
                  // filter place with relative keyword
                  let placesWithKeyword = [];
                  if (arrayRelativeKeyword.length > 0) {
                    placesWithKeyword = filterPlaceWithKeyword(places, arrayRelativeKeyword);
                    if (placesWithKeyword.length > 0) {
                      isRelative = true;
                      places = placesWithKeyword;
                    }
                  }
                  // if don't have any places fit in area => return empty share
                  if (places.length === 0) {
                    share.places = [];
                    share.id = '';
                    share.css = '';
                    return 0;
                  } else { // eslint-disable-line no-else-return
                    let place;
                    if (places.length === 1) {
                      place = places[0];
                    } else {
                      place = activePlacement(places, shareConstruct[index]);
                    }
                    // console.log('random', places.length, randomIndex);
                    placeChosen.push(place);
                    share.places.push(place.data);
                  }
                  return 0;
                }, 0);
                // if share available => insert monopoly places
                // if (share.places.length !== 0) {
                const SumArea = share.places.reduce((acc, item) =>
                acc + (this.zoneType === 'right' ? item.height : item.width), 0);
                const Free = (this.zoneType === 'right' ? this.height : this.width) - SumArea;
                isRelative = true;
                console.log('testFreeCpd', Free, SumArea);
                if (relativeKeyword !== '' && isRelative) {
                  console.log('ShareTest', share);
                  shares.push(share);
                  isRelative = false;
                  // share.places = [];
                  // share.id = '';
                  // share.css = '';
                }
                if (1) {
                  console.log('ShareTest', share);
                  shares.push(share);
                  isRelative = false;
                  // share.places = [];
                  // share.id = '';
                  // share.css = '';
                }
                // }
                return '';
              }
              return; // eslint-disable-line
            }, 0);
          }
          if (numberOfParts === 0) {
            // this variable to store places in a share which are chosen bellow
            // const share = { places: [], id: currentShare[0].id, css: getCss(currentShare[0]) };
            // placeMonopolies.reduce((x, y) => share.places.splice(y.index, 0, y.data), 0);
            // shares.push(share);
          }
          if (shares.length > 0) {
            shareTemplate.weight = 100 / shares.length;
            for (let i = 0; i < shares.length; i += 1) {
              // shareTemplate.id = `DS-${this.id}-${i}`;
              shareTemplate.id = shares[i].id.replace('share-', '');
              // shareTemplate.outputCss = `#share-DS-${this.id}-${i} ${css}`;
              shareTemplate.outputCss = shares[i].css;
              shareTemplate.placements = shares[i].places;
              // const shareHeight = shares[i].places.reduce((acc, item) =>
              // acc + (this.zoneType === 'right' ? item.height : item.width), 0);
              // shareTemplate.height = shareHeight;
              const shareData = new Share(shareTemplate);
              shareDatas.push(shareData);
            }
          }
          console.log('cpdd');
        };
        const createShareByPlaceCpm = () => {
          const numberOfParts = getNumberOfParts(this.zoneType === 'right' ? this.height : this.width);
          console.log('numberOfParts', numberOfParts);
          for (let i = 1; i <= numberOfParts; i += 1) {
            // divide share base on free area and number of part.
            const shareRatios = util.ComputeShare(numberOfParts, i);
            console.log('shareRatios', shareRatios);
            // Browse each shareRatio on above and create a share for it.
            shareRatios.reduce((temp, shareRatio) => {
              // const checkS = checkShare(shareRatio);
              // turn off check share state.(turn on -> repalce ('1', 'checkS.check'))
              if (1) {
                // this variable to store places in a share which are chosen bellow
                const share = { places: [], id: currentShare[0].id, css: currentShare[0].css };
                const placeChosen = [];
                let isRelative = false;
                // Browse each placeRatio in shareRatio, then find a placement fit it.
                shareRatio.reduce((temp2, placeRatio, index) => {
                  // find all placement fit with area place
                  let places = allPlacement.filter(place => (
                  getNumberOfParts((this.zoneType === 'right' ? place.data.height : place.data.width), true) === placeRatio &&
                  place.data.revenueType !== 'pr' &&
                  (placeChosen.length > 0 ? placeChosen.reduce((acc, item, index2) => { // eslint-disable-line
                    if (index2 === 0) return item.data.id !== place.data.id;
                    return acc && item.data.id !== place.data.id;
                  }, 0) : true) &&
                  place.index === index));

                  // filter place with relative keyword
                  let placesWithKeyword = [];
                  if (arrayRelativeKeyword.length > 0) {
                    placesWithKeyword = filterPlaceWithKeyword(places, arrayRelativeKeyword);
                    if (placesWithKeyword.length > 0) {
                      isRelative = true;
                      places = placesWithKeyword;
                    }
                  }

                  // if don't have any places fit in area => return empty share
                  if (places.length === 0) {
                    share.places = [];
                    share.id = '';
                    share.css = '';
                    return 0;
                  } else { // eslint-disable-line no-else-return
                    // choose random a placement which are collected on above
                    const randomIndex = parseInt(Math.floor(Math.random() * (places.length)), 10);
                    const place = places[randomIndex];
                    console.log('duplicate', placeChosen.indexOf(place), place);
                    placeChosen.push(place);
                    share.places.push(place.data);
                    console.log('shareTestCPM', share);
                  }
                  return 0;
                }, 0);
                console.log('placeChosen', placeChosen);
                // if share available => insert monopoly places
                if (share.length !== 0) {
                  // push (all places have type === placementType) into share.
                  const SumArea = share.places.reduce((acc, item) =>
                  acc + getNumberOfParts(this.zoneType === 'right' ? item.height : item.width, true), 0);
                  const Free = getNumberOfParts(this.zoneType === 'right' ? this.height : this.width) - SumArea;
                  console.log('freeTest', Free);
                  if (Free === 0 && relativeKeyword !== '' && isRelative) {
                    shares.push(share);
                    isRelative = false;
                    // share.places = [];
                    // share.id = '';
                    // share.css = '';
                  }
                  if (Free === 0) {
                    shares.push(share);
                    isRelative = false;
                    // share.places = [];
                    // share.id = '';
                    // share.css = '';
                  }
                }
                return '';
              }
              return; //eslint-disable-line
            }, 0);
          }
          if (shares.length > 0) {
            shareTemplate.weight = 100 / shares.length;
            for (let i = 0; i < shares.length; i += 1) {
              // shareTemplate.id = `DS-${this.id}-${i}`;
              shareTemplate.id = shares[i].id.replace('share-', '');
              // const css = getCss(shares[i]);
              // console.log('css', css);
              // shareTemplate.outputCss = `#share-DS-${this.id}-${i} ${css}`;
              shareTemplate.outputCss = shares[i].css;
              shareTemplate.placements = shares[i].places;
              const shareData = new Share(shareTemplate);
              shareDatas.push(shareData);
            }
          }
          console.log('cpmmm');
        };

        if (placementType !== 'cpm') {
          // get all places have type === placementType
          const monopolyPlaces = allPlacement.filter(y =>
          y.data.AdsType.revenueType === placementType);
          console.log('monopolyPlaces2', monopolyPlaces);
          if (monopolyPlaces.length > 0) {
            if (placementType === 'pr') {
              createShareByPlaceMonopolies(monopolyPlaces);
              return shareDatas;
            }
            // mix the monopoly share place with other place. array: monopolyPlace - lib: otherPlace
            const createMonopolyPlacesWithShare = (array, lib) => {
              const res = [];
              if (lib.length > 0) {
                const replace = (library, index2, arrTemp) => {
                  const arrayTemp = arrTemp.map(item => item);
                  library.reduce((acc2, item) => {
                    if (item.index === array[index2].index) {
                      arrayTemp.splice(index2, 1, item);
                      res.push(arrayTemp);
                      if (index2 < (arrTemp.length - 1)) {
                        replace(library, index2 + 1, arrayTemp);
                      }
                    }
                    return 0;
                  }, 0);
                };
                array.reduce((acc1, ArrayItem, index1, array1) => {
                  replace(lib, index1, array1);
                  return 0;
                }, 0);
                res.push(array);
              } else res.push(array);
              return res;
            };
            let combinationMonopolyPlaces = [];
            // const numberOfCombination = monopolyPlaces.length;
            // collect placements which share the place order with monopoly places ('cpd').
            let shareWith = [];
            monopolyPlaces.reduce((acc, monopolyPlace) => allPlace.reduce((acc2, place) => { // eslint-disable-line
              if (place.index === monopolyPlace.index &&
                place.data.revenueType !== monopolyPlace.data.revenueType) {
                if (shareWith.indexOf(place) === -1) {
                  shareWith.push(place);
                }
              }
            }, 0), 0);
            console.log('shareWith', shareWith);
            // filter keyword
            let shareWithKeyword = [];
            if (arrayRelativeKeyword.length > 0) {
              shareWithKeyword = filterPlaceWithKeyword(shareWith, arrayRelativeKeyword);
              if (shareWithKeyword.length > 0) {
                shareWith = shareWithKeyword;
              }
            }
            let monopolyPlacesWithShare = createMonopolyPlacesWithShare(monopolyPlaces, shareWith); //eslint-disable-line

            // monopolyPlaces = monopolyPlaces.filter(item =>
            // item.data.revenueType === shareConstruct[item.index].type);

            console.log('monopolyPlacesWithShare1', monopolyPlacesWithShare);
            // console.log('monopolyPlaces', monopolyPlaces);
            const numberOfMonopoly = shareConstruct.reduce((acc, item) =>
              (item.type === 'cpd' ? (acc + 1) : (acc + 0)), 0);
            // variable "conputeAll" to compute all cases combination.
            const computeAll = false;
            if (computeAll) {
              // can use function combinations (1-n combination n)
              // instead of k_combination (k Combination n) for compute all cases.
              for (let i = 0; i < monopolyPlacesWithShare.length; i += 1) {
                combinationMonopolyPlaces = combinationMonopolyPlaces.concat(
                  util.combinations(monopolyPlacesWithShare[i]));
              }
            } else {
              // get number of index value in monopoly place (unique)
              // const numberOfK = monopolyPlaces.map(x => x.index).filter((value, index, self) =>
              // self.indexOf(value) === index).length;
              // console.log('numberOfK', numberOfK);
              // const randomK = Math.floor(Math.random() * numberOfK) + 1;
              const K = shareConstruct.filter(x => (x.type === 'cpd' || x.type === 'pr')).length;
              monopolyPlacesWithShare = monopolyPlacesWithShare.filter(item =>
              (item.length >= numberOfMonopoly) && item.reduce((acc, item2, index) => {
                if (index === 0) {
                  return item2.data.revenueType === shareConstruct[item2.index].type;
                }
                return acc && item2.data.revenueType === shareConstruct[item2.index].type;
              }, 0));
              console.log('monopolyPlacesWithShare2', monopolyPlacesWithShare);
              for (let i = 0; i < monopolyPlacesWithShare.length; i += 1) {
                combinationMonopolyPlaces = combinationMonopolyPlaces.concat(
                    util.kCombinations(monopolyPlacesWithShare[i], K));
              }
            }
            combinationMonopolyPlaces = combinationMonopolyPlaces.filter(item =>
            (item.length >= numberOfMonopoly) && item.reduce((acc, item2, index) => {
              if (index === 0) {
                return item2.data.revenueType === shareConstruct[item2.index].type;
              }
              return acc && item2.data.revenueType === shareConstruct[item2.index].type;
            }, 0));
            console.log('combination1', combinationMonopolyPlaces);
            // eslint-disable-next-line
            // combinationMonopolyPlaces = combinationMonopolyPlaces.filter(item => item.reduce((acc, item2) => acc + (this.zoneType === 'right' ? item2.data.height : item2.data.width), 0) <= (this.zoneType === 'right' ? this.height : this.width));
            // console.log('combination2', combinationMonopolyPlaces);
            combinationMonopolyPlaces.reduce((acc, item) => createShareByPlaceMonopolies(item), 0);

            return shareDatas;
          }
        } else {
          console.log('shareData', placementType, shareDatas, this.zoneType);
          createShareByPlaceCpm();
        }
        return shareDatas;
      };
      const shareConstruct = [];
      // if cpdShare take all share percent in a place order -> filter
      for (let i = 0; i < numberOfPlaceInShare; i += 1) {
        const isPr = allPlace.filter(place => place.index === i && place.data.revenueType === 'pr').length > 0;
        const totalCPDSharePercent = allPlace.filter(place =>
        place.index === i && place.data.revenueType === 'cpd').reduce((acc, place) =>
        acc + (place.data.cpdPercent * place.data.PlacementArea), 0);
        if (isPr) {
          shareConstruct.push([
            { type: 'pr', weight: 100 },
            { type: 'cpd', weight: 0 },
            { type: 'cpm', weight: 0 }]);
        } else {
          shareConstruct.push([
            { type: 'pr', weight: 0 },
            { type: 'cpd', weight: totalCPDSharePercent },
            { type: 'cpm', weight: 100 - totalCPDSharePercent }]);
          console.log('totalCPDSharePercent', totalCPDSharePercent, i);
        }
      }

      let cookie = adsStorage.getStorage('_cpt');
      let zoneCookie = adsStorage.subCookie(cookie, `${this.id}:`, 0);
      zoneCookie = zoneCookie.slice(zoneCookie.indexOf(':') + 1);
      const ShareRendered = zoneCookie.split('|');
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
      // build construct of current share.
      let lastThreeShare = ShareRendered.slice(Math.max(ShareRendered.length - 3, 1));
      // console.log('lastThreeShare', lastThreeShare);
      const numberOfChannel = util.uniqueItem(lastThreeShare.map(item => item.split(')(')[0])).length;
      if (numberOfChannel > 1) {
        lastThreeShare = [];
        const domain = util.getThisChannel(term.getCurrentDomain('Site:Pageurl')).slice(0, 2).join('.');
        cookie = `${cookie}`.replace(zoneCookie, '');
        adsStorage.setStorage('_cpt', cookie, '', '/', domain);
      }
      const buildShareConstruct = [];
      for (let i = 0; i < numberOfPlaceInShare; i += 1) {
        if (shareConstruct[i][0].weight === 100) {
          buildShareConstruct.push(shareConstruct[i][0]);
        } else {
          const lastPlaceType = [];
          lastThreeShare.reduce((acc, share) => {
            const shareTemp = share.split('][');
            shareTemp.reduce((acc2, item, index) => {
              if (index === i) {
                lastPlaceType.push(item.split(')(')[2]);
              }
              return 0;
            }, 0);
            return 0;
          }, 0);
          console.log('lastPlaceType', lastPlaceType, i);

          const cpdPercent = shareConstruct[i][1].weight;
          const cpdAppear = lastPlaceType.reduce((acc, place) =>
            (place === 'cpd' ? acc + 1 : acc + 0), 0);
          const cpmAppear = lastPlaceType.reduce((acc, place) =>
            (place === 'cpm' ? acc + 1 : acc + 0), 0);
          console.log('cpmAppear', cpmAppear, cpdAppear);
          if (cpdPercent > 0 && cpdPercent <= (100 / 3)) {
            console.log('everyThings1', shareConstruct);
            let isRemove = false;
            if (cpdAppear >= 1 && lastPlaceType.length >= 1) {
              shareConstruct[i].splice(1, 1);
              isRemove = true;
            }
            if (cpmAppear >= 2 && lastPlaceType.length >= 2) {
              if (isRemove === false) shareConstruct[i].splice(2, 1);
            }
          } else if (cpdPercent > (100 / 3) && cpdPercent <= (200 / 3)) {
            let isRemove = false;
            if (cpmAppear >= 1 && lastPlaceType.length >= 2) {
              if (lastPlaceType[2] === 'cpm' || lastPlaceType[1] === 'cpm') {
                shareConstruct[i].splice(2, 1);
                isRemove = true;
              }
            }
            if (cpdAppear >= 2 && lastPlaceType.length >= 2) {
              if (isRemove === false) shareConstruct[i].splice(1, 1);
            }
          }
          console.log('everyThings2', shareConstruct);
          const activeType = activeRevenue(shareConstruct[i]);
          console.log('everyThings3', activeType);
          buildShareConstruct.push(activeType);
        }
      }
      console.log('buildShareConstruct', buildShareConstruct);
      const pr = computeShareWithPlacementType2(allPlace, 'pr', buildShareConstruct);
      if (pr.length > 0) {
        console.log('prShare', pr);
        return pr;
      }
      console.log('cpdShare');
      let cpdShare = computeShareWithPlacementType2(allPlace, 'cpd', buildShareConstruct);
      if (cpdShare.length > 0) {
        for (let i = 0; i < numberOfPlaceInShare; i += 1) {
          if (100 - shareConstruct[i][0].weight <= 0) {
            cpdShare = cpdShare.filter(share => share.placements[i].revenueType === 'cpd');
          }
        }
        console.log('cpdShare', cpdShare);
        return cpdShare;
      }
      const cpmShare = computeShareWithPlacementType2(allPlace, 'cpm', buildShareConstruct);
      console.log('cpmShare', cpmShare);
      if (cpmShare.length > 0) {
        return cpmShare;
      }
    }
    return [];
  }

  /**
   * create all share and filter them fit with conditions
   */

  filterShare(relativeKeyword) {
    /**
     * [region: create Share construct]
     *
     */
    const allShare = this.allShares();
    let allSharePlace = allShare.reduce((acc, item, index) => { // eslint-disable-line
      if (index === 0) {
        return item.allsharePlacements;
      }
      return acc.concat(item.allsharePlacements);
    }, 0);
    allSharePlace.reduce((acc, item) => { // eslint-disable-line
      if (item.positionOnShare !== 0) item.positionOnShare = item.positionOnShare - 1; // eslint-disable-line
    }, 0);

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
    const minPlace = getMinPlace(allSharePlace);

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
    for (let i = 0; i < numberOfPlaceInShare; i += 1) {
      const allSharePlaceInThisPosition = allSharePlace.filter(place =>
      place.positionOnShare === i);
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
            acc2 + (place.placement.cpdPercent * (this.zoneType === 'right' ? getNumberOfParts(place.placement.height, true) : getNumberOfParts(place.placement.width, true))), 0);
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
    const numberOfChannel = util.uniqueItem(lastThreeShare.map(item => item.split(')(')[0])).length;
    if (numberOfChannel > 1) {
      lastThreeShare = [];
      const domain = util.getThisChannel(term.getCurrentDomain('Site:Pageurl')).slice(0, 2).join('.');
      cookie = `${cookie}`.replace(zoneCookie, '');
      adsStorage.setStorage('_cpt', cookie, '', '/', domain);
    }
    const constructShareStructure = [];
    for (let i = 0; i < numberOfPlaceInShare; i += 1) {
      if (shareConstruct[i][0].weight === 100) {
        constructShareStructure.push(shareConstruct[i][0]);
      } else {
        const lastPlaceType = [];
        lastThreeShare.reduce((acc, share) => {
          const shareTemp = share.split('][');
          shareTemp.reduce((acc2, item, index) => {
            if (index === i) {
              lastPlaceType.push(item.split(')(')[2]);
            }
            return 0;
          }, 0);
          return 0;
        }, 0);
        console.log('lastPlaceType', lastPlaceType, i);

        const cpdPercent = shareConstruct[i][1].weight;
        const cpdAppear = lastPlaceType.reduce((acc, place) =>
          (place === 'cpd' ? acc + 1 : acc + 0), 0);
        const cpmAppear = lastPlaceType.reduce((acc, place) =>
          (place === 'cpm' ? acc + 1 : acc + 0), 0);
        console.log('cpmAppear', cpmAppear, cpdAppear);
        if (cpdPercent > 0 && cpdPercent <= (100 / 3)) {
          console.log('everyThings1', shareConstruct);
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
        console.log('everyThings2', shareConstruct);
        const activeType = activeRevenue(shareConstruct[i]);
        console.log('everyThings3', activeType);
        constructShareStructure.push(activeType);
      }
    }
    console.log('buildShareConstructXXX', constructShareStructure);
    /**
     * [end region: create Share structure]
     */
    /**
     * filer placements suit with share structure and channel
     */
               /* filter place fit with share construct */
    allSharePlace = allSharePlace.filter(item =>
    item.placement.revenueType === constructShareStructure[item.positionOnShare].type);

                /* filter place fit with current channel */
    allSharePlace = allSharePlace.filter(place =>
      place.placement.filterBanner().length > 0);
    console.log('filterPlacement', allSharePlace);
    /**
     * end
     */

    /**
     * get all monopoly placements
     */
    const monopolyPlaces = allSharePlace.filter(y =>
    y.placement.AdsType.revenueType === 'pa' || y.placement.AdsType.revenueType === 'cpd');
    console.log('monopolyPlacements', monopolyPlaces);
    /**
     * end
     */

    /**
     * get share format in data
     */
    const shareFormats = allShare.map(x => (x.type === 'single' ? [1] : x.format.split(',')));
    const checkShareFormat = format =>
      shareFormats.reduce((acc, item, index) => {
        if (index === 0) return util.checkTwoArrayEqual(item, format);
        return acc || util.checkTwoArrayEqual(item, format);
      }, 0);
    const getShareInfo = (format) => {
      for (let i = 0, length = allShare.length; i < length; i += 1) {
        if (allShare[i].format !== format.join()) {
          return allShare[i];
        }
      }
      return false;
    };
    /**
     * end
     */
    const activePlacement = (allPlaces, type) => {
      const randomNumber = Math.random() * 100;
      const ratio = allPlaces.reduce((tmp, place) => ((type === 'cpd' ? place.placement.cpdPercent : place.placement.weight) + tmp), 0) / 100;
      return allPlaces.reduce((range, placement) => {
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
    const filterPlaceWithKeyword = (places, arrRelativeKeyword) => {
      const placesWithKeyword = places.filter(place =>
        place.data.allBanners.reduce((acc1, banner) => {
          const bannerKeyword = banner.keyword.split(',').map(item => item.replace(' ', ''));
          return arrRelativeKeyword.filter(key =>
              bannerKeyword.reduce((acc2, bannerKey, index2) =>
                (index2 === 0 ? bannerKey === key :
                  (acc2 || bannerKey === key)), 0)).length > 0;
        }, 0));
      return placesWithKeyword;
    };
    const createShare = (placeMonopolies) => {
      const shares = [];
      const shareDatas = [];
      const arrayRelativeKeyword = [];
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
          const checkS = checkShareFormat(shareFormat);
          console.log('checkSnew', checkS);
          if (checkS) {
            /*

             this variable to store places in a share which are chosen bellow.

             */
            const shareInfo = getShareInfo(shareFormat);
            const share = { places: [], id: shareInfo.id, css: shareInfo.css };
            let isRelative = false;
            /*

             Browse each placeRatio in shareRatio, then find a placement fit it.

             */
            shareFormat.reduce((temp2, placeRatio, index) => {
              const placeChosen = [];
                                       /* fill monopoly place first */
              const listMonopolies = placeMonopolies.filter(x => x.positionOnShare === index &&
              getNumberOfParts(this.zoneType === 'right' ? x.placement.height : x.placement.width) === placeRatio);
              if (placeMonopolies.map(item => item.positionOnShare).indexOf(index) !== -1 &&
                listMonopolies.length > 0) {
                const place = listMonopolies.length === 1 ? listMonopolies[0] :
                  activePlacement(listMonopolies, shareConstruct[index]);
                placeChosen.push(place);
                share.places.push(place.placement);
                return 0;
              }
              /*

               Then, find all placement fit with area place for the rest part.

               */
              const normalPlace = allSharePlace.filter(place => place.placement.revenueType !== 'pb' && place.positionOnShare === index);
              const passBackPlaces = allSharePlace.filter(place => place.placement.revenueType === 'pb' && place.positionOnShare === index);
              let places = normalPlace.filter(place => (
                getNumberOfParts(this.zoneType === 'right' ? place.placement.height : place.placement.width) === placeRatio &&
                (placeChosen.length > 0 ? placeChosen.reduce((acc, item, index2) => { // eslint-disable-line
                  if (index2 === 0) return item.placement.id !== place.placement.id;
                  return acc && item.placement.id !== place.placement.id;
                }, 0) : true) &&
                place.placement.revenueType === constructShareStructure[index].type));
              console.log('placementsForShare', places);
              /*

               filter place with relative keyword

                */
              let placesWithKeyword = [];
              if (arrayRelativeKeyword.length > 0) {
                placesWithKeyword = filterPlaceWithKeyword(places, arrayRelativeKeyword);
                if (placesWithKeyword.length > 0) {
                  isRelative = true;
                  places = placesWithKeyword;
                }
              }
              /* fill pass back place if don't have any placement fit with conditional */
              if (places.length === 0) {
                places = passBackPlaces.filter(place => (
                getNumberOfParts(this.zoneType === 'right' ? place.placement.height : place.placement.width) === placeRatio &&
                (placeChosen.length > 0 ? placeChosen.reduce((acc, item, index2) => { // eslint-disable-line
                  if (index2 === 0) return item.placement.id !== place.placement.id;
                  return acc && item.placement.id !== place.placement.id;
                }, 0) : true)));
              }
              /*

               if don't have any places fit in area => return empty share.

               */
              if (places.length === 0) {
                share.places = [];
                share.id = '';
                share.css = '';
                return 0;
              } else { // eslint-disable-line no-else-return
                let place;
                if (places.length === 1) {
                  place = places[0];
                } else {
                  place = activePlacement(places, constructShareStructure[index]);
                }

                placeChosen.push(place);
                share.places.push(place.placement);
              }
              return 0;
            }, 0);
            if (relativeKeyword !== '' && isRelative) {
              console.log('ShareTest', share);
              shares.push(share);
              isRelative = false;
            }
            console.log('ShareTest', share);
            shares.push(share);
            isRelative = false;
            return '';
          }
          return; // eslint-disable-line
        }, 0);
      }
      if (shares.length > 0) {
        const weight = 100 / shares.length;
        for (let i = 0; i < shares.length; i += 1) {
          const id = shares[i].id.replace('share-', '');
          const outputCss = shares[i].css;
          const placements = shares[i].places;
          const newShare = new Share({ id, outputCss, placements, weight });
          shareDatas.push(newShare);
        }
      }
      return shareDatas;
    };
    const result = createShare(monopolyPlaces);
    console.log('newShareFilter', result);
    return result;
  }

  /**
   * Get a active share randomly by its weight
   * @return {Share}
   */
  activeShare(relativeKeyword) {
    const allShare = this.filterShare(relativeKeyword);
    if (allShare.length > 0) {
      const randomNumber = Math.random() * 100;
      const ratio = allShare.reduce((tmp, share) => {
        if (share.weight === undefined) {
            share.weight = 100 / allShare.length; // eslint-disable-line
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
    const zoneID = this.id;
    const domain = encodeURIComponent(term.getCurrentDomain('Site:Pageurl'));
    const domainLog = 'http://lg1.logging.admicro.vn';
    const linkLog = `${domainLog}/advbcms?dmn=${domain}&zid=${zoneID}`;
    console.log('ZoneLog', linkLog);
    const img = new Image();
    img.src = linkLog;
  }
}

export default Zone;
