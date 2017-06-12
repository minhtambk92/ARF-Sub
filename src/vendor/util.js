/**
 * Created by tlm on 14/03/2017.
 */
import { Banner, Placement } from '../models';

const util = {
  getThisChannel(url) {
    const path = url;
    let Channel;
    if (path.indexOf('http://') !== -1) {
      Channel = path.substring(7).split('/');
    } else {
      Channel = path.split('/');
      Channel.pop();
    }
    return Channel;
  },

  convertArea(height, width) {
    if ((width === 1160 || width === 1158) && height === 90) {
      return 2;
    }
    if (width === 336 && height === 560) {
      return 4;
    }
    if (width === 336 && height <= 560) {
      return height / 140;
    }
    if (height === 90 && width <= 1160) {
      return 1;
    }
    return 1;
  },
  // flatten array
  flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? util.flatten(val) : val), []);
  },
  // Clone Array that don't reference to Array copy.
  cloneArray(arr) {
    let copy;
    if (arr === null || typeof arr !== 'object') return arr;

    // Handle Array
    if (arr instanceof Array) {
      copy = [];
      for (let i = 0, len = arr.length; i < len; i += 1) {
        copy[i] = util.cloneArray(arr[i]);
      }
      return copy;
    }

    throw new Error('Unable to copy array!.');
  },

  uniqueItem(arr) {
    const n = {};
    const r = [];
    for (let i = 0; i < arr.length; i += 1) {
      if (!n[arr[i]]) {
        n[arr[i]] = true;
        r.push(arr[i]);
      }
    }
    return r;
  },
  // permute item in array and return a array store permutations
  permuteArray(array) {
    const permArr = [];
    const usedChars = [];
    const UniqueItem = (arr) => {
      const n = {};
      const r = [];
      for (let i = 0; i < arr.length; i += 1) {
        if (!n[arr[i]]) {
          n[arr[i]] = true;
          r.push(arr[i]);
        }
      }
      return r;
    };
    const permute = (input) => {
      let i;
      let ch;
      for (i = 0; i < input.length; i += 1) {
        ch = input.splice(i, 1)[0];
        usedChars.push(ch);
        if (input.length === 0) {
          permArr.push(usedChars.slice());
        }
        permute(input);
        input.splice(i, 0, ch);
        usedChars.pop();
      }
      return UniqueItem(permArr);
    };
    return permute(array);
  },
  // compute share base on area and number of place => return a array store these share-ratios
  ComputeShare(FreeAreaData, numberPlacesData) {
    // save output result
    let shares = [];
    // save a share which is computed
    let share = [];
    let count = 0;
    let nps = 0;

    const CreateShare = (FreeAreasDt, numberPlacesDt) => {
      let FreeArea = FreeAreasDt;
      let numberPlaces = numberPlacesDt;
      while (FreeArea > 0) {
        const PlaceArea = (FreeArea - (FreeArea % numberPlaces)) / numberPlaces;
        if (count === 0) {
          nps = numberPlacesData;
        }
        count += 1;
        if (PlaceArea > 1 && (numberPlaces !== 1)) {
          const PlaceAreaTmp = PlaceArea;
          let temp = 1;
          const thisLever = [];
          while (temp < PlaceAreaTmp) {
            if (thisLever.indexOf(temp) === -1) {
              let FreeAreaTemp = FreeArea;
              let numberPlacesTemp = numberPlaces;
              thisLever.push(temp);
              share.push(temp);
              numberPlacesTemp -= 1;
              FreeAreaTemp -= temp;
              CreateShare(FreeAreaTemp, numberPlacesTemp, share);
              temp += 1;
            }
          }
        }
        numberPlaces -= 1;
        FreeArea -= PlaceArea;
        share.push(PlaceArea);
        if (numberPlaces === 0) {
          const numberofCommon = nps - share.length;
          if (numberofCommon > 0) {
            const shareTemp = util.cloneArray(shares.reduce((x, z) => z, 0));
            shareTemp.splice(numberofCommon);
            shareTemp.push(share);
            share = util.flatten(shareTemp);
          }
          shares.push(share);
          share = [];
        }
      }
    };
    CreateShare(FreeAreaData, numberPlacesData);

    shares.reduce((acc, sh) => { // eslint-disable-line array-callback-return
      shares = shares.concat(util.permuteArray(sh));
      shares.shift();
    }, 0);
    return (shares);
  },
  // filter Share base on Campaign place position
  filterShareAfterCompute(shares, ...OrderArea) {
    let sharesTemp = shares;
    while (OrderArea.length > 0) {
      sharesTemp = sharesTemp.filter(share => share.reduce((acc2, placeArea, index) => {
        if (OrderArea[0].order === index && OrderArea[0].area === placeArea) {
          return true || acc2;
        }
        return false || acc2;
      }, 0));
      OrderArea.shift();
    }
    return sharesTemp;
  },
  // convert location value (1->101) to location name
  convertLocation(locationValue) {
    locationValue = parseInt(locationValue, 10); // eslint-disable-line no-param-reassign
    const LocationDictionnary = {
      '-1': 'Lỗi service',
      0: 'Chưa xác định',
      1: 'Miền Bắc',
      4: 'Hà Nội',
      7: 'Hải Phòng',
      8: 'Bắc Cạn',
      9: 'Bắc Giang',
      10: 'Bắc Ninh',
      11: 'Cao Bằng',
      12: 'Điện Biên',
      13: 'Hà Giang',
      14: 'Hà Nam',
      15: 'Hải Dương',
      16: 'Hoà Bình',
      17: 'Hưng Yên',
      18: 'Lai Châu',
      19: 'Lạng Sơn',
      20: 'Lào Cai',
      21: 'Nam Định',
      22: 'Ninh Bình',
      23: 'Phú Thọ',
      24: 'Quảng Ninh',
      25: 'Sơn La',
      26: 'Thái Bình',
      27: 'Thái Nguyên',
      28: 'Tuyên Quang',
      29: 'Vĩnh Phúc',
      30: 'Yên Bái ',
      2: 'Miền Trung',
      31: 'Đà Nẵng',
      32: 'Bình Định',
      33: 'Bình Phước',
      34: 'Bình Thuận',
      35: 'Đắk Lắk',
      36: 'Đắk Nông',
      37: 'Gia Lai',
      38: 'Hà Tĩnh',
      39: 'Nha Trang - Khánh Hoà',
      40: 'Kontum',
      41: 'Lâm Đồng',
      42: 'Nghệ An',
      43: 'Ninh Thuận',
      44: 'Phú Yên',
      45: 'Quảng Bình',
      46: 'Quảng Nam',
      47: 'Quảng Ngãi',
      48: 'Quảng Trị',
      49: 'Thanh Hoá',
      50: 'Thừa Thiên Huế',
      51: 'Vinh',
      3: 'Miền Nam',
      5: 'HCM',
      52: 'Bình Dương',
      53: 'Cần Thơ',
      54: 'An Giang',
      55: 'Bà Rịa - Vũng Tàu',
      56: 'Bạc Liêu',
      57: 'Bến Tre',
      58: 'Cà Mau',
      59: 'Đồng Nai',
      60: 'Đồng Tháp',
      61: 'Hậu Giang',
      62: 'Kiên Giang',
      63: 'Long An',
      64: 'Sóc Trăng',
      65: 'Tây Ninh',
      66: 'Tiền Giang',
      67: 'Trà Vinh',
      68: 'Vĩnh Long',
      101: 'Nước ngoài',
    };
    // convert vietnamese sign to vietnamese no sign and space to '-'
    const convertString = (string) => {
      let str = string;
      str = str.toLowerCase();
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      str = str.replace(/đ/g, 'd');
      str = str.replace(/\W+/g, ' ');
      str = str.replace(/\s/g, '-');
      return str;
    };
    if ([1, 2, 3].indexOf(locationValue) !== -1) {
      return { R: convertString(LocationDictionnary[locationValue]), RC: '' };
    }
    if (locationValue === 4 || (locationValue <= 30 && locationValue >= 7)) {
      const northernCity = convertString(LocationDictionnary[locationValue]);
      return { R: 'northern', RC: northernCity };
    }
    if (locationValue >= 31 && locationValue <= 51) {
      const centerCity = convertString(LocationDictionnary[locationValue]);
      return { R: 'center', RC: centerCity };
    }
    if (locationValue === 5 || (locationValue >= 52 && locationValue <= 68)) {
      const southernCity = convertString(LocationDictionnary[locationValue]);
      return { R: 'southern', RC: southernCity };
    }
    if (locationValue >= 100) {
      const foreignCity = convertString(LocationDictionnary[locationValue]);
      return { R: 'foreign', RC: foreignCity };
    }

    const detail = LocationDictionnary[locationValue];
    return { R: detail, RC: detail };
  },

  getDefaultBanner(width, height) {
    const defaultBanner = [
      {
        id: 'f1d78bd4-06fc-4c99-9611-c03a1d21506e',
        name: 'Banner Default 336 * 140',
        html: "<script> (function() {var admid = 'abc';function admGetUrlCk() {return '';}var __admLink = 'http://dantri.com.vn/';var doc = document, url = __admLink, ua = navigator.userAgent + '';var videourl = 'http://adi.admicro.vn/adt/cpc/cpm7k/html/upload/2016/10/ariston_1160x90/1160x90.html';var imageurl = 'https://s27.postimg.org/o6faj2ar7/right_336_*_140.jpg';var imgwidth = 336;var imgheight = 140;var html = '<div style=\"position:relative;\">';if (ua.indexOf('Android') != -1 || ua.indexOf('iPad') != -1 || ua.indexOf('iPhone') != -1) {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')} else {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')}html += '</div>';doc.write(html);})();</script>",
        width: 336,
        height: 140,
        keyword: 'dantri',
        weight: 100,
        description: 'Banner Default 336 * 140',
        imageUrl: '',
        url: '',
        target: '',
        isIFrame: true,
        isCountView: true,
        isFixIE: false,
        isDefault: false,
        isRelative: false,
      },
      {
        id: 'a76c6e2f-4afc-4598-908d-395a904a2114',
        name: 'Default Banner 336 x 420',
        html: "<script> (function() {var admid = 'abc';function admGetUrlCk() {return '';}var __admLink = 'http://dantri.com.vn/';var doc = document, url = __admLink, ua = navigator.userAgent + '';var videourl = 'http://adi.admicro.vn/adt/cpc/cpm7k/html/upload/2016/10/ariston_1160x90/1160x90.html';var imageurl = 'https://s27.postimg.org/41lqdlgxf/right_336*420.jpg';var imgwidth = 336;var imgheight = 420;var html = '<div style=\"position:relative;\">';if (ua.indexOf('Android') != -1 || ua.indexOf('iPad') != -1 || ua.indexOf('iPhone') != -1) {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')} else {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')}html += '</div>';doc.write(html);})();</script>",
        width: 336,
        height: 420,
        keyword: 'datri',
        weight: 100,
        description: 'qasd',
        imageUrl: '',
        url: '',
        target: '',
        isIFrame: true,
        isCountView: true,
        isFixIE: false,
        isDefault: false,
        isRelative: false,
      },
      {
        id: 'ac509192-f144-4db7-8fae-0554103884ee',
        name: 'Default Banner 336 x 560',
        html: "<script> (function() {var admid = 'abc';function admGetUrlCk() {return '';}var __admLink = 'http://dantri.com.vn/';var doc = document, url = __admLink, ua = navigator.userAgent + '';var videourl = 'http://adi.admicro.vn/adt/cpc/cpm7k/html/upload/2016/10/ariston_1160x90/1160x90.html';var imageurl = 'https://s27.postimg.org/qrkv6l04z/right_468_*_560.jpg';var imgwidth = 336;var imgheight = 560;var html = '<div style=\"position:relative;\">';if (ua.indexOf('Android') != -1 || ua.indexOf('iPad') != -1 || ua.indexOf('iPhone') != -1) {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')} else {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')}html += '</div>';doc.write(html);})();</script>",
        width: 336,
        height: 560,
        keyword: 'dantri',
        weight: 100,
        description: 'sdfsd',
        imageUrl: '',
        url: '',
        target: '',
        isIFrame: true,
        isCountView: true,
        isFixIE: false,
        isDefault: false,
        isRelative: false,

      },
      {
        id: 'e48beece-f9a3-4264-9d07-e9013c95b90b',
        name: 'Banner Default 336 x 280',
        html: "<script> (function() {var admid = 'abc';function admGetUrlCk() {return '';}var __admLink = 'http://dantri.com.vn/';var doc = document, url = __admLink, ua = navigator.userAgent + '';var videourl = 'http://adi.admicro.vn/adt/cpc/cpm7k/html/upload/2016/10/ariston_1160x90/1160x90.html';var imageurl = 'https://s27.postimg.org/rejrw3x0z/right_336*280.jpg';var imgwidth = 336;var imgheight = 280;var html = '<div style=\"position:relative;\">';if (ua.indexOf('Android') != -1 || ua.indexOf('iPad') != -1 || ua.indexOf('iPhone') != -1) {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')} else {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')}html += '</div>';doc.write(html);})();</script>",
        width: 336,
        height: 280,
        keyword: 'dantri',
        weight: 100,
        description: 'asd',
        imageUrl: '',
        url: '',
        target: '',
        isIFrame: true,
        isCountView: true,
        isFixIE: false,
        isDefault: false,
        isRelative: false,

      },
      {
        id: '54cbaac6-a6e6-44f6-844e-f746b389d8db',
        name: 'Banner Top Default 1160 x 90',
        html: "<script> (function() {var admid = 'abc';function admGetUrlCk() {return '';}var __admLink = 'http://dantri.com.vn/';var doc = document, url = __admLink, ua = navigator.userAgent + '';var videourl = 'http://adi.admicro.vn/adt/cpc/cpm7k/html/upload/2016/10/ariston_1160x90/1160x90.html';var imageurl = 'https://s27.postimg.org/57pqce583/top_1160_*_90.jpg';var imgwidth = 1160;var imgheight = 90;var html = '<div style=\"position:relative;\">';if (ua.indexOf('Android') != -1 || ua.indexOf('iPad') != -1 || ua.indexOf('iPhone') != -1) {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')} else {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')}html += '</div>';doc.write(html);})();</script>",
        width: 1160,
        height: 90,
        keyword: 'santri',
        weight: 100,
        description: 'asd',
        imageUrl: '',
        url: '',
        target: '',
        isIFrame: true,
        isCountView: true,
        isFixIE: false,
        isDefault: false,
        isRelative: false,
      },
      {
        id: '53d5a00b-ac63-4910-9173-9156977ec876',
        name: 'Banner Top Default 468*90',
        html: "<script> (function() {var admid = 'abc';function admGetUrlCk() {return '';}var __admLink = 'http://dantri.com.vn/';var doc = document, url = __admLink, ua = navigator.userAgent + '';var videourl = 'http://adi.admicro.vn/adt/cpc/cpm7k/html/upload/2016/10/ariston_1160x90/1160x90.html';var imageurl = 'https://s27.postimg.org/7nrjq8nar/top_468*90.jpg';var imgwidth = 468;var imgheight = 90;var html = '<div style=\"position:relative;\">';if (ua.indexOf('Android') != -1 || ua.indexOf('iPad') != -1 || ua.indexOf('iPhone') != -1) {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')} else {html += ('<img src=\"' + imageurl + '\" border=\"0\" /><a href=\"' + url + '\" target=\"_blank\" style=\"position:absolute; top:0; left:0; width:' + imgwidth + 'px; height:' + imgheight + 'px; display:block;z-index:9999;\"><span></span></a>')}html += '</div>';doc.write(html);})();</script>",
        width: 468,
        height: 90,
        keyword: 'datri',
        weight: 100,
        description: 'asd',
        imageUrl: '',
        url: '',
        target: '',
        isIFrame: true,
        isCountView: true,
        isFixIE: false,
        isDefault: false,
        isRelative: false,
      },
    ];
    return defaultBanner.reduce((acc, item) => {
      if (item.width === width && item.height === height) return item;
      return acc;
    }, 0);
  },
  // insert default place if share lack places.
  fixShare(share) {
    const sumPlaceArea = share.allPlacements.reduce((acc, item) => acc + item.PlacementArea, 0);
    const freeArea = share.shareArea - sumPlaceArea;
    // console.log('freeArea', freeArea);
    if (freeArea > 0) {
      console.log('placementFix');
      const PlacementTemplate = {
        id: '648334fb-63c8-4909-a406-fe3d68c952d9',
        name: 'Placement RS2 336x140',
        description: 'placement of Bong Da So',
        width: 0,
        height: 0,
        weight: 25,
        banners: [],
      };
      const placementFix = new Placement(PlacementTemplate);
      const getType = (width, height) => {
        if (width === 1160 && height === 90) {
          return 'top';
        }
        if (width === 336 && height === 560) {
          return 'right';
        }
        return '';
      };
      const convert = (area, type) => {
        if (type === 'top') {
          return {
            width: area * 468,
            height: 90,
          };
        }
        if (type === 'right') {
          return {
            width: 336,
            height: area * 140,
          };
        }
        return {
          width: 0,
          height: 0,
        };
      };
      const type = getType(share.width, share.height);
      console.log('type', type);
      const freeSize = convert(freeArea, type);
      console.log('freeSize', freeSize);
      placementFix.id = 'placement-default';
      placementFix.width = freeSize.width;
      placementFix.height = freeSize.height;
      console.log('placementFix', placementFix);
      const bannerDefault = this.getDefaultBanner(freeSize.width, freeSize.height);
      bannerDefault.weight = 100;
      bannerDefault.width = placementFix.width;
      bannerDefault.height = placementFix.height;
      console.log('Banner default', bannerDefault);
      placementFix.banners.push(new Banner(bannerDefault));
      share.placements.push(placementFix);
    }
    return share;
  },
  // compute factorial
  factorial(number) {
    let factored = 1;
    const compute = (value) => {
      const n = value;
      for (let i = n; i > 0; i -= 1) {
        if (n > 170) {
          return 'Hey! that is too big for my pea brain';
        }

        if (i === n) {
          factored = i;
        } else {
          factored *= i;
        }
      }
      return factored;
    };
    return compute(number);
  },
  // get result of combination : k of n elements.
  Combination(k, n) {
    return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
  },
  // create these combinations : k of array set => collection into array
  kCombinations(set, k) {
    let i;
    let j;
    let combs;
    let head;
    let tailcombs;

    // There is no way to take e.g. sets of 5 elements from
    // a set of 4.
    if (k > set.length || k <= 0) {
      return [];
    }

    // K-sized set has only one K-sized subset.
    if (k === set.length) {
      return [set];
    }

    // There is N 1-sized subsets in a N-sized set.
    if (k === 1) {
      combs = [];
      for (i = 0; i < set.length; i += 1) {
        combs.push([set[i]]);
      }
      return combs;
    }

    combs = [];
    for (i = 0; i < (set.length - k) + 1; i += 1) {
      // head is a list that includes only our current element.
      head = set.slice(i, i + 1);
      // We take smaller combinations from the subsequent elements
      tailcombs = this.kCombinations(set.slice(i + 1), k - 1);
      // For each (k-1)-combination we join it with the current
      // and store it to the set of k-combinations.
      for (j = 0; j < tailcombs.length; j += 1) {
        combs.push(head.concat(tailcombs[j]));
      }
    }
    return combs;
  },
  // create these combinations k-set.length of array set => collection into array
  combinations(set) {
    let kCombs;
    const combs = [];

    // Calculate all non-empty k-combinationsr
    for (let k = 1; k <= set.length; k += 1) {
      kCombs = this.kCombinations(set, k);
      for (let i = 0; i < kCombs.length; i += 1) {
        combs.push(kCombs[i]);
      }
    }
    return combs;
  },
  // check compete with places
  isCompete(allPlacement, placeOrder) {
    let count = 0;
    allPlacement.filter(placement => placement.index === placeOrder).reduce((acc, placement) => {
      if (placement.data.AdsType.revenueType !== acc) {
        count += 1;
      }
      return placement.data.AdsType.revenueType;
    }, 0);
    return count > 1;
  },
  // check compete with shares
  isCompete2(shares, placeOrder) {
    let placeInShare = [];
    shares.reduce((temp, share) =>
      (placeInShare = placeInShare.concat(share.allPlacements.map((item, index) =>
        ({ data: item, index })))), 0);
    return this.isCompete(placeInShare, placeOrder);
  },

  filterPlaceWithKeyword(places, arrRelativeKeyword) {
    const placesWithKeyword = places.filter(place =>
      place.data.allBanners.reduce((acc1, banner) => {
        const bannerKeyword = banner.keyword.split(',').map(item => item.replace(' ', ''));
        return arrRelativeKeyword.filter(key =>
            bannerKeyword.reduce((acc2, bannerKey, index2) =>
              (index2 === 0 ? bannerKey === key :
                (acc2 || bannerKey === key)), 0)).length > 0;
      }, 0));
    return placesWithKeyword;
  },

  getScriptTag(html) {
    let element = html;
    const evlScript = [];
    const scripts = [];
    const trim = (str) => {
      let strTemp = str;
      strTemp = strTemp.replace(/^\s+/, '');
      for (let i = strTemp.length - 1; i >= 0; i -= 1) {
        if (/\S/.test(strTemp.charAt(i))) {
          strTemp = strTemp.substring(0, i + 1);
          break;
        }
      }
      return strTemp;
    };
    // boc tach script
    const allScriptTag = html.match(/<(script)[^>]*>(.*?)<\/(script)>/gi);

    if (allScriptTag) {
      let jsCodeInsideScriptTag = '';
      for (let i = 0, len = allScriptTag.length; i < len; i += 1) {
        element = element.replace(allScriptTag[i], '');
        jsCodeInsideScriptTag = allScriptTag[i].replace(/<(script)[^>]*>(.*?)<\/(script)>/gi, '$2');
        if (trim(jsCodeInsideScriptTag) !== '') {
          evlScript.push(trim(jsCodeInsideScriptTag));
        }

        const srcAttribute = allScriptTag[i].match(/src="([^"]*)"/gi);
        if (srcAttribute) {
          const linkSrc = srcAttribute[0].replace(/src="([^"]*)"/gi, '$1');
          scripts.push(linkSrc);
        }
      }
    }
    return { scripts, evlScript };
  },

  installScript(el, ...url) {
    const newScriptTag = document.createElement('script');
    newScriptTag.type = 'text/javascript';
    newScriptTag.async = true;
    newScriptTag.src = url;
    if (url.length >= 2) {
      const arrLength = url[1];
      newScriptTag.onload = function () {
        const arr = arrLength;
        const strUrl = arr[0];
        arr.shift();
        if (arr.length >= 1) {
          this.installScript(el, strUrl, arr);
        } else {
          this.installScript(el, strUrl);
        }
      };
    }
    if (el === '') {
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(newScriptTag, firstScriptTag);
    } else {
      el.appendChild(newScriptTag);
    }
  },

  executeJS(html, id) {
    const scriptTag = this.getScriptTag(html);
    const elementContainer = document.getElementById(id);
    if (arguments.length >= 3) {
      if (elementContainer) {
        const stringDiv = html.match(/id="[^"]+"/i);
        if (stringDiv) {
          const divID = stringDiv[0].replace(/id="|"/gi, '');
          if (divID) {
            elementContainer.innerHTML = html;
            const divElement = document.getElementById(divID);
            if (divElement) {
              divElement.setAttribute('rel', id);
              const parentNode = elementContainer.parentNode;
              parentNode.replaceChild(divElement, elementContainer);
            }
          }
        }
      }
    } else if (elementContainer) {
      elementContainer.innerHTML = html;
      window.setTimeout(() => {
        elementContainer.style.display = '';
      }, 1000);
    }
    if (elementContainer && scriptTag.scripts.length > 0) {
      for (let i = 0; i < scriptTag.scripts.length; i += 1) {
        this.installScript(elementContainer, scriptTag.scripts[i]);
      }
    }
    if (scriptTag.evlScript.length > 0) {
      for (let i = 0, length = scriptTag.evlScript.length; i < length; i += 1) {
        eval(scriptTag.evlScript[i]); // eslint-disable-line
      }
    }
  },

  admLoadJs(urlLibrary, libName, callBack) { // eslint-disable-line
    const thisLib = document.getElementById(`${libName}`);
    if (thisLib == null) {
      const a = document.createElement('script');
      a.id = `${libName}`;
      a.type = 'text/javascript';
      a.src = urlLibrary;
      a.onload = () => {
        window.isLoadLib = true;
        callBack();
      };
      a.onreadystatechange = () => {
        ((a.readyState !== 4) && (a.readyState !== 'complete')) || callBack(); //eslint-disable-line
      };
      document.getElementsByTagName('head')[0].appendChild(a);
    }
  },

  resizeIFrameToFitContent(iFrame) {
    console.log(iFrame.contentWindow.document.body.scrollWidth,
        iFrame.contentWindow.document.body.scrollHeight);
    /* eslint-disable */
    iFrame.width = iFrame.contentWindow.document.body.scrollWidth;
    iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
    /* eslint-enable */
  },

  /* eslint-disable */
  admExecJs(html, id) {
    let element = html,
      evlScript = [],
      script = [];
    this.trim = function (str) {
      str = str.replace(/^\s+/, '');
      for (let i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
          str = str.substring(0, i + 1);
          break;
        }
      }
      return str;
    };
    this.explode = function () {
    // boc tach script
      let b = html.match(/<(script)[^>]*>(.*?)<\/(script)>/gi),
        e = [];
      if (b) {
        let d = '';
        for (let i = 0, len = b.length; i < len; i++) {
          element = element.replace(b[i], '');
          d = b[i].replace(/<(script)[^>]*>(.*?)<\/(script)>/gi, '$2');
          if (this.trim(d) != '') {
            evlScript.push(this.trim(d));
          }

          const t = b[i].match(/src="([^\"]*)\"/gi);
          if (t) {
            script.push(t[0].replace(/src="([^\"]*)\"/gi, '$1'));
          }
        }
      }
    };
    this.getFileScript = function (...url) {
      const a = document.createElement('script');
      a.type = 'text/javascript';
      a.async = true;
      a.src = url;
      const c = document.getElementsByTagName('script')[0];
      if (url.length >= 2) {
        const arrLength = url[1];
        a.onload = function () {
          const arr = arrLength;
          const strUrl = arr[0];
          arr.shift();
          if (arr.length >= 1) {
            callScript(strUrl, arr);
          } else {
            callScript(strUrl);
          }
        };
      }
      c.parentNode.insertBefore(a, c);
    };
    var callScript = this.getFileScript;
    this.explode();

    const id1 = document.getElementById(id);
    if (arguments.length >= 3) {
      if (id1) {
        const strDiv = element.match(/id=\"[^\"]+\"/i);
        if (strDiv) {
          const strId = strDiv[0].replace(/id="|"/gi, '');
          if (strId) {
            id1.innerHTML = element;
            const id2 = document.getElementById(strId);
            if (id2) {
              id2.setAttribute('rel', id);
              const parentNode = id1.parentNode;
              parentNode.replaceChild(id2, id1);
            }
          }
        }
      }
    } else if (id1) {
      id1.innerHTML = element;
      window.setTimeout(() => {
        id1.style.display = '';
      }, 1000);
    }

    if (script.length > 0) {
      if (script.length > 1) {
        const arr = script;
        const strUrl = script[0];
        arr.shift();
        this.getFileScript(strUrl, arr);
      } else {
        this.getFileScript(script[0]);
      }
    }
    if (evlScript.length > 0) {
      for (let i = 0, len = evlScript.length; i < len; i++) {
        eval(evlScript[i]);
      }
    }
  },
  /* eslint-enable */

  getCurrentBrowser() {
    let tem;
    let M;
    const ua = navigator.userAgent;
    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return `IE ${tem[1] || ''}`;
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    tem = ua.match(/version\/(\d+)/i);
    if (tem != null) {
      M.splice(1, 1, tem[1]);
    }
    const currentBrowser = M.join(' ').substring(0, (M.join(' ').indexOf(' '))).toLowerCase();
    return currentBrowser;
  },

  checkTwoArrayEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.sort().join() === arr2.sort().join();
  },
};

export default util;
