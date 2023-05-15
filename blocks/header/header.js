import fetchMenuData from './utils.js';
import createPopupMenu from './popupMenu.js';
import createMainMenu from './mainMenu.js';

function addHamburger(block, data) {
  let state = false;
  const icon = () => {
    const src = `/blocks/header/cibeles-sprite.svg#${state ? 'times' : 'menu'}`;
    return `
        <svg focusable="false" width="24" height="24" aria-hidden="true">
            <use xlink:href="${src}"></use>
        </svg>
    `;
  };
  const popup = createPopupMenu(data);
  block.appendChild(popup);
  const menu = document.createElement('div');
  menu.setAttribute('style', 'background-color: #fff; border-radius: 5px; padding: 0px 9px; display: flex; flex-direction: column; justify-content: center; align-items: center');
  console.log(`menu button created, state: ${state}`);
  menu.innerHTML = icon();
  menu.addEventListener('click', () => {
    state = !state;
    menu.innerHTML = icon();
    if (state) {
      popup.classList.add('visible');
      document.body.style.overflow = 'hidden';
    } else {
      popup.classList.remove('visible');
      document.body.style.overflow = 'auto';
    }
  });
  block.appendChild(menu);
}

export default async function decorate(block) {
  console.log('decorating header');

  block.className = 'header';

  let lastScroll = 0;
  document.addEventListener('scroll', () => {
    if (lastScroll < window.scrollY) {
      block.classList.add('hidden');
    } else {
      block.classList.remove('hidden');
    }
    lastScroll = window.scrollY;
  });

  const data = await fetchMenuData();
  console.log(data.data.header.items[0]);

  addHamburger(block, data);

  // eslint-disable-next-line no-underscore-dangle
  const logoUrl = data.data.header.items[0].additionalLogos[0]._publishUrl;
  // eslint-disable-next-line no-underscore-dangle
  const sponsorUrl = data.data.header.items[0].sponsors[1].logo._publishUrl;

  block.appendChild(document.createRange().createContextualFragment(`
    <div style="flex: 1 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center">
      <!-- Logos -->
      <div style="flex: 0 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 10px">
        <svg focusable="false" width="40" height="40">
          <use xlink:href="/blocks/header/cibeles-sprite.svg#logo-rm"></use>
        </svg>
        <div style="width: 1px; height: 32px; border-right: 1px solid #e1e5ea"></div>
        <img src='${logoUrl}' style="width: 40px; height: 40px; margin-left: 10px"/>
      </div>
      ${createMainMenu(data)}
      <div style="flex: 0; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 10px">
        <img src='${sponsorUrl}' style="width: 57px; height: 40px; margin-left: 10px"/>
        <svg focusable="false" width="24" height="24" style="filter: invert(75%) sepia(18%) saturate(182%) hue-rotate(178deg) brightness(95%) contrast(87%);">
          <use xlink:href="/blocks/header/cibeles-sprite.svg#dots-v"></use>
        </svg>
        <button>
          <svg focusable="false" width="16" height="16" aria-hidden="true" style="filter: invert(26%) sepia(75%) saturate(7487%) hue-rotate(245deg) brightness(95%) contrast(107%);">
            <use xlink:href="/blocks/header/cibeles-sprite.svg#profile"></use>
          </svg>
          <div>Acceso</div>
        </button>
      </div>
    </div>
  `));

  console.log('decorated header');
}
