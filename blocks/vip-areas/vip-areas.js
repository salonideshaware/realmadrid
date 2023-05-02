import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const VIP_AREA_REST_API = '/area-vip/query-index.json';

async function fetchVIPAreas() {
  const url = new URL(window.location);

  try {
    const resp = await fetch(`${url.origin}${VIP_AREA_REST_API}`);
    const json = await resp.json();
    return json.data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(`unable to fetch vip areas ${e}`);
  }
  return [];
}

function areaElement(area) {
  const breakpoints = [
    { media: '(min-width: 990px)', width: '960' },
    { width: '1280' },
  ];
  const picture = createOptimizedPicture(area.image, area.title, false, breakpoints);
  const li = document.createElement('li');
  li.innerHTML = `
    <a href="${area.path}">
      <div class="info">
        <h3>${area.title}</h3>
        <p>${area.description}</p>
      </div>
    </a>
  `;
  const anchor = li.querySelector('a');
  anchor.insertAdjacentElement('afterbegin', picture);
  return li;
}

/**
 * decorates the vip areas block. Makes a query to get the available VIP areas pages
 * @param {Element} block The VIP areas element
 */
export default async function decorate(block) {
  const vipareas = await fetchVIPAreas();
  const ul = document.createElement('ul');

  vipareas.map(areaElement)
    .forEach((li) => ul.appendChild(li));
  block.append(ul);
}