// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
  fetchPlaceholders,
  getMetadata,
} from './lib-franklin.js';

// eslint-disable-next-line import/no-cycle
import {
  loadScript,
  getCurrentSection,
  getLanguage,
} from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
function pushPageLoadEvent() {
  window.rm = window.rm || {};
  const currentSection = getCurrentSection();
  const currentPathArray = window.location.pathname.split('/');
  const trackingPageName = currentPathArray.length > 3 ? ['realmadrid', currentSection].concat(currentPathArray.slice(3)) : ['realmadrid'].concat(currentPathArray);
  const age = window.rm.user ? (new Date(new Date(window.rm.user.birthDateTime) - new Date()).getUTCFullYear() - 1970) : '';

  window.adobeDataLayer.push({
    event: 'pageLoad',
    webPageDetails: {
      pageName: trackingPageName.join(':'),
      pageTitle: getMetadata('title'),
      pageURL: window.location.href,
      pageSection: currentSection,
      pageLevel1: trackingPageName.length > 1 ? trackingPageName[1] : '',
      pageLevel2: trackingPageName.length > 2 ? trackingPageName[2] : '',
      pageLevel3: trackingPageName.length > 3 ? trackingPageName[3] : '',
      pageLevel4: trackingPageName.length > 4 ? trackingPageName[4] : '',
      pageType: currentSection,
      previousPageURL: document.referrer,
      pageLang: getLanguage(),
      country: getLanguage(),
    },
    identification: {
      idpID: window.rm.user ? window.rm.user.id : '',
    },
    user: {
      userLoginStatus: window.rm.user ? 'authenticated' : 'not_authenticated',
      userLoyaltyStatus: window.rm.user ? window.rm.user.tier : '',
      userAge: age,
      // userGender: '<value>',
    },
  });
}

// Load one trust script if not preview and not localhost

if (!window.location.host.includes('hlx.page') && !window.location.host.includes('localhost')) {
  const { onetrustId } = fetchPlaceholders();
  if (onetrustId) {
    loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', {
      type: 'text/javascript',
      charset: 'UTF-8',
      'data-domain-script': `${onetrustId}`,
    });

    window.OptanonWrapper = () => {
      // eslint-disable-next-line no-undef
      if (typeof RMOneTrustLoaded === 'undefined' || RMOneTrustLoaded !== true) {
        window.RMOneTrustLoaded = true;
        const event = new Event('RMOneTrustLoaded');
        window.dispatchEvent(event);
      }
    };
  }
}
// End one trust

// Init Adobe data layer
window.adobeDataLayer = window.adobeDataLayer || [];
window.adobeDataLayerInPage = true;

// Load Adobe Experience platform data collection (Launch) script
if (!window.location.host.includes('hlx.page') && !window.location.host.includes('localhost')) {
  loadScript('https://assets.adobedtm.com/ab05854e772b/7bc47c0b7114/launch-d2e30cc4a650.min.js');
} else {
  loadScript('https://assets.adobedtm.com/ab05854e772b/7bc47c0b7114/launch-13b7c868e0a9-staging.min.js');
}
pushPageLoadEvent();
