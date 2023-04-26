async function fetchVIPAreas() {
  const url = new URL(window.location);

  const resp = await fetch(`${url.origin}/area-vip/query-index.json`);
  const json = await resp.json();
  return json.data;
}

function areaTemplate(area) {
  return `
    <a href="${area.path}">
      <img src="${area.image}" alt="${area.title}"/>
      <div class="info">
        <h3>${area.title}</h3>
        <p>${area.description}</p>
      </div>
    </a>
  `;
}

/**
 * decorates the vip areas block. Makes a query to get the available VIP areas pages
 * @param {Element} block The VIP areas element
 */
export default async function decorate(block) {
  function toListItem(html) {
    const li = document.createElement('li');
    li.innerHTML = html;
    return li;
  }

  const vipareas = await fetchVIPAreas();
  const ul = document.createElement('ul');

  vipareas.map(areaTemplate)
    .map(toListItem)
    .forEach((li) => ul.appendChild(li));
  block.append(ul);
}
