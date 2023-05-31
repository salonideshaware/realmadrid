import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { getLanguage, TOURS_LANGUAGE_HOME_PATH } from '../../scripts/scripts.js';

export default async function decorate(block) {
  // get tour category
  const tourCategory = block.children[0].children[0].textContent.trim();

  // load list of tours
  const resp = await fetch(`${TOURS_LANGUAGE_HOME_PATH[getLanguage()]}/tours.json`);
  if (!resp.ok) return;

  // get the tours for the selected category
  const selectedTours = (await resp.json()).data.filter((tour) => {
    // get list of assigned categories for a tour
    const categories = tour.Categories.split(',').map((categoryEntry) => categoryEntry.trim());
    // check
    return categories.includes(tourCategory) && tour['Show on Category Page'].trim().toLowerCase().startsWith('y');
  });

  // if no tours are found
  if (selectedTours.length === 0) return;

  // get placeholders (non-existing values are undefined)
  const placeholders = await fetchPlaceholders();
  const {
    itIncludes = 'Incluye',
    moreInformation = 'Más información',
    from = 'desde',
  } = placeholders;

  // start ul list
  const ul = document.createElement('ul');

  // go through list of tours (non-existing values are always '')
  selectedTours.forEach((tour) => {
    // extract tour info
    const {
      Description,
      Price,
      Subtitle,
    } = tour;
    const oldPrice = tour['Old Price'];
    const descriptionTitle = tour['Description Title'];
    const tourName = tour['Tour Name'];
    const priceSubtitle = tour['Price Subtitle'];
    const buyLink = tour['Buy Link'];
    const detailPage = tour['Detail Page'];
    const ticketLabel = tour['Ticket Label'];
    const buttonText = tour['Button Text'];
    // recover the bullet list
    const ticketText = tour['Ticket Text'].split('\n').map((liContent) => `<li>${liContent.trim()}</li>`);

    // if ticket is rendered inside hero, it has a schema for each ticket beforehand
    if (block.classList.contains('hero')) {
      const ticketSchema = document.createRange().createContextualFragment(`
        <script type='application/ld+json'>
          {
            "@context":"https://www.schema.org",
            "category":"tickets",
            "description":"${descriptionTitle}\\n${Description}",
            "@type":"Product",
            "offers":{
              "price":"${Price}",
              "@type":"Offer",
              "priceCurrency":"EURO",
              "seller":{
                "@type":"Organization",
                "name":"Real Madrid C.F."
              }
            },
            "name":"${tourName} ${Subtitle}",
            "brand":"${Subtitle}",
            "url":"https://www.realmadrid.com${detailPage}"
          }
        </script>
      `);

      ul.append(ticketSchema);
    }

    // the ticket card DOM
    const ticketCard = document.createRange().createContextualFragment(`
      <li>
        <div class='ticket-type'>
          ${ticketLabel ? `<span class='label'>${ticketLabel}</span>` : ''}
          <div class='title'>${tourName.split('\n').map((line) => `${line.trim()}<br>`).join('')}</div>
          <div class='subtitle'>${Subtitle}</div>
        </div>
        <div class='info-buy'>
          <div class='price'>
            <p>
            ${from}${oldPrice ? `&nbsp<del>${oldPrice}€</del>` : ''}
            <span class='amount'>${Price}</span>
            <span class='currency'>€</span>
            ${priceSubtitle ? `<span class='subtitle'>${priceSubtitle}</span>` : ''}
            </p>
          </div>
          <div class='buy-button'>
            <a href='${buyLink}' target='_blank' rel='noreferrer'>${buttonText}</a>
          </div>
        </div>
        <div class='ticket-detail'>
          <div class='content'>
            <p>${itIncludes}:</p>
            ${ticketText ? `<ul>${ticketText.join('')}</ul>` : ''}
          </div>
        </div>
        <a href='${detailPage}' class='info-link'>${moreInformation}</a>
      </li>
    `);

    ul.append(ticketCard);
  });

  block.textContent = '';
  block.append(ul);
}
