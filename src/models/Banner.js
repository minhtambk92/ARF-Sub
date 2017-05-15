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
  }
  // Banner Checking Process
  isRenderable() {
    const isBannerAvailable = this.id !== 'banner-undefined';
    const isFitChannel = this.checkChannel;
    const isFitLocation = this.checkLocation;
    const a = this.checkFrequency;
    const res = isBannerAvailable && isFitChannel && isFitLocation && a;
    console.log(`${this.id}: fre:${a}, channel: ${isFitChannel}, location: ${isFitLocation}, isBannerAvailable: ${isBannerAvailable}`);
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
  // check channel with new data (using)
  get checkChannel() {
    if (this.channel !== undefined && this.channel !== null && this.channel !== '') {
      const channel = this.channel;
      const options = channel.options.filter(item => item.name !== 'Location' && item.name !== 'Browser');
      const optionsLength = options.length;
      const a = eval; // eslint-disable-line no-eval
      let strChk = '';

      for (let i = 0; i < optionsLength; i += 1) {
        const optionChannelType = options[i].optionChannelType;
        const value = options[i].value.toString().split(',');
        const comparison = options[i].comparison;
        const logical = options[i].logical === 'and' ? '&&' : '||';
        const globalVariableName = options[i].globalVariables;
        const globalVariable = a(`typeof (${globalVariableName}) !== 'undefined' && ${globalVariableName} !== ''`) ? a(globalVariableName) : undefined;
        let globalVariableTemp = typeof (globalVariable) !== 'undefined' && globalVariable !== '' ? globalVariable : ''; // eslint-disable-line
        let currentAdditionalDetail = '';
        let type = optionChannelType.isInputLink ? 'isInputLink' : '';
        let stringCheck = '';
        let additionalDetail = []; // get optionChannelValueProperties
        type = optionChannelType.isSelectOption ? 'isSelectOption' : type;
        type = optionChannelType.isVariable ? 'isVariable' : type;

        // console.log('valueCheck', value);
        if (optionChannelType.optionChannelValues.length > 0) {
          additionalDetail = optionChannelType.optionChannelValues.filter(item =>
            value.reduce((acc, valueItem) => acc || (item.value === valueItem
            && item.optionChannelValueProperties.length > 0), 0));
        }
        // console.log('value', value);
        for (let j = 0; j < value.length; j += 1) {
          if (j > 0) stringCheck += '||';
          switch (type) {
            case 'isInputLink' || 'isVariable': {
              if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') { // eslint-disable-line
                a(`${globalVariableName} = ''`); // eslint-disable-line
              }
              // eslint-disable-next-line
              // console.log('checkChannel', type, term.getPath2Check('Site:Pageurl'),comparison, value[j]);
              stringCheck += term.checkPathLogic(value[j], 'Site:Pageurl', comparison);
              if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') { // eslint-disable-line
                  a(`${globalVariableName} = globalVariableTemp`); // eslint-disable-line
              }
              break;
            }
            case 'isSelectOption': {
              const Pageurl = term.getPath2Check('Site:Pageurl', globalVariableName);
              const thisChannel = util.getThisChannel(Pageurl);
              thisChannel.shift();

              // do smt with additionalDetail
              if (additionalDetail.length > 0) {
                // region : get link detail
                if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') { // eslint-disable-line
                  a(`${globalVariableName} = ''`);
                }
                currentAdditionalDetail = util.getThisChannel(Pageurl).pop();
                currentAdditionalDetail.shift();
                if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') { // eslint-disable-line
                  a(`${globalVariableName} = globalVariableTemp`);
                }
                // endregion : get link detail

                // console.log('additionalDetail', additionalDetail, currentAdditionalDetail);
              }
              // console.log('checkChannel', type, thisChannel[0], comparison, value[j]);
              switch (comparison) {
                case '==':
                  stringCheck += value[j] === thisChannel[0];
                  break;
                case '!=':
                  stringCheck += value[j] !== thisChannel[0];
                  break;
                default:
                  stringCheck += false;
                  break;
              }
              break;
            }
            default:
              stringCheck += false;
              break;
          }
        }
        const CheckValue = a(stringCheck);
        if (i > 0) strChk += logical;
        strChk += CheckValue;
      }
      console.log('checkChannel', strChk);
      return a(strChk);
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
  // old data(not use)
  get checkBrowser() {
    let browser = this.browser;
    browser = (typeof (browser) === 'undefined' ||
    browser === 'undefined' ||
    browser == null ||
    browser === '') ? 0 : browser;
    browser = `,${browser},`.toLowerCase();
    return (browser !== ',,' && browser !== ',0,') ? (`${browser}`.indexOf(util.getCurrentBrowser) !== -1) : true;
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
      return currentCount;
    }
    return '';
  }

}

export default Banner;
