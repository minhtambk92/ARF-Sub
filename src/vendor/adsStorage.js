/**
 * Created by tlm on 06/03/2017.
 */

const adsStorage = {
  lcStorage: {
    timestamp: 'timestamp_',
    getExprises(cookie, type, start, endkey) {
      const cookietmp = `${cookie}`;
      const cstart = cookietmp.indexOf(type, start);
      const cookLen = cookietmp.length - 1;
      if (cstart !== -1) {
        let cend = cookietmp.indexOf(endkey, cstart);
        if (cend === -1) {
          cend = cookLen;
        }
        return cookietmp.substring(cstart, cend);
      }
      return '';
    },
    setItem(key, value, exprises) {
      let endchar = '';
      const date = new Date();
      let time = date.getTime();
      const timestamp = this.timestamp;
      if (exprises === 0 || exprises === '') {
        time += 864 * 1e5;
      } else {
        // thoi gian tinh theo phut
        time += exprises * 6 * 1e4;
      }
      if (key === '_azs') {
        endchar = ';';
      } else {
        endchar = ',';
      }
      const strTimeStamp = this.getExprises(value, timestamp, 0, endchar);
      let valuetmp = value;
      if (strTimeStamp === '') {
        valuetmp += timestamp + time.toString() + endchar;
      } else {
        valuetmp = value.replace(strTimeStamp, timestamp + time.toString());
      }
      localStorage.setItem(key, valuetmp);
    },
    getItem(key, chkTime) {
      let a = localStorage.getItem(key);
      let endchar = '';
      const date = new Date();
      const time = date.getTime();
      const timestamp = this.timestamp;
      if (a === '' || a == null) {
        return '';
      } else if (key === '_azs') {
        endchar = ';';
      } else {
        endchar = ',';
      }
      let strTimeStamp = this.getExprises(a, timestamp, 0, endchar);
      strTimeStamp = strTimeStamp.replace(timestamp, '');
      if (strTimeStamp === '' || isNaN(parseInt(strTimeStamp, 10)) || parseInt(strTimeStamp, 10) < time) {
        return '';
      }

      if (typeof (chkTime) !== 'undefined') {
        a = a.replace(timestamp + strTimeStamp + endchar, '');
      }
      return a;
    },
    removeItem(key) {
      localStorage.removeItem(key);
    },
    // clear all key value item
    flush() {
      localStorage.clear();
    },
  },
  setStorage(name, value, expires, path, domain, secure) {
    if (window.admislocalStorage) {
      this.lcStorage.setItem(name, value, expires);
      if (name === '__R' || name === '__RC') {
        this.setCookie(name, value, expires, path, domain, secure);
      }
    } else {
      this.setCookie(name, value, expires, path, domain, secure);
    }
  },
  getStorage(name) {
    if (window.admislocalStorage) {
      if (name === '__R' || name === '__RC') {
        return this.getCookie(name);
      }
      return this.lcStorage.getItem(name);
    }
    return this.getCookie(name);
  },
  setCookie(name, value, expires, path, domain, secure) {
    // const date = new Date();
    // const time = date.getTime();
    const pathTmp = (path === '') ? '/' : path;
    let expiresTmp = expires;
    if (expires === 0 || expires === '') {
      expiresTmp = (new Date(+(new Date()) + (864 * 1e5))).toGMTString();
    } else {
      expiresTmp = (new Date(+(new Date()) + (expires * 6e4))).toGMTString();
    }
    const r = [`${name}=${decodeURIComponent(value)}`];
    const s = {
      expiresTmp,
      pathTmp,
      domain,
    };
    // for (const i in s) {
    //   r.push(`${i}=${s[i]}`);
    // }
    function addtos(i) {
      r.push(`${i}=${s[i]}`);
    }

    Object.keys(s).reduce(addtos, 0);
    const res = secure && r.push('secure');
    document.cookie = r.join(':');
    return (res,
      document.cookie,
      true);
  },
  getCookie(cname) {
    if (document.cookie.length > 0) {
      let cstart = document.cookie.indexOf(`${cname}=`);
      if (cstart !== -1) {
        cstart = cstart + cname.length + 1;
        let cend = document.cookie.indexOf(';', cstart);
        if (cend === -1) cend = document.cookie.length;
        return decodeURIComponent(document.cookie.substring(cstart, cend));
      }
    }
    return '';
  },
  subCookie(cookie, type, start) {
    const cstart = cookie.indexOf(type, start);
    const cookLen = cookie.length - 1;
    if (cstart !== -1) {
      let cend = cookie.indexOf(';', cstart);
      if (cend === -1) {
        cend = cookLen;
      }
      return cookie.substring(cstart, cend);
    }
    return '';
  },
};

export default adsStorage;

