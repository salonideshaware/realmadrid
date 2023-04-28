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

function addHamburger(block) {
  let state = false;
  const icon = () => {
    const src = `https://app-rm-spa-web-dev.azurewebsites.net/assets/icons/sprite/cibeles-sprite.svg#${state ? 'times' : 'menu'}`;
    return `<svg focusable="false" width="32" height="32" aria-hidden="true"><use xlink:href="${src}"></use></svg>`;
  };
  const menu = document.createElement('div');
  menu.setAttribute('style', 'width: 32px; height: 32px;');
  console.log(`menu button created, state: ${state}`);
  menu.innerHTML = icon();
  menu.addEventListener('click', () => {
    state = !state;
    console.log(`menu button clicked, state: ${state}`);
    menu.innerHTML = icon();
  });
  block.appendChild(menu);
}

function addMenu(data, block) {
  const menuItems = data.data.header.items[0].additionalNavigation.map((nav) => {
    return `<li><a class='menu-item' href="${nav.url}">${nav.title}</a></li>`;
  }).join('');

  block.appendChild(document.createRange().createContextualFragment(`
    <ul style='display: flex; flex-direction: row; list-style-type: none; gap: 1rem'>${menuItems}</ul>
  `));
}

function addLogos(block, data) {
  block.appendChild(document.createRange().createContextualFragment(`
    <svg focusable="false" width="40" height="40">
      <use xlink:href="https://app-rm-spa-web-dev.azurewebsites.net/assets/icons/sprite/cibeles-sprite.svg#logo-rm"></use>
   </svg>
  `));

  block.appendChild(document.createRange().createContextualFragment(`
    <img src='${data.data.header.items[0].additionalLogos[0]._publishUrl}' style="height: 40px;"/>
  `));
}

export default async function decorate(block) {
  console.log('decorating header');

  block.className = 'header';

  const data = await fetchData();
  console.log(data.data.header.items[0]);

  addHamburger(block);
  addLogos(block, data);
  addMenu(data, block);

  console.log('decorated header');
}
