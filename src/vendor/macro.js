/**
 * Created by TamLeMinh on 6/1/2017.
 */
const macro = {
  linkReplace: [{ macro: '%%WIDTH%%', link: 'http://width.com' },
    { macro: '%%HEIGHT%%', link: 'http://height.com' },
    { macro: '%%CLICK_URL_ESC%%', link: 'http://clickUrlEsc.com' },
    { macro: '%%CACHEBUSTER%%', link: 'http://CacheBuster.com' },
    { macro: '%%CLICK_URL_UNESC%%', link: 'http://clickURLUNEsc.com' }],
  getAllMacro(str) {
    const result = str.match(/%%(.+?)%%/g);
    return result !== null ? result : [];
  },
  getLinkMacro(macroStr) {
    for (let i = 0; i < this.linkReplace.length; i += 1) {
      if (macroStr === this.linkReplace[i].macro) {
        return this.linkReplace[i].link;
      }
    }
    return '';
  },
  replaceMacro(str) {
    let strTemp = str;
    const allMacro = this.getAllMacro(strTemp);
    console.log('allMacro', allMacro);
    if (allMacro.length > 0) {
      for (let i = 0; i < allMacro.length; i += 1) {
        const link = this.getLinkMacro(allMacro[i]);
        strTemp = strTemp.replace(allMacro[i], link);
        console.log('macro', strTemp);
      }
    }
    return strTemp;
  },
};

export default macro;
