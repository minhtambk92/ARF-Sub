const detectDevice = {
  isMobile() {
    const applePhone = /iPhone/i;
    const appleIpod = /iPod/i;
    const appleTablet = /iPad/i;
    const androidPhone = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i; // Match 'Android' AND 'Mobile'
    const androidTablet = /Android/i;
    const amazonPhone = /(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i;
    const amazonTablet = /(?=.*\bAndroid\b)(?=.*\b(?:KFOT|KFTT|KFJWI|KFJWA|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|KFARWI|KFASWI|KFSAWI|KFSAWA)\b)/i;
    const windowsPhone = /Windows Phone/i;
    const windowsTablet = /(?=.*\bWindows\b)(?=.*\bARM\b)/i; // Match 'Windows' AND 'ARM'
    const otherBlackberry = /BlackBerry/i;
    const otherBlackberry10 = /BB10/i;
    const otherOpera = /Opera Mini/i;
    const otherChrome = /(CriOS|Chrome)(?=.*\bMobile\b)/i;
    const otherFirefox = /(?=.*\bFirefox\b)(?=.*\bMobile\b)/i; // Match 'Firefox' AND 'Mobile'
    const sevenInch = new RegExp(
        '(?:' +         // Non-capturing group

        'Nexus 7' +     // Nexus 7

        '|' +           // OR

        'BNTV250' +     // B&N Nook Tablet 7 inch

        '|' +           // OR

        'Kindle Fire' + // Kindle Fire

        '|' +           // OR

        'Silk' +        // Kindle Fire, Silk Accelerated

        '|' +           // OR

        'GT-P1000' +    // Galaxy Tab 7 inch

        ')',            // End non-capturing group

        'i');           // Case-insensitive matching
    const match = (regex, userAgent) => regex.test(userAgent);
    const isMobileClass = (userAgent) => {
      let ua = userAgent || navigator.userAgent;

      // Facebook mobile app's integrated browser adds a bunch of strings that
      // match everything. Strip it out if it exists.
      let tmp = ua.split('[FBAN');
      if (typeof tmp[1] !== 'undefined') {
        ua = tmp[0];
      }

      // Twitter mobile app's integrated browser on iPad adds a "Twitter for
      // iPhone" string. Same probable happens on other tablet platforms.
      // This will confuse detection so strip it out if it exists.
      tmp = ua.split('Twitter');
      if (typeof tmp[1] !== 'undefined') {
        ua = tmp[0];
      }

      this.apple = {
        phone: match(applePhone, ua),
        ipod: match(appleIpod, ua),
        tablet: !match(applePhone, ua) && match(appleTablet, ua),
        device: match(applePhone, ua) || match(appleIpod, ua) || match(appleTablet, ua),
      };
      this.amazon = {
        phone: match(amazonPhone, ua),
        tablet: !match(amazonPhone, ua) && match(amazonTablet, ua),
        device: match(amazonPhone, ua) || match(amazonTablet, ua),
      };
      this.android = {
        phone: match(amazonPhone, ua) || match(androidPhone, ua),
        tablet: !match(amazonPhone, ua) && !match(androidPhone, ua) && (match(amazonTablet, ua) || match(androidTablet, ua)),
        device: match(amazonPhone, ua) || match(amazonTablet, ua) || match(androidPhone, ua) || match(androidTablet, ua),
      };
      this.windows = {
        phone: match(windowsPhone, ua),
        tablet: match(windowsTablet, ua),
        device: match(windowsPhone, ua) || match(windowsTablet, ua),
      };
      this.other = {
        blackberry: match(otherBlackberry, ua),
        blackberry10: match(otherBlackberry10, ua),
        opera: match(otherOpera, ua),
        firefox: match(otherFirefox, ua),
        chrome: match(otherChrome, ua),
        device: match(otherBlackberry, ua) || match(otherBlackberry10, ua) || match(otherOpera, ua) || match(otherFirefox, ua) || match(otherChrome, ua),
      };
      this.seven_inch = match(sevenInch, ua);
      this.any = this.apple.device || this.android.device || this.windows.device || this.other.device || this.seven_inch;

      // excludes 'other' devices and ipods, targeting touchscreen phones
      this.phone = this.apple.phone || this.android.phone || this.windows.phone;

      // excludes 7 inch devices, classifying as phone or tablet is left to the user
      this.tablet = this.apple.tablet || this.android.tablet || this.windows.tablet;

      return this;
    };
    return isMobileClass();
  },
};

export default detectDevice;

