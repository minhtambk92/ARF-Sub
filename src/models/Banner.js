/**
 * Created by Manhhailua on 11/30/16.
 */

import Entity from './Entity';
import { term, adsStorage, util } from '../vendor';

class Banner extends Entity {

  constructor(banner) {
    super(banner);

    this.id = `banner-${banner.id}`;
    this.isRelative = banner.isRelative;
    this.keyword = banner.keyword;
    this.terms = banner.terms;
    this.location = banner.location;
    this.fr = banner.fr;
    this.channel = banner.channel;
    this.bannerType = banner.bannerType;
    this.test = banner.test;
    this.bannerType = banner.bannerType;
    this.dataBannerHtml = banner.dataBannerHtml;
    this.linkFormatBannerHtml = banner.linkFormatBannerHtml;
    this.isIFrame = banner.isIFrame;
    this.imageUrl = banner.imageUrl;
    this.zoneId = banner.zoneId;
    this.placementId = banner.placementId;
    this.optionBanners = banner.optionBanners;
  }

  // Banner Checking Process
  isRenderable() {
    const isBannerAvailable = this.id !== 'banner-undefined';
    const isFitChannel = this.checkChannel;
    // const isFitLocation = this.checkLocation;
    const isFitFrequency = this.checkFrequency;
    const res = (isBannerAvailable && isFitChannel) && isFitFrequency;
    console.log(`${this.id}: fre:${isFitFrequency}, channel: ${isFitChannel}, isBannerAvailable: ${isBannerAvailable}, res: ${res}`);
    return res;
  }

  // check term old data (not use)
  get checkTerm() {
    if (this.terms) {
      const terms = this.terms;
      const len = terms.length;
      const a = eval; // eslint-disable-line no-eval
      let str = '';
      let operator = '';

      for (let i = 0; i < len; i += 1) {
        if (i !== 0) operator = (terms[i].join === 'or' ? '||' : '&&');
        if (terms[i].channel) {
          str += `${operator + ((terms[i].logic === '!~') ? '!' : '')}(${term.checkPath(terms[i].data, ((terms[i].logic === '==') ? '&&' : '||'))})`;
        } else {
          str += operator +
            term.checkPathLogic(terms[i].data, terms[i].type, terms[i].logic);
        }
      }

      return a(str);
    }

    return true;
  }

  /* eslint-disable */
  // get checkChannel() {
  //   const channelData = this.channel;
  //   if (channelData !== undefined && channelData !== null && channelData !== '') {
  //     const channel = channelData;
  //     const options = channel.options.filter(item => item.name !== 'Location' && item.name !== 'Browser');
  //     const optionsLength = options.length;
  //     const a = eval; // eslint-disable-line no-eval
  //     let strChk = '';
  //
  //     for (let i = 0; i < optionsLength; i += 1) {
  //       const optionChannelType = options[i].optionChannelType;
  //       const value = options[i].value.toString().split(',');
  //       const comparison = options[i].comparison;
  //       const logical = options[i].logical === 'and' ? '&&' : '||';
  //       const globalVariableName = options[i].globalVariables;
  //       console.log('globalVariableName', globalVariableName, i);
  //     // eslint-disable-next-line
  //     let globalVariable = (globalVariableName !== '' && a(`typeof (${globalVariableName}) !== 'undefined'`)) ? a(globalVariableName) : undefined;
  //       globalVariable = encodeURIComponent(globalVariable);
  //       console.log('globalVariable', globalVariable);
  //       const globalVariableTemp = (typeof (globalVariable) !== 'undefined' && globalVariable !== '') ? globalVariable : '';
  //       console.log('globalVariableTemp', globalVariableTemp);
  //       let currentAdditionalDetail = '';
  //       let type = optionChannelType.isInputLink ? 'isInputLink' : '';
  //       let stringCheck = '';
  //       let additionalDetail = []; // get optionChannelValueProperties
  //       type = optionChannelType.isSelectOption ? 'isSelectOption' : type;
  //       type = optionChannelType.isVariable ? 'isVariable' : type;
  //       console.log('type', type);
  //     // console.log('valueCheck', value);
  //       if (optionChannelType.optionChannelValues.length > 0) {
  //         additionalDetail = optionChannelType.optionChannelValues.filter(item =>
  //         value.reduce((acc, valueItem) => acc || (item.value === valueItem
  //         && item.optionChannelValueProperties.length > 0), 0));
  //       }
  //       console.log('value', value);
  //       for (let j = 0; j < value.length; j += 1) {
  //         if (j > 0) stringCheck += '||';
  //         switch (type) {
  //           case 'isVariable': {
  //             if ((globalVariableName !== '' && eval(`typeof (${globalVariableName}) !== 'undefined'`))) { // eslint-disable-line no-eval
  //               if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') {
  //                 stringCheck += term.checkPathLogic(value[j], 'Site:Pageurl', globalVariableName, comparison);
  //                 console.log('checkChannel', type, term.getPath2Check('Site:Pageurl', globalVariableName), comparison, value[j]);
  //               }
  //             } else {
  //               stringCheck += term.checkPathLogic(value[j], 'Site:Pageurl', '', comparison);
  //               console.log('checkChannel', type, term.getPath2Check('Site:Pageurl', ''), comparison, value[j]);
  //             }
  //             break;
  //           }
  //           case 'isInputLink': {
  //             stringCheck += term.checkPathLogic(value[j], 'Site:Pageurl', '', comparison);
  //             console.log('checkChannel', type, term.getPath2Check('Site:Pageurl', ''), comparison, value[j]);
  //             break;
  //           }
  //           case 'isSelectOption': {
  //             const pageUrl = term.getPath2Check('Site:Pageurl', globalVariableName);
  //             const thisChannel = util.getThisChannel(pageUrl);
  //             thisChannel.shift();
  //
  //           // do smt with additionalDetail
  //             if (additionalDetail.length > 0) {
  //             // region : get link detail
  //               if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') {
  //                 a(`${globalVariableName} = ''`);
  //               }
  //               currentAdditionalDetail = util.getThisChannel(pageUrl).pop();
  //               currentAdditionalDetail.shift();
  //               if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') {
  //                 a(`${globalVariableName} = globalVariableTemp`);
  //               }
  //             // endregion : get link detail
  //
  //               console.log('additionalDetail', additionalDetail, currentAdditionalDetail);
  //             }
  //             console.log('checkChannel', type, thisChannel[0], comparison, value[j]);
  //             switch (comparison) {
  //               case '==': {
  //                 stringCheck += value[j] === thisChannel[0];
  //                 break;
  //               }
  //               case '!=': {
  //                 stringCheck += value[j] !== thisChannel[0];
  //                 break;
  //               }
  //               default: {
  //                 stringCheck += false;
  //                 break;
  //               }
  //             }
  //             break;
  //           }
  //           default: {
  //             stringCheck += false;
  //             break;
  //           }
  //         }
  //       }
  //       const CheckValue = a(stringCheck);
  //       if (i > 0) strChk += logical;
  //       strChk += CheckValue;
  //     }
  //     console.log('strChk', strChk, a(strChk));
  //     return a(strChk);
  //   }
  //   return true;
  // }
  /* eslint-enable */

  get checkChannel() {
    if (this.optionBanners !== undefined && this.optionBanners !== null) {
      const optionBanner = this.optionBanners;
      const checkLength = optionBanner.length;
      const checkChannel = (channelData) => {
        if (channelData !== undefined && channelData !== null && channelData !== '') {
          const channel = channelData;
          const options = channel.options.filter(item => (item.name !== 'Location'));
          const optionsLength = options.length;
          const a = eval; // eslint-disable-line no-eval
          let strChk = '';
          if (optionsLength > 0) {
            for (let i = 0; i < optionsLength; i += 1) {
              const optionChannelType = options[i].optionChannelType;
              const value = options[i].value.toString().split(',');
              const comparison = options[i].comparison;
              const logical = options[i].logical === 'and' ? '&&' : '||';
              const globalVariableName = options[i].globalVariables;
              console.log('globalVariableName', globalVariableName, i);
              // eslint-disable-next-line
              let globalVariable = (globalVariableName !== '' && a(`typeof (${globalVariableName}) !== 'undefined'`)) ? a(globalVariableName) : undefined;
              globalVariable = encodeURIComponent(globalVariable);
              console.log('globalVariable', globalVariable);
              const globalVariableTemp = (typeof (globalVariable) !== 'undefined' && globalVariable !== '') ? globalVariable : '';
              console.log('globalVariableTemp', globalVariableTemp);
              let currentAdditionalDetail = '';
              let type = optionChannelType.isInputLink ? 'isInputLink' : '';
              let stringCheck = '';
              let additionalDetail = []; // get optionChannelValueProperties
              type = optionChannelType.isSelectOption ? 'isSelectOption' : type;
              type = optionChannelType.isVariable ? 'isVariable' : type;
              console.log('type', type);
              // console.log('valueCheck', value);
              if (optionChannelType.optionChannelValues.length > 0) {
                additionalDetail = optionChannelType.optionChannelValues.filter(item =>
                  value.reduce((acc, valueItem) => acc || (item.value === valueItem
                  && item.optionChannelValueProperties.length > 0), 0));
              }
              console.log('value', value);
              for (let j = 0; j < value.length; j += 1) {
                if (j > 0) stringCheck += '||';
                switch (type) {
                  case 'isVariable': {
                    if (globalVariableName !== '') { // eslint-disable-line no-eval
                      if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') {
                        stringCheck += term.checkPathLogic(value[j], 'Site:Pageurl', globalVariableName, comparison);
                        console.log('checkChannel', type, term.getPath2Check('Site:Pageurl', globalVariableName), comparison, value[j]);
                      }
                    } else {
                      stringCheck += term.checkPathLogic(value[j], 'Site:Pageurl', '', comparison);
                      console.log('checkChannel', type, term.getPath2Check('Site:Pageurl', ''), comparison, value[j]);
                      switch (comparison) {
                        case '==': {
                          stringCheck += false;
                          break;
                        }
                        case '!=': {
                          stringCheck += true;
                          break;
                        }
                        default: {
                          stringCheck += false;
                          break;
                        }
                      }
                    }
                    break;
                  }
                  case 'isInputLink': {
                    stringCheck += term.checkPathLogic(value[j], 'Site:Pageurl', '', comparison);
                    console.log('checkChannel', type, term.getPath2Check('Site:Pageurl', ''), comparison, value[j]);
                    break;
                  }
                  case 'isSelectOption': {
                    console.log('checkBrowser0', options[i].name);
                    if (options[i].name !== 'Browser' && options[i].name !== 'Location') {
                      console.log('runnnn');
                      const pageUrl = term.getPath2Check('Site:Pageurl', globalVariableName);
                      const thisChannel = util.getThisChannel(pageUrl);
                      thisChannel.shift();

                      // do smt with additionalDetail
                      if (additionalDetail.length > 0) {
                        // region : get link detail
                        if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') {
                          a(`${globalVariableName} = ''`);
                        }
                        currentAdditionalDetail = util.getThisChannel(pageUrl).pop();
                        currentAdditionalDetail.shift();
                        if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') {
                          a(`${globalVariableName} = globalVariableTemp`);
                        }
                        // endregion : get link detail

                        console.log('additionalDetail', additionalDetail, currentAdditionalDetail);
                      }
                      console.log('checkChannel', type, thisChannel[0], comparison, value[j]);
                      switch (comparison) {
                        case '==': {
                          stringCheck += value[j] === thisChannel[0];
                          break;
                        }
                        case '!=': {
                          stringCheck += value[j] !== thisChannel[0];
                          break;
                        }
                        default: {
                          stringCheck += false;
                          break;
                        }
                      }
                    } else if (options[i].name === 'Browser') {
                      console.log('checkBrowser1');
                      const checkBrowser = util.checkBrowser(value[j]);
                      switch (comparison) {
                        case '==': {
                          stringCheck += checkBrowser;
                          break;
                        }
                        case '!=': {
                          stringCheck += (checkBrowser !== true);
                          break;
                        }
                        default: {
                          stringCheck += false;
                          break;
                        }
                      }
                      console.log('checkBrowser', stringCheck, comparison);
                    }
                    break;
                  }
                  default: {
                    stringCheck += false;
                    break;
                  }
                }
              }
              const CheckValue = a(stringCheck);
              if (i > 0) strChk += logical;
              strChk += CheckValue;
            }
          } else {
            strChk += 'true';
          }
          console.log('strChk', strChk, a(strChk));
          return a(strChk);
        }
        return true;
      };
      let stringCheckTotal = '';
      for (let i = 0; i < checkLength; i += 1) {
        let stringCheck = '';
        const logical = optionBanner[i].logical === 'and' ? '&&' : '||';
        const type = optionBanner[i].type;
        const comparison = optionBanner[i].comparison;
        const value = optionBanner[i].value;
        switch (type) {
          case 'pageUrl' : {
            stringCheck += term.checkPathLogic(value, 'Site:Pageurl', '', comparison);
            break;
          }
          case 'channel' : {
            const optionBannerChannels = optionBanner[i].optionBannerChannels;
            let stringCheckChannelType = '';
            for (let j = 0; j < optionBannerChannels.length; j += 1) {
              const channel = optionBannerChannels[j].channel;
              const result = checkChannel(channel);
              // const comparisonChar = comparison === '==' ? '||' : '&&';
              console.log('resultChannel', result, channel, comparison);
              if (comparison === '==') {
                stringCheckChannelType += (j > 0 ? '||' : '') + result;
              } else {
                stringCheckChannelType += (j > 0 ? '&&' : '') + result;
              }
            }
            console.log('stringCheckChannelType', stringCheckChannelType);
            const resultCheckChannel = eval(stringCheckChannelType); // eslint-disable-line
            stringCheck += resultCheckChannel;
            break;
          }
          case 'referringPage' : {
            stringCheck += term.checkPathLogic(value, 'Site:Pageurl', '', comparison);
            break;
          }
          default: {
            stringCheck += false;
            break;
          }
        }
        console.log('stringCheck', stringCheck, logical, i);
        const checkValue = eval(stringCheck); // eslint-disable-line
        if (i === 0 && logical === '||') {
          if (checkValue) {
            stringCheckTotal += checkValue;
            break;
          }
        }
        if (i > 0) stringCheckTotal += logical;
        stringCheckTotal += checkValue;
      }
      console.log('stringCheckTotal', stringCheckTotal);
      return eval(stringCheckTotal); // eslint-disable-line
    }
    return true;
  }

  // get CheckLocation() {
  //   let location = this.location;
  //   location = (typeof (location) === 'undefined' ||
  //   location === 'undefined' ||
  //   location == null ||
  //   location === '') ? 0 : location;
  //   location = `,${location},`;
  //   const strlocation = `,${window.ADSData.ADSLocation},`;
  //   const strcity = `,${window.ADSData.ADSCity},`;
  //   const strcitymain = `,${window.ADSData.ADSCityMain},`;
  //   const regBool = /,[1|2|3],[1|2|3],[1|2|3],/g;
  //   return (!!((location === ',,') ||
  //   (regBool.test(location)) ||
  //   (location === ',0,') ||
  //   ((`${location}`).indexOf(strcity) !== -1) ||
  //   ((`${location}`).indexOf(strcitymain) !== -1) ||
  //   ((`${location}`).indexOf(strlocation) !== -1)));
  // }
  // check Location with new data (using)
  get checkLocation() {
    let location = this.getLocation;
    if (location !== undefined && location !== 0) {
      location = (typeof (location) === 'undefined' ||
      location === undefined || location == null) ? 0 : location;
      const strlocation = `${util.convertLocation(window.ADSData.ADSLocation).R}`;
      const strcity = `${util.convertLocation(window.ADSData.ADSCity).RC}`;
      const strcitymain = `${util.convertLocation(window.ADSData.ADSCityMain).RC}`;
      console.log(`Check Location ${strcity} isBelongTo ${location.location}`);
      return (!!((location === '0') ||
      ((`${location.location}`).indexOf(strcity) !== -1 && location.comparison === '==') ||
      ((`${location.location}`).indexOf(strcitymain) !== -1 && location.comparison === '==') ||
      ((`${location.location}`).indexOf(strlocation) !== -1 && location.comparison === '==')));
    }
    return true;
  }

  // get location from channel's options
  get getLocation() {
    if (this.channel !== undefined && this.channel !== null && this.channel !== '') {
      // console.log('getLocation run');
      const onLocations = this.channel.options.filter(item => item.name === 'Location' && item.comparison === '==');
      const exceptLocation = this.channel.options.filter(item => item.name === 'Location' && item.comparison === '!=');
      if (onLocations.length > 0) {
        return {
          location: onLocations.reduce((acc, item, index) => (index > 0 ? `${acc},` : '') + item.value, 0),
          comparison: '==',
        };
      }
      return {
        location: exceptLocation.reduce((acc, item, index) => (index > 0 ? `${acc},` : '') + item.value, 0),
        comparison: '!=',
      };
    }
    return 0;
  }

  get checkFrequency() {
    let fr = this.fr;
    const count = this.getFrequency();
    if (fr === '' || fr === 'undefined' || fr === undefined) {
      return true;
    }
    fr = parseInt(fr, 10);
    if (count > fr) {
      console.log(`${this.id}: `, this.getFrequency());
      return false;
    }
    return true;
  }

  countFrequency() {
    const domain = term.getCurrentDomain('Site:Pageurl');
    const bannerID = this.id;
    let cookie = adsStorage.getStorage('_fr');
    const checkCookie = adsStorage.subCookie(cookie, 'Ver:', 0);
    if (checkCookie === '') {
      cookie = 'Ver:25;';
    }
    adsStorage.setStorage('_fr', cookie, '', '/', domain);
    if (`${cookie}`.indexOf(bannerID) !== -1) {
      const FrequencyStr = adsStorage.subCookie(cookie, `${bannerID}:`, 0).toString();
      const currentCount = this.getFrequency();
      if (window.arfBanners[bannerID] && bannerID !== 'banner-undefined') {
        cookie = `${cookie}`.replace(FrequencyStr, `${bannerID}:${currentCount + 1}`);
        // console.log(`${bannerID}:${currentCount + 1}`);
      }
    } else {
      cookie = bannerID === 'banner-undefined' ? cookie : `${cookie};${bannerID}:1;`;
      console.log(adsStorage.subCookie(cookie, `${bannerID}:`, 0).toString());
    }
    adsStorage.setStorage('_fr', cookie, '', '/', domain);
  }

  getFrequency() {
    const cookie = adsStorage.getStorage('_fr');
    if (cookie !== '') {
      const bannerID = this.id;
      const a = adsStorage.subCookie(cookie, `${bannerID}:`, 0).toString();
      const currentCount = parseInt(a.slice(a.indexOf(':') + 1), 10);
      console.log(`${this.id}: ${currentCount}`);
      return currentCount;
    }
    return '';
  }

  bannerLogging(cov) {
    // cov=0 OR cov=-1: view placment, banner.
    // cov=1: click
    // cov=2: true view
    // cov=3: load box dạng extend khi dùng chức năng rotate.
    const zoneID = this.zoneId;
    const bannerId = this.id;
    const placementId = this.placementId;
    const domain = encodeURIComponent(term.getCurrentDomain('Site:Pageurl'));
    const linkLog = `http://localhost:3000/bannerLogging?dmn=${domain}&zid=${zoneID}&pli=${placementId}&items=${bannerId}&cov=${cov}`;
    const img = new Image();
    img.src = linkLog;
  }
}

export default Banner;
