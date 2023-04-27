/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.textContent = '';

  // fetch footer content
  const footerPath = '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();
    // get the footer entries from footer fragment
    const footerData = document.createRange().createContextualFragment(html).children[0].children;

    // append the list of social media links
    [...footerData[1].children].forEach((li) => {
      const a = li.firstChild;
      // we use domain name as class name
      const sClass = a.innerText.match(/http[s]?:\/\/(.*?\.)?(.*?)\./)[2];
      a.classList.add('social', sClass);
      a.innerText = '';
    });

    // append the list of app links
    [...footerData[3].children].forEach((li) => {
      const a = li.firstChild;
      // we use domain name as class name
      const sClass = a.innerText.match(/http[s]?:\/\/(.*?\.)?(.*?)\./)[2];
      a.classList.add('apps', sClass);
      a.innerText = '';
      // get app store name
      const appStore = li.querySelector('strong').innerText;
      // get the text before
      const appPreText = li.innerText.split(appStore)[0];
      const p = document.createRange().createContextualFragment(`
      <p class='app-text'>${appPreText}<span class='store-name'>${appStore}</span></p>
      `);
      li.textContent = '';
      li.append(a);
      a.append(p);
    });

    // add sponsors
    // skip for now as we will get a new footer anyway

    // init the footer DOM struct
    const footerDOM = document.createRange().createContextualFragment(`
      <div class='social-apps-container'>
        <div class='social-container'>
          <h2>${footerData[0].innerText}</h2>
          ${footerData[1].outerHTML}
        </div>
        <div class='apps-container'>
          <h2>${footerData[2].innerText}</h2>
          ${footerData[3].outerHTML}
        </div>
      </div>
      <div class='sponsor-container'>
        <h2>${footerData[4].innerText}</h2>
        <div class='sponsor-content'>
          <a rel='nofollow'>
            <div class='logos'>
            </div>
          </a>
        </div>
      </div>
      <div class='legal-container'>
      ${footerData[footerData.length - 2].outerHTML}
      </div>
      <div class='copyright-container'>
        ${footerData[footerData.length - 1].outerHTML.replace('{año}', new Date().getFullYear())}
      </div>
    `);

    block.append(footerDOM);
  }
}
