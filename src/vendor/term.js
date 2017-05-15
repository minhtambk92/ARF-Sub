/**
 * Created by tlm on 06/03/2017.
 */

const term = {
  // get the path (admChannel or pageUrl) to check
  getPath2Check(type, variableName) {
    const globalVariable = eval(`typeof (${variableName}) !== 'undefined' && ${variableName} !== ''`) ? eval(variableName) : undefined; // eslint-disable-line no-eval
    if (typeof (globalVariable) !== 'undefined' && globalVariable !== '') { // eslint-disable-line no-undef,camelcase
      return decodeURIComponent(`${globalVariable}`); // eslint-disable-line no-undef,camelcase
    }
    const url = document.URL;
    const ref = document.referrer;
    let http = (type === 'Site:Pageurl') ? url.replace(/\?i=([0-9]+)&bz=([0-9]+)&z=([0-9]+)#([0-9_0-9]+)/g, '') : ref.replace(/\?i=([0-9]+)&bz=([0-9]+)&z=([0-9]+)#([0-9_0-9]+)/g, '');
    const arrUrlReg = http.match(/([^|]+)/i);
    if (arrUrlReg) {
      http = `${arrUrlReg[0]}`;
    }
    return http.toLowerCase();
  },
  getCurrentDomain(type) {
    const url = document.URL;
    const ref = document.referrer;
    let http = (type === 'Site:Pageurl') ? url.replace(/\?i=([0-9]+)&bz=([0-9]+)&z=([0-9]+)#([0-9_0-9]+)/g, '') : ref.replace(/\?i=([0-9]+)&bz=([0-9]+)&z=([0-9]+)#([0-9_0-9]+)/g, '');
    const arrUrlReg = http.match(/([^|]+)/i);
    if (arrUrlReg) {
      http = `${arrUrlReg[0]}`;
    }
    return http.toLowerCase();
  },
  // check logic
  checkPathLogic(data, type, logic) {
    const path2check = this.getPath2Check(type);
    switch (logic) {
      case '==':
        return (path2check === data);
      case '!=':
        return (path2check !== data);
      case '=~':
        return this.stringPosition(path2check, data, 0);
      case '!~':
        return !this.stringPosition(path2check, data, 0);
      case '=x': {
        const reg = new RegExp(data);
        return reg.test(path2check);
      }
      case '!x': {
        const reg = new RegExp(data);
        return !reg.test(path2check);
      }
      default:
        return false;
    }
  },
  // check path with data and logic( equal , contain , different ,..)
  checkPath(data, logic2) {
    if (data) {
      const len = data.length;
      let str = '';
      // var logic = '';
      for (let i = 0; i < len; i += 1) {
        if (data[i].data === undefined) {
          let str2 = '';
          let logic = '';
          for (let j = 0; j < data[i].length; j += 1) {
            logic = (data[i][j].join === 'or' ? '||' : '&&');
            str2 += ((j !== 0) ? logic : '') + this.checkPathLogic(data[i][j].data, data[i][j].type, data[i][j].logic);
          }
          str += `${(i !== 0) ? logic2 : ''}(${str2})`;
        } else {
          str += ((i !== 0) ? logic2 : '') + this.checkPathLogic(data[i].data, data[i].type, data[i].logic);
        }
      }
      return str;
    }
    return false;
  },

  stringPosition(path, data, offset) {
    const haystack = (`${path}`).toLowerCase();
    const needle = (`${data}`).toLowerCase();
    return haystack.indexOf(needle, offset) !== -1;
  },
};

export default term;
