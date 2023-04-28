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

/**
 * decorates the header.
 *
 * Placeholder for now until decision who/how/if we are going to
 * do the header ourselfs.
 *
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  console.log('decorating header');
  block.setAttribute('style', 'height: var(--nav-height); display: flex; flex-direction: row; list-style-type: none; gap: 1rem;');

  const data = await fetchData();

  console.log(data.data.header.items[0]);

  const image = document.createElement('img');
  // eslint-disable-next-line no-underscore-dangle
  image.src = data.data.header.items[0].additionalLogos[0]._publishUrl;
  block.appendChild(image);

  const ul = document.createElement('ul');
  ul.setAttribute('style', 'display: flex; flex-direction: row; list-style-type: none; gap: 1rem;');
  block.appendChild(ul);
  data.data.header.items[0].additionalNavigation.forEach((nav) => {
    const li = document.createElement('li');
    ul.appendChild(li);
    const link = document.createElement('a');
    link.href = nav.url;
    link.innerHTML = nav.title;
    li.appendChild(link);
  });

  console.log('decorated header');
}
