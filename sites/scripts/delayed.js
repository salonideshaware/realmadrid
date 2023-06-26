// eslint-disable-next-line import/no-cycle
import {
  sampleRUM,
  fetchPlaceholders,
} from './lib-franklin.js';

// eslint-disable-next-line import/no-cycle
import {
  loadScript,
} from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

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
// End launch
