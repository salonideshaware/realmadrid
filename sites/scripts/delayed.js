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
  DOCROOT,
} from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

// Calculates the payload for tracking page load event.
function getPageLoadTrackingPayload() {
  const currentSection = getCurrentSection();
  if (!currentSection) {
    // we don't want to track page views out of the vip-area or tour
    return null;
  }

  // Calculate page details
  const currentLanguage = getLanguage();
  let trackingPath = window.location.pathname;
  if (currentLanguage !== 'es') {
    // generate page name from spanish path, if possible
    trackingPath = getMetadata('primary-language-url') || trackingPath.replace(`/${currentLanguage}/`, '/');
  }
  // get rid of the prefix
  trackingPath = trackingPath.replace(`${DOCROOT}/`, '');

  const trackingPathArray = trackingPath.split('/');
  const trackingPageName = trackingPathArray.length > 1 ? ['realmadrid', currentSection].concat(trackingPathArray.slice(1))
    : ['realmadrid'].concat(trackingPathArray);

  const webPageDetails = {
    pageName: trackingPageName.join(':'),
    pageTitle: getMetadata('og:title'),
    pageURL: window.location.href,
    pageSection: currentSection,
    pageLevel1: trackingPageName.length > 1 ? trackingPageName[1] : '',
    pageLevel2: trackingPageName.length > 2 ? trackingPageName[2] : '',
    pageLevel3: trackingPageName.length > 3 ? trackingPageName[3] : '',
    pageLevel4: trackingPageName.length > 4 ? trackingPageName[4] : '',
    pageType: currentSection,
    previousPageURL: document.referrer,
    pageLang: currentLanguage,
    country: currentLanguage,
    cms: 'aem_franklin',
  };

  // Replace dashes with underscores in values for specific properties
  ['pageName', 'pageSection', 'pageLevel1', 'pageLevel2', 'pageLevel3', 'pageType'].forEach((key) => {
    if (webPageDetails[key]) {
      webPageDetails[key] = webPageDetails[key].replace(/-/g, '_');
    }
  });

  // Get the pageName we want to track. e.g. realmadrid:tour:colegios:classic
  // We try to use the path to the page in Spanish.
  window.rm = window.rm || {};
  const userInfo = window.rm.user;

  const identification = {
    idpID: userInfo ? userInfo.id : '',
  };

  let age = '';
  try {
    age = userInfo && userInfo.birthDateTime ? (new Date(new Date(userInfo.birthDateTime) - new Date()).getUTCFullYear() - 1970) : '';
  } catch (error) {
    // ignore error while calculating age. Submit empty age.
  }

  const user = {
    userLoginStatus: userInfo ? 'authenticated' : 'not_authenticated',
    userLoyaltyStatus: userInfo ? userInfo.tier : '',
    userAge: age,
    // userGender: '<value>',
  };

  return {
    webPageDetails,
    identification,
    user,
  };
}

function pushPageLoadEvent() {
  // Init Adobe data layer
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayerInPage = true;

  const trackingPayload = getPageLoadTrackingPayload();

  if (trackingPayload) {
    window.adobeDataLayer.push({
      event: 'pageLoad',
      ...trackingPayload,
    });
  }
}
const { onetrustId, launchPrdScript, launchStgScript } = await fetchPlaceholders(DOCROOT);
// Load one trust script if not preview and not localhost
if (!window.location.host.includes('hlx.page') && !window.location.host.includes('localhost')) {
  if (onetrustId) {
    loadScript('https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', {
      type: 'text/javascript',
      charset: 'UTF-8',
      'data-domain-script': `${onetrustId}`,
      async: true,
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

// Load Adobe Experience platform data collection (Launch) script
if (!window.location.host.includes('hlx.page') && !window.location.host.includes('localhost')) {
  loadScript(`https://assets.adobedtm.com${launchPrdScript}`);
} else {
  loadScript(`https://assets.adobedtm.com${launchStgScript}`);
}
pushPageLoadEvent();
