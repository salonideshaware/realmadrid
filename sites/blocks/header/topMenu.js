import {
  getNavLink,
} from '../../scripts/scripts.js';

export default function createTopMenu(data) {
  const menuItems = data.data.header.items[0].additionalNavigation.map((nav) => (
    `<li><a class='top-menu-item' href="${getNavLink(nav.url, nav.openNewWindow)}">${nav.title}</a></li>`
  )).join('');
  return `
    <ul class='top-menu'>${menuItems}</ul>
  `;
}
