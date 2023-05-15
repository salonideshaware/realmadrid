export default function createMainMenu(data) {
  const menuItems = data.data.header.items[0].additionalNavigation.map((nav) => (
    `<li><a class='menu-item' href="${nav.url}">${nav.title}</a></li>`
  )).join('');
  return `
    <ul class='main-menu'>${menuItems}</ul>
  `;
}
