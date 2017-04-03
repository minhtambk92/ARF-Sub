/**
 * Created by tlm on 06/03/2017.
 */

const screen = {
  getWidth() {
    let myWidth;
    if (typeof (window.innerWidth) === 'number') {
      // Non-IE
      myWidth = window.innerWidth;
    } else if (document.documentElement && (document.documentElement.clientWidth)) {
      // IE 6+ in 'standards compliant mode'
      myWidth = document.documentElement.clientWidth;
    } else if (document.body && (document.body.clientWidth)) {
      // IE 4 compatible
      myWidth = document.body.clientWidth;
    }
    return myWidth;
  },
  getHeight() {
    let myHeight;
    if (typeof (window.innerWidth) === 'number') {
      // Non-IE
      myHeight = window.innerHeight;
    } else if (document.documentElement && (document.documentElement.clientHeight)) {
      // IE 6+ in 'standards compliant mode'
      myHeight = document.documentElement.clientHeight;
    } else if (document.body && (document.body.clientHeight)) {
      // IE 4 compatible
      myHeight = document.body.clientHeight;
    }
    return myHeight;
  },
};

export default screen;
