import createTopMenu from './topMenu.js';
import addPopupMenuButton from './popupMenuButton.js';
import {
  fetchNavigationConfig,
  fetchLanguagePlaceholders,
  getNavLink,
  getLocale,
} from '../../scripts/scripts.js';

import {
  fetchAuthConfiguration, getEnvironment,
  getUserSession,
  signIn,
} from './auth.js';

export default async function decorate(block) {
  const data = await fetchNavigationConfig();
  let lastScroll = 0;
  document.addEventListener('scroll', () => {
    if (lastScroll < window.scrollY) {
      block.classList.add('hidden');
    } else {
      block.classList.remove('hidden');
    }
    lastScroll = window.scrollY;
  });

  await addPopupMenuButton(block, data);

  const sponsorIcons = data.data.header.items[0].sponsors.map((sponsor) => (
    // eslint-disable-next-line no-underscore-dangle
    `<a href="${getNavLink(sponsor.url, sponsor.openNewWindow ?? false)}" target="${sponsor.openNewWindow ? '_blank' : '_self'}" class="header-sponsor-link"><img src='${sponsor.logo._publishUrl}' class="header-sponsor-icon" alt="${sponsor.title}"/></a>`
  )).join('');
  const { sponsorsLink } = data.data.header.items[0];

  const logo = data.data.header.items[0].additionalLogos[0];
  // eslint-disable-next-line no-underscore-dangle
  const logoImg = logo && logo.image ? `<a href="${getNavLink(logo.url, logo.openNewWindow)}" style="width: 40px; height: 40px"> <img src='${logo.image._publishUrl}'
     style="width: 40px; height: 40px; margin-left: 16px" alt="${logo.title}"/></a>` : '';
  const { login } = await fetchLanguagePlaceholders();

  let userSession;
  try {
    userSession = await getUserSession();
  } catch (error) {
    console.error(error);
  }

  window.rm = window.rm || {};
  window.rm.user = userSession ? userSession.user : '';

  const loginFragment = window.rm.user
    ? `<button class="profile-button">
      ${window.rm.user.name[0]}${window.rm.user.surname[0]}
    </button>`
    : `<button class="login-button">
      <svg focusable="false" width="16" height="16" aria-hidden="true" style="margin-left: 0; filter: invert(26%) sepia(75%) saturate(7487%) hue-rotate(245deg) brightness(95%) contrast(107%);">
        <use xlink:href="${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#profile"></use>
      </svg>
      ${login}
    </button>`;

  block.appendChild(document.createRange().createContextualFragment(`
    <div class="header-menu">
    <!-- Logos -->
    <div style="flex: 0 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin: 0 9px 0 10px">
      <a href="/${getLocale()}" class="rm-link-logo" style="height: 40px" aria-label="Logos">
        <svg focusable="false" width="40" height="40">
          <use xlink:href="${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#logo-rm"></use>
        </svg>
      </a>
      <div style="width: 1px; height: 32px; border-right: 1px solid #e1e5ea; margin-left: 9px"></div>
      ${logoImg}
    </div>
      ${createTopMenu(data)}
      <div class="header-left-section">
        ${sponsorIcons}
        <a class="header-sponsors-link" href="${sponsorsLink?.url}" aria-label="Sponsor Links">
          <svg focusable="false" width="24" height="24" style="margin-right: 9px;">
            <use xlink:href="${window.hlx.codeBasePath}/blocks/header/cibeles-sprite.svg#dots-v"></use>
          </svg>
        </a>
        ${loginFragment}
      </div>
    </div>
  `));

  block.querySelector('.login-button')?.addEventListener('click', async () => {
    // 2-User lands on Franklin page without prev sign-in.
    // In this case you need to integrate 2 features:
    // 2A-Integrate with login => 3.1 -> 3.3 from the guide
    try {
      const authConfig = await fetchAuthConfiguration(getEnvironment());
      signIn(authConfig.signInBaseUrl, { clientId: authConfig?.socialProviders?.rm });
    } catch (error) {
      console.error(error);
    }
  });
}
