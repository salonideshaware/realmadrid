import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  // get config entries
  const cfg = readBlockConfig(block);
  const {
    pretitle, title, promo, desktop, navigation, mobile,
  } = cfg;
  // create dom structure
  const dom = document.createRange().createContextualFragment(`
      <div class='content'>
        <div class='content-wrapper'>
          <div class='ticket-container'>
          </div>
        </div>
      </div>
      <div class='background'>
      </div>
  `);

  // shortcuts
  const contentWrapper = dom.querySelector('.content-wrapper');
  const background = dom.querySelector('.background');

  // if a pretitle is defined
  if (pretitle) {
    const preTitleElem = document.createElement('p');
    preTitleElem.classList.add('pretitle');
    preTitleElem.textContent = pretitle.toUpperCase();
    contentWrapper.append(preTitleElem);
  }

  // if title is defined
  if (title) {
    const titleElem = document.createElement('h1');
    titleElem.textContent = title.toUpperCase();
    contentWrapper.append(titleElem);
  }

  // if navigation is defined
  if (navigation) {
    const resp = await fetch(`${navigation}.plain.html`);
    if (resp.ok) {
      // create the nav element
      const divNavContainer = document.createElement('div');
      divNavContainer.classList.add('navcontainer');
      const navElem = document.createElement('nav');
      divNavContainer.append(navElem);
      contentWrapper.append(divNavContainer);
      // get the navigation table from the fragment
      const navEntries = document.createRange().createContextualFragment(await resp.text()).querySelector('.navigation');
      // add entries
      [...navEntries.children].forEach((navEntry) => {
        const a = navEntry.children[1].children[0];
        a.style.setProperty('--nav-icon', `'${navEntry.children[0].textContent.trim()}'`);
        // if its the current page
        const href = a.getAttribute('href');
        if (href.endsWith(document.location.pathname)) {
          a.classList.add('selected');
        }
        if (href.indexOf('www.realmadrid.') === -1) {
          a.style.setProperty('--external-icon', "'\\e916'");
        }
        navElem.append(a);
      });
    }
  }

  // if promo text is defined
  if (promo) {
    const promoElem = document.createElement('p');
    promoElem.classList.add('promo');
    promoElem.textContent = promo;
    contentWrapper.append(promoElem);
  }

  // if background is defined
  if (desktop) {
    // get the picture element
    const imageName = desktop.substring(desktop.lastIndexOf('media_'), desktop.indexOf('?'));
    const picture = block.querySelector(`:scope img[src*="${imageName}"`).parentElement;
    picture.classList.add('desktop');
    background.append(picture);
  }

  if (mobile) {
    // get the picture element
    const imageName = mobile.substring(mobile.lastIndexOf('media_'), mobile.indexOf('?'));
    const picture = block.querySelector(`:scope img[src*="${imageName}"`).parentElement;
    picture.classList.add('mobile');
    background.append(picture);
  }
  block.textContent = '';
  block.append(dom);
}
