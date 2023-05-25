import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  // get tour category
  const tourCategory = block.children[0].children[0].textContent.trim();

  // load list of tours
  // TODO : make it language aware
  const resp = await fetch(`${document.location.pathname}/tours.json`);
  if (!resp.ok) {
    block.textContent = '';
    return;
  }

  // get the tours for the selected category
  const selectedTours = (await resp.json()).data.filter((tour) => {
    // get assigned categories
    const categories = tour.Categories.split(',').map((categoryEntry) => categoryEntry.trim());
    // check
    return categories.includes(tourCategory) && tour['Show on Category Page'].trim().toLowerCase().startsWith('y');
  });

  console.log(selectedTours);

  // get placeholders
  const placeholders = await fetchPlaceholders();
  const { buy, itIncludes, moreInformation } = placeholders;

  // start ul list
  const ul = document.createElement('ul');

  // go through list of tours
  selectedTours.forEach((tour) => {
    // for now by default we assume we are rendering the card in the tour hero
    const ticketCard = document.createRange().createContextualFragment(`
      <script type='application/ld+json'>
        {
          "@context":"https://www.schema.org",
          "category":"tickets",
          "description":"${tour['Description Title']}\\n${tour.Description}",
          "@type":"Product",
          "offers":{
            "price":"${tour.Price}",
            "@type":"Offer",
            "priceCurrency":"EURO",
            "seller":{
              "@type":"Organization",
              "name":"Real Madrid C.F."
            }
          },
          "name":"${tour['Tour Name']} ${tour.Subtitle}",
          "brand":"${tour.Subtitle}",
          "url":"https://www.realmadrid.com${tour}"
        }
      </script>
      <li>
        <div class='ticket-type'>
          <div class='title'>${tour['Tour Name']}</div>
          <div class='subtitle'>${tour.Subtitle}</div>
        </div>

        <div class='info-buy'>
          <div class='price'>
            <p>
            ${tour['Price Pretext']}
            <span class='amount'>${tour.Price}</span>
            <span class='currency'>€</span>
            <span class='subtitle'>${tour['Price Subtitle']}</span>
            </p>
          </div>

          <div class='buy-button'>
            <a href='${tour['Buy Link']}' target='_blank' rel='noreferrer'>${buy}</a>
          </div>
        </div>

        <div class='ticket-detail'>
          <div class='content'>
            <p>${itIncludes}:</p>
            ${tour['Ticket Text']}
          </div>
        </div>

        <a href='${tour['Detail Page']}' class='info-link'>${moreInformation}</a>
      </li>
    `);

    // if a label on top of ticket card is set
    if (tour['Ticket Label']) {
      const label = document.createElement('span');
      label.textContent = tour['Ticket Label'];
      label.classList.add('label');
      ticketCard.querySelector('.ticket-type').prepend(label);
    }

    ul.append(ticketCard);
  });

  block.textContent = '';
  block.append(ul);
}
