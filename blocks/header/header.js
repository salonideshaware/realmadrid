import createMainMenu from './topMenu.js';
import addPopupMenuButton from './popupMenuButton.js';
import { fetchNavigationConfig } from '../../scripts/scripts.js';

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

  addPopupMenuButton(block, data);

  const sponsorIcons = data.data.header.items[0].sponsors.map((sponsor) => (
    // eslint-disable-next-line no-underscore-dangle
    `<img src='${sponsor.logo._publishUrl}' class="header-sponsor-icon"/>`
  )).join('');

  // eslint-disable-next-line no-underscore-dangle
  const logoUrl = data.data.header.items[0].additionalLogos[0]._publishUrl;

  block.appendChild(document.createRange().createContextualFragment(`
    <div style="flex: 1 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
      <!-- Logos -->
      <div style="flex: 0 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin: 0 9px 0 10px">
        <svg focusable="false" width="40" height="40">
          <use xlink:href="/blocks/header/cibeles-sprite.svg#logo-rm"></use>
        </svg>
        <div style="width: 1px; height: 32px; border-right: 1px solid #e1e5ea; margin-left: 9px"></div>
        <img src='${logoUrl}' style="width: 40px; height: 40px; margin-left: 16px"/>
      </div>
      ${createMainMenu(data)}
      <div class="header-left-section">
        ${sponsorIcons}
        <a class="header-sponsors-link" href="https://app-rm-spa-web-stg.azurewebsites.net/sobre-el-real-madrid/el-club/patrocinadores">
          <svg focusable="false" width="24" height="24" style="margin-right: 9px; filter: invert(75%) sepia(18%) saturate(182%) hue-rotate(178deg) brightness(95%) contrast(87%);">
            <use xlink:href="/blocks/header/cibeles-sprite.svg#dots-v"></use>
          </svg>
        </a>
        <button class="login-button">
          <svg focusable="false" width="16" height="16" aria-hidden="true" style="margin-left: 0px; filter: invert(26%) sepia(75%) saturate(7487%) hue-rotate(245deg) brightness(95%) contrast(107%);">
            <use xlink:href="/blocks/header/cibeles-sprite.svg#profile"></use>
          </svg>
          Acceso
        </button>
      </div>
    </div>
  `));
}
