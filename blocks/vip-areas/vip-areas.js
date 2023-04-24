async function fetchVIPAreas() {
  const url = new URL(window.location);

  const resp = await fetch(`${url.origin}/area-vip/query-index.json`);
  const json = await resp.json();
  return json.data;
}

/**
 * decorates the vip areas block. Makes a query to get the available VIP areas pages
 * @param {Element} block The VIP areas element
 */
export default async function decorate(block) {
  const vipareas = await fetchVIPAreas();
  vipareas.map((area) => `
        <a href="${area.path}"><h3>${area.title}</h3></a>
        <p>${area.description}</p>
        <img src="${area.image}" </img>`)
    .map((html) => {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div;
    })
    .forEach((div) => block.appendChild(div));
}
