import { fetchVIPAreaIndex } from '../../scripts/scripts.js';

export default async function decorate(block) {
  block.textContent = '';
  // get the index for this VIP section
  const index = await fetchVIPAreaIndex();

  // if there is an h1 in main text take it as the main title otherwise page title
  const hasH1Title = document.querySelector('main h1:first-child');
  const title = hasH1Title ? (hasH1Title.remove(), hasH1Title.innerText) : document.querySelector('title')?.innerText;

  // init header DOM structure
  const dom = document.createRange().createContextualFragment(`
    <h1>${title}</h1>
    <div itemscope itemtype="http://schema.org/WebPage" class="breadcrumb">
      <div itemprop="breadcrumb" class="breadcrumb-items">
      </div>
    </div>
  `);
  // get current path
  const curPath = document.location.pathname;
  // breadcrumb parent div
  const breadcrumb = dom.querySelector('.breadcrumb-items');
  // go through all sub paths
  curPath.split('/').reduce(async (prevSubPath, nextPathElem) => {
    const nextSubPath = `${await prevSubPath}/${nextPathElem}`;
    // if not the current page
    if (nextSubPath !== curPath) {
      const a = document.createElement('a');
      a.setAttribute('href', nextSubPath);
      const parentTitle = index.find((e) => e.path === nextSubPath)?.title;
      if (parentTitle !== undefined) {
        a.innerText = parentTitle;
        breadcrumb.append(a);
        breadcrumb.append(' · ');
      }
    } else {
      const span = document.createElement('span');
      span.textContent = title;
      breadcrumb.append(span);
    }
    return nextSubPath;
  });
  block.append(dom);
}
