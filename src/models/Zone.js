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
  get allShares() {
    return this.shares.map(share => new Share(share));
  }

  get ZoneArea() {
    return util.convertArea(this.height, this.width);
  }

  get filterShare() {
    const allShare = this.allShares;
    const Prs = [];
    const Cpds = [];
    const Cpms = [];

    // filler pr places
    const prShare = allShare.filter((share) => {
      const places = share.activePlacements();

      const prPlaces = places.filter(y => y.AdsType === 'pr');
      if (prPlaces.length > 0) {
        return prPlaces.reduce((acc, pr) => {
          Prs.push(pr);
          // check banner in this placement
          if (pr.filterBanner().length === 0) {
            return false;
          }
          return true;
        }, 0);
      }
      return false;
    });

    if (prShare.length > 0) {
      return prShare;
    }

    // filter cpd places
    let cpdShare = [];
    if (Prs.length === 0) {
      cpdShare = allShare.filter((share) => {
        const places = share.activePlacements();

        const cpdPlaces = places.filter(y => y.AdsType === 'cpd');
        if (cpdPlaces.length !== 0) {
          return cpdPlaces.reduce((acc, cpd) => {
            Cpds.push(cpd);
            // check banner available in placement
            if (cpd.filterBanner().length === 0) {
              return false;
            }
            return true;
          }, 0);
        }

        return false;
      });
    }

    if (cpdShare.length > 0) {
      // console.log('abc', cpdShare);
      return cpdShare;
    }

    // filter cpm places
    let cpmShare = [];
    if (Cpds.length === 0) {
      cpmShare = allShare.filter((share) => {
        const places = share.activePlacements();

        const cpmPlaces = places.filter(y => y.AdsType === 'cpm');
        if (cpmPlaces.length !== 0) {
          return cpmPlaces.reduce((acc, cpm) => {
            Cpms.push(cpm);
            // check banner available in placement
            if (cpm.filterBanner().length === 0) {
              return false;
            }
            return true;
          }, 0);
        }

        return false;
      });
    }

    if (cpmShare.length > 0) {
      return cpmShare;
    }
    // console.log(allShare);
    return allShare;
  }

  filterShareDynamic(relativeKeyword) {
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
    let arrayRelativeKeyword = [];
    const allShare = this.allShares;
    let allPlace = [];
    this.allShares.reduce((temp, share) => {
      const isUsePlacePosition = share.allPlacements.reduce((acc, item, index) => {
        if (index === 0) {
          return item.positionOnShare === undefined || item.positionOnShare === 0;
        }
        return acc && (item.positionOnShare === undefined || item.positionOnShare === 0);
      }, 0);
      if (isUsePlacePosition) {
        return allPlace.push(share.allPlacements.map(item =>
          ({ data: item, index: item.positionOnShare - 1 })));
      }
      return allPlace.push(share.allPlacements.map((item, index) =>
          ({ data: item, index })));
    }, 0);
    allPlace = util.flatten(allPlace);
    arrayRelativeKeyword = relativeKeyword.split(',').map(item => item.replace(' ', ''));
    console.log('arrayRelativeKeyword', relativeKeyword, arrayRelativeKeyword);
    // console.log('all Place', allPlace);]
    // get place min area
    const getMinPlace = (allPlaces) => {
      let min = allPlaces[0].data.height;
      for (let i = 0, leng = allPlaces.length; i < leng; i += 1) {
        if (allPlaces[i].data.height < min) {
          min = allPlaces[i].data.height;
        }
      }
      return min;
    };
    const minPlace = getMinPlace(allPlace);
    const getNumberOfParts = (height, isRoundUp) => {
      if (height % minPlace > 0 && isRoundUp) {
        return Math.round(height / minPlace) + 1;
      }
      return Math.round(height / minPlace);
    };
    console.log(getNumberOfParts(this.height));
    const computeShareWithPlacementType = (allPlacement, placementType, shareConstruct) => {
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
        placements: [],
      };
      const shares = [];
      const shareDatas = [];

      // get all places have type === placementType
      const monopolyPlaces = allPlacement.filter(y => y.data.AdsType.revenueType === placementType);
      console.log('monopolyPlaces', monopolyPlaces);
      const createShareByPlaceMonopolies = (placeMonopolies) => {
        // Create Share : S(zone) - S(p) = S(free)
        const SumPrArea = placeMonopolies.reduce((temp, item) =>
        temp + item.data.PlacementArea, 0);
        const FreeArea = this.ZoneArea - SumPrArea;
        // console.log('FreeArea', FreeArea);

        for (let i = 1; i <= FreeArea; i += 1) {
          // console.log('i', i);
          // divide share base on free area and number of part.
          const shareRatios = util.ComputeShare(FreeArea, i);
          console.log('shareRatios', shareRatios);
          // Browse each shareRatio on above and create a share for it.
          shareRatios.reduce((temp, shareRatio) => {
            console.log('shareRatio', shareRatio);
            // this variable to store places in a share which are chosen bellow
            let share = [];
            placeMonopolies.reduce((x, y) =>
              shareRatio.splice(y.index, 0, y.data.PlacementArea), 0);
            let isRelative = false;
            // Browse each placeRatio in shareRatio, then find a placement fit it.
            shareRatio.reduce((temp2, placeRatio, index) => {
              console.log('placeRatio', placeRatio);
              if (placeMonopolies.map(item => item.index).indexOf(index) !== -1) {
                return 0;
              }
              // find all placement fit with area place
              let places = allPlacement.filter(place =>
                (place.data.PlacementArea === placeRatio &&
                placeMonopolies.indexOf(place) === -1 &&
                place.data.revenueType !== 'pr' &&
                // placeChosen.indexOf(place) === -1 &&
                place.index === index &&
                place.data.revenueType === shareConstruct[index].type));

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
                share = [];
                return 0;
              } else { // eslint-disable-line no-else-return
                // choose random a placement which are collected on above
                // const randomIndex = parseInt(Math.floor(Math.random() * (places.length)), 10);
                // const place = places[randomIndex];

                const place = activePlacement(places, shareConstruct[index]);
                console.log('activePlacement', place);
                share.push(place.data);
              }
              return 0;
            }, 0);

            // if share available => insert monopoly places
            if (share.length !== 0) {
              // push (all places have type === placementType) into share.
              placeMonopolies.reduce((x, y) => share.splice(y.index, 0, y.data), 0);
              const SumArea = share.reduce((acc, item) =>
              acc + item.PlacementArea, 0);
              const Free = this.ZoneArea - SumArea;
              if (Free === 0 && relativeKeyword !== '' && isRelative) {
                shares.push(share);
                isRelative = false;
              }
              share = [];
            }
            return '';
          }, 0);
        }
        console.log('shares', shares);
        shareTemplate.weight = 100 / shares.length;
        for (let i = 0; i < shares.length; i += 1) {
          shareTemplate.id = `DS-${i}`;
          shareTemplate.placements = shares[i];
          const shareData = new Share(shareTemplate);
          shareDatas.push(shareData);
        }
      };
      if (monopolyPlaces.length > 0) {
        if (placementType === 'pr') {
          createShareByPlaceMonopolies(monopolyPlaces);

          console.log('shareDatas', shareDatas);
          return shareDatas;
        }
        // collect placements which share the place order with monopoly places ('cpd').
        let shareWith = [];
        monopolyPlaces.reduce((acc, monopolyPlace) => allPlace.reduce((acc2, place) => {
          if (place.index === monopolyPlace.index &&
            place.data.revenueType !== monopolyPlace.data.revenueType) {
            shareWith.push(place);
          }
          return 0;
        }, 0), 0);
        // filter keyword
        let shareWithKeyword = [];
        if (arrayRelativeKeyword.length > 0) {
          shareWithKeyword = filterPlaceWithKeyword(shareWith, arrayRelativeKeyword);
          if (shareWithKeyword.length > 0) {
            shareWith = shareWithKeyword;
          }
        }

        // mix the monopoly share place with other place. array: monopolyPlace - lib: otherPlace
        const createMonopolyPlacesWithShare = (array, lib) => {
          const res = [];
          array.reduce((acc1, ArrayItem, index1, array1) => {
            const replace = (library, index2, arrTemp) => {
              const arrayTemp = arrTemp.map(item => item);
              library.reduce((acc2, item) => {
                if (item.index === array1[index2].index) {
                  arrayTemp.splice(index2, 1, item);
                  res.push(arrayTemp);
                  if (index2 < (arrTemp.length - 1)) {
                    replace(library, index2 + 1, arrayTemp);
                  }
                }
                return 0;
              }, 0);
            };
            replace(lib, index1, array1);
            return 0;
          }, 0);
          res.push(array);
          return res;
        };
        let combinationMonopolyPlaces = [];
        // const numberOfCombination = monopolyPlaces.length;
        const monopolyPlacesWithShare = createMonopolyPlacesWithShare(monopolyPlaces, shareWith);
        // console.log('monopolyPlaces', monopolyPlaces);
        console.log('monopolyPlacesWithShare', monopolyPlacesWithShare);
        // variable "conputeAll" to compute all cases combination.
        const computeAll = true;
        if (computeAll) {
          // can use function combinations (1-n combination n)
          // instead of k_combination (k Combination n) for compute all cases.
          for (let i = 0; i < monopolyPlacesWithShare.length; i += 1) {
            combinationMonopolyPlaces = combinationMonopolyPlaces.concat(
              util.combinations(monopolyPlacesWithShare[i]).filter(item =>
                item.reduce((acc, item2) =>
                  ((acc + item2.data.PlacementArea) < this.ZoneArea), 0)));
          }
        } else {
          for (let i = 0; i < monopolyPlacesWithShare.length; i += 1) {
            combinationMonopolyPlaces = combinationMonopolyPlaces.concat(
              util.k_combinations(monopolyPlacesWithShare[i], 1).filter(item =>
                item.reduce((acc, item2) =>
                  ((acc + item2.data.PlacementArea) < this.ZoneArea), 0)));
          }
        }
        const numberOfMonopoly = shareConstruct.reduce((acc, item) => (item.type === 'cpd' ? (acc + 1) : (acc + 0)), 0);
        console.log('numberOfMonopoly', numberOfMonopoly);
        console.log('combinationMonopolyPlaces', combinationMonopolyPlaces);
        // filter place have revenueType same with share constructor
        combinationMonopolyPlaces = combinationMonopolyPlaces.filter(item =>
        (item.length >= numberOfMonopoly) && item.reduce((acc, item2, index) => {
          if (index === 0) {
            return item2.data.revenueType === shareConstruct[item2.index].type;
          }
          return acc && item2.data.revenueType === shareConstruct[item2.index].type;
        }, 0));
        console.log('combination', combinationMonopolyPlaces);
        combinationMonopolyPlaces.reduce((acc, item) => createShareByPlaceMonopolies(item), 0);

        console.log('shareDatas', shareDatas);
        return shareDatas;
      }
      return [];
    };
    // const computeShareWithPlacementType2 = (allPlacement, placementType, shareConstruct) => {
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
    //   const monopolyPlaces = allPlacement.filter(y =>
    // y.data.AdsType.revenueType === placementType);
    //   console.log('monopolyPlaces2', monopolyPlaces);
    //   const createShareByPlaceMonopolies = (placeMonopolies) => {
    //     // Create Share : S(zone) - S(p) = S(free)
    //     const SumPrArea = placeMonopolies.reduce((temp, item) =>
    //     temp + item.data.height, 0);
    //     const FreeArea = this.height - SumPrArea;
    //     // console.log('FreeArea', FreeArea);
    //     const numberOfParts = getNumberOfParts(FreeArea);
    //     for (let i = 1; i <= numberOfParts; i += 1) {
    //       // console.log('i', i);
    //       // divide share base on free area and number of part.
    //       const shareRatios = util.ComputeShare(numberOfParts, i);
    //       // console.log('shareRatios', shareRatios);
    //       // Browse each shareRatio on above and create a share for it.
    //       shareRatios.reduce((temp, shareRatio) => {
    //         // console.log('shareRatio', shareRatio);
    //         // this variable to store places in a share which are chosen bellow
    //         let share = [];
    //         placeMonopolies.reduce((x, y) =>
    //           shareRatio.splice(y.index, 0, y.data.PlacementArea), 0);
    //         let isRelative = false;
    //         // Browse each placeRatio in shareRatio, then find a placement fit it.
    //         shareRatio.reduce((temp2, placeRatio, index) => {
    //           // console.log('placeRatio', placeRatio);
    //           if (placeMonopolies.map(item => item.index).indexOf(index) !== -1) {
    //             return 0;
    //           }
    //           // find all placement fit with area place
    //           let places = allPlacement.filter(place =>
    //             (
    //             // getNumberOfParts(place.data.height, true) < numberOfParts &&
    //             getNumberOfParts(place.data.height, true) === placeRatio &&
    //             // place.data.PlacementArea === placeRatio &&
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
    //             // console.log('random', places.length, randomIndex);
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
    //           if (Free === 0 && relativeKeyword !== '' && isRelative) {
    //             shares.push(share);
    //             isRelative = false;
    //           }
    //           share = [];
    //         }
    //
    //         return '';
    //       }, 0);
    //     }
    //
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
    //       console.log('shareDatas2', shareDatas);
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
    //           util.k_combinations(monopolyPlacesWithShare[i], 1).filter(item =>
    //             item.reduce((acc, item2) =>
    //               ((acc + item2.data.PlacementArea) < this.ZoneArea), 0)));
    //       }
    //     }
    //     const numberOfMonopoly = shareConstruct.reduce((acc, item) =>
    // (item.type === 'cpd' ? (acc + 1) : (acc + 0)), 0);
    //     combinationMonopolyPlaces = combinationMonopolyPlaces.filter(item =>
    //     (item.length >= numberOfMonopoly) && item.reduce((acc, item2, index) => {
    //       if (index === 0) {
    //         return item2.data.revenueType === shareConstruct[item2.index].type;
    //       }
    //       return acc && item2.data.revenueType === shareConstruct[item2.index].type;
    //     }, 0));
    //     console.log('combination2', combinationMonopolyPlaces);
    //     combinationMonopolyPlaces.reduce((acc, item) => createShareByPlaceMonopolies(item), 0);
    //
    //     console.log('shareDatas2', shareDatas);
    //     return shareDatas;
    //   }
    //   return [];
    // };
    // if cpdShare take all share percent in a place order -> filter
    const numberOfPlaceInShare = this.ZoneArea;
    const shareConstruct = [];
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
    // console.log('lastShare', this.id, ShareRendered);
    const activeRevenue = (allRevenueType) => {
      const randomNumber = Math.random() * 100;

      const ratio = allRevenueType.reduce((acc, revenueType) =>
          (revenueType.weight + acc), 0) / 100;

      const res = allRevenueType.reduce((acc, revenueType) => {
        const nextRange = acc + (revenueType.weight / ratio);

        if (typeof acc === 'object') {
          return acc;
        }

        if (randomNumber >= acc && randomNumber < nextRange) {
          return revenueType;
        }

        return nextRange;
      }, 0);
      return res;
    };
    // build construct of current share.
    let lastThreeShare = ShareRendered.slice(Math.max(ShareRendered.length - 3, 1));
    // console.log('lastThreeShare', lastThreeShare);
    const numberOfChannel = util.uniqueItem(lastThreeShare.map(item => item.split(')(')[0])).length;
    console.log('domain', numberOfChannel);
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
          (place.type === 'cpd' ? acc + 1 : acc + 0), 0);
        if (cpdPercent > 0 && cpdPercent <= (100 / 3)) {
          if (cpdAppear === 1 && lastPlaceType.length > 1) {
            shareConstruct[i].splice(1, 1);
          }
        } else if (cpdPercent > 33 && cpdPercent <= (200 / 3)) {
          if (cpdAppear === 2 && lastPlaceType.length > 2) {
            shareConstruct[i].splice(1, 1);
          }
        }
        const activeType = activeRevenue(shareConstruct[i]);
        buildShareConstruct.push(activeType);
      }
    }
    console.log('buildShareConstruct', buildShareConstruct);
    const pr = computeShareWithPlacementType(allPlace, 'pr', buildShareConstruct);
    // const testPR = computeShareWithPlacementType2(allPlace, 'pr', buildShareConstruct);
    // console.log('testPR', testPR);
    if (pr.length > 0) {
      return pr;
    }
    let cpdShare = computeShareWithPlacementType(allPlace, 'cpd', buildShareConstruct);
    // const testCPD = computeShareWithPlacementType2(allPlace, 'cpd', buildShareConstruct);
    // console.log('testCPD', testCPD);
    for (let i = 0; i < this.ZoneArea; i += 1) {
      if (100 - shareConstruct[i][0].weight <= 0) {
        cpdShare = cpdShare.filter(share => share.placements[i].revenueType === 'cpd');
      }
    }
    if (cpdShare.length > 0) {
      return cpdShare;
    }
    return allShare;
  }

  /**
   * Get a active share randomly by its weight
   * @return {Share}
   */
  activeShare(relativeKeyword) {
    const allShare = this.filterShareDynamic(relativeKeyword);
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

  /**
   * Get array of active placements
   * @returns [Placement]
   */
  activePlacements() {
    const activeShareModel = this.activeShare();
    return activeShareModel.activePlacements();
  }
}

export default Zone;
