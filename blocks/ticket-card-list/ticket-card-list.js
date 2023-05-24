import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  // get tour category
  const tourCategory = block.children[0].children[0].textContent;

  // load list of tours available
  // TODO : make it language aware
  const resp = await fetch(`${document.location.pathname}/tours.json`);
  if (resp.ok) {
    // get all tours
    const tours = (await resp.json()).data;

    // get placeholders
    const placeholders = await fetchPlaceholders();
    const { buy, itIncludes, moreInformation } = placeholders;

    // start ul list
    const ul = document.createElement('ul');

    // go through list of tours
    tours.forEach((tour) => {
      // get categories
      const categories = tour.Categories.split(',');
      categories.forEach((e, i) => { categories[i] = e.trim(); });

      // if its the right category and its to be shown in the overview
      if (categories.includes(tourCategory) && tour['Show on Category Page'].trim().toLowerCase().startsWith('y')) {
        // for now by default we assume we are rendering the card in the tour hero
        const dom = document.createRange().createContextualFragment(`
        <script type='application/ld+json'>
          {
            "@context":"https://www.schema.org",
            "category":"tickets",
            "description":"${tour['Description Title']}\\n${tour.Description}",
            "@type":"Product",
            "offers":{
              "price":"${price}",
              "@type":"Offer",
              "priceCurrency":"EURO",
              "seller":{
                "@type":"Organization",
                "name":"Real Madrid C.F."
              }
            },
            "name":"${tourName} ${subtitle}",
            "brand":"${subtitle}",
            "url":"https://www.realmadrid.com${tour}"
          }
        </script>

        <div class='ticket-type'>
          <div class='title'>${tourName}</div>
          <div class='subtitle'>${subtitle}</div>
        </div>

        <div class='info-buy'>
          <div class='price'>
            <p>
            ${pricePretext}
            <span class='amount'>${price}</span>
            <span class='currency'>€</span>
            <span class='subtitle'>${priceSubtitle}</span>
            </p>
          </div>

          <div class='buy-button'>
            <a href='${buyLink}' target='_blank' rel='noreferrer'>${buy}</a>
          </div>
        </div>

        <div class='ticket-detail'>
          <div class='content'>
            <p>${itIncludes}:</p>
            ${includes}
          </div>
        </div>

        <a href='${tour}' class='info-link'>${moreInformation}</a>
      `);

      }
    });

    
    // if a label on top of ticket card is set
     if (ticketLabel) {
      const label = document.createElement('span');
      label.textContent = ticketLabel;
      label.classList.add('label');
      dom.querySelector('.ticket-type').prepend(label);
    } 

    block.textContent = '';
    // block.append(dom);
  }
}
