export default function createPopupMenu(data) {
  const popupArea = document.createElement('div');
  popupArea.classList.add('popup-menu-area');

  const popup = document.createElement('div');
  popup.classList.add('popup-menu');
  popupArea.appendChild(popup);

  popup.innerHTML = '<div class=".popup-background"></div>';

  const hasChildrenIcon = `
    <svg focusable="false" width="18" height="18" aria-hidden="true">
      <use xlink:href="/blocks/header/cibeles-sprite.svg#chevron-right"></use>
    </svg>`;

  const subMenu = document.createElement('div');
  subMenu.classList.add('sub-menu-area');

  const imageArea = document.createElement('div');
  imageArea.classList.add('image-menu-area');

  const updateSubMenu = (index) => {
    subMenu.innerHTML = data.data.header.items[0]
      .mainNavigation[index].childNavigationItems.map((nav) => (
      `<li><a class='menu-item' href="${nav.url}">${nav.title}</a></li>`
    )).join('');
    if (data.data.header.items[0].mainNavigation[index].image) {
      // eslint-disable-next-line no-underscore-dangle
      const imageUrl = data.data.header.items[0].mainNavigation[index].image._publishUrl;
      imageArea.innerHTML = `
        <img src="${imageUrl}"></img>
      `;
    } else {
      imageArea.innerHTML = '';
    }
  };

  updateSubMenu(data.data.header.items[0].mainNavigation
    .findIndex((nav) => nav.childNavigationItems.length));

  const mainMenu = document.createElement('ul');
  mainMenu.classList.add('main-menu-area');
  data.data.header.items[0].mainNavigation.forEach((nav, index) => {
    const menuItem = document.createElement('li');
    const link = document.createElement('a');
    link.setAttribute('class', 'menu-item');
    link.textContent = nav.title;
    if (nav.childNavigationItems.length) {
      link.innerHTML += hasChildrenIcon;
      link.addEventListener('click', (e) => {
        console.log(index);
        e.preventDefault();
        updateSubMenu(index);
      });
    } else {
      link.setAttribute('href', nav.url);
    }
    menuItem.appendChild(link);
    mainMenu.appendChild(menuItem);
  });

  popup.appendChild(mainMenu);
  popup.appendChild(subMenu);
  popup.appendChild(imageArea);

  const footer = document.createElement('div');
  popup.appendChild(footer);
  footer.classList.add('footer-menu-area');
  footer.innerHTML = '<button class="footer-menu-item">ES</button>';

  return popupArea;
}