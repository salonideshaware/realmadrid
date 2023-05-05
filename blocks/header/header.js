const DATA_URL = 'https://publish-p47754-e237356.adobeaemcloud.com/graphql/execute.json/realmadridmastersite/structurePage%3Balang=es-es';

async function fetchData() {
  try {
    const response = await fetch(DATA_URL);
    return await response.json();
  } catch (error) {
    console.error(error);
  }
  return null;
}

function createPopupMenu(data) {
  const hasChildrenIcon = `
    <svg focusable="false" width="18" height="18" aria-hidden="true">
      <use xlink:href="blocks/header/cibeles-sprite.svg#chevron-right"></use>
    </svg>`;
  const menuItems = data.data.header.items[0].mainNavigation.map((nav) => (
    `<li><a class='menu-item' href="${nav.url}">${nav.title}${nav.childNavigationItems.length ? hasChildrenIcon : ''}</a></li>`
  )).join('');
  return `
    <ul style='display: flex; flex: 0 0; flex-direction: column; list-style-type: none; gap: 1rem; justify-content: space-around; padding: 0; white-space: nowrap'>${menuItems}</ul>
  `;
}

function addHamburger(block, data) {
  let state = false;
  const icon = () => {
    const src = `blocks/header/cibeles-sprite.svg#${state ? 'times' : 'menu'}`;
    return `
        <svg focusable="false" width="32" height="32" aria-hidden="true">
            <use xlink:href="${src}"></use>
        </svg>
    `;
  };
  const popup = document.createElement('div');
  popup.style.display = state ? 'block' : 'none';
  popup.style.position = 'absolute';
  block.appendChild(popup);
  popup.innerHTML = `
    <div style="width: 600px; height: 2000px; background-color: #fff; position: absolute; top: 50px; left: 0; z-index: 100; overflow: hidden">
        <p>${createPopupMenu(data)}</p>
    </div>
  `;
  const menu = document.createElement('div');
  menu.setAttribute('style', 'width: 32px; height: 32px; background-color: #fff; border-radius: 5px');
  console.log(`menu button created, state: ${state}`);
  menu.innerHTML = icon();
  menu.addEventListener('click', () => {
    state = !state;
    console.log(`menu button clicked, state: ${state}`);
    menu.innerHTML = icon();
    popup.style.display = state ? 'block' : 'none';
  });
  block.appendChild(menu);
}

function createMenu(data) {
  const menuItems = data.data.header.items[0].additionalNavigation.map((nav) => (
    `<li><a class='menu-item' href="${nav.url}">${nav.title}</a></li>`
  )).join('');
  return `
    <ul style='display: flex; flex: 0 0; flex-direction: row; list-style-type: none; gap: 1rem; justify-content: space-around; padding: 0; white-space: nowrap'>${menuItems}</ul>
  `;
}

export default async function decorate(block) {
  console.log('decorating header');

  block.className = 'header';

  const data = await fetchData();
  console.log(data.data.header.items[0]);

  addHamburger(block, data);

  // eslint-disable-next-line no-underscore-dangle
  const logoUrl = data.data.header.items[0].additionalLogos[0]._publishUrl;

  block.appendChild(document.createRange().createContextualFragment(`
    <div style="flex: 1 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; padding-right: 10px">
      <!-- Logos -->
      <div style="flex: 0 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 10px">
        <svg focusable="false" width="40" height="40">
          <use xlink:href="blocks/header/cibeles-sprite.svg#logo-rm"></use>
        </svg>
        <div style="width: 1px; height: 40px; border-right: 1px solid #888"></div>
        <img src='${logoUrl}' style="width: 40px; height: 40px; margin-left: 10px"/>
      </div>
      ${createMenu(data)}
      <div style="flex: 0; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 10px">
        <svg focusable="false" width="24" height="24">
          <use xlink:href="blocks/header/cibeles-sprite.svg#dots-v"></use>
        </svg>
        <button style="border-color: #3e31fa; color: #3e31fa; border-radius: 5px; background-color: transparent; flex: 0 0 auto; display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 10px; padding: 5px 10px">
          <svg focusable="false" width="16" height="16" aria-hidden="true" style="filter: invert(26%) sepia(75%) saturate(7487%) hue-rotate(245deg) brightness(95%) contrast(107%);">
            <use xlink:href="blocks/header/cibeles-sprite.svg#profile"></use>
          </svg>
          <div>Acceso</div>
        </button>
      </div>
    </div>
  `));

  console.log('decorated header');
}
