import { decorateIcons, createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { fetchVIPAreaIndex } from '../../scripts/scripts.js';

async function addNavigation(block) {
  const currentPath = document.location.pathname;

  // get query index for this language
  const index = await fetchVIPAreaIndex();
  if (index === null) return;

  // nav container div
  const nav = document.createElement('div');
  nav.classList.add('navigation');

  // get parent path
  const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
  // get index entry for parent
  const parentIndex = index.find((parentEntry) => parentEntry.path === parentPath);
  // append parent link to hero navigation
  if (parentIndex) {
    nav.append(document.createRange().createContextualFragment(`
    <a href='${parentPath}'class='parent'><span class='icon icon-arrow-right'></span>${parentIndex.title}</a>
    `));
  }

  // check for children
  const childrenDepth = currentPath.split('/').length + 1;
  const childrenIndex = index.filter((entry) => entry.path.startsWith(currentPath)
    // ignore vip area detail pages
    && entry.path.split('/').length === childrenDepth && !entry.category.startsWith('vip-area-detail'));

  if (childrenIndex) {
    // create children list root element
    const childrenDiv = document.createElement('div');
    childrenDiv.classList.add('children');
    // add children
    childrenIndex.forEach((entry) => {
      childrenDiv.append(document.createRange().createContextualFragment(`
      <a href='${entry.path}'class='child'>${entry.title}</a>`));
    });
    // add children list to hero navittion
    nav.append(childrenDiv);
  }
  // decorate the arrow icon for the parent link
  decorateIcons(nav);
  // append navigation block
  block.prepend(nav);
}

function createVideo(block) {
  const anchors = [...block.querySelectorAll('a[href$=".mp4"]')];
  const screens = ['desktop', 'mobile'];
  const src = {};
  const videos = anchors.map((a, i) => {
    const video = document.createElement('video');
    video.setAttribute('loop', '');
    video.setAttribute('muted', '');
    video.muted = true;
    video.setAttribute('playsInline', '');
    video.setAttribute('autoplay', '');
    if (screens[i]) {
      video.setAttribute(`data-screen-${screens[i]}`, '');
      src[screens[i]] = `<source src="${a.href}" type="video/mp4" />`;
    }
    return video;
  });

  const div = document.createElement('div');
  div.classList.add('video');

  if (videos.length === 1) {
    // if there is only 1 video show it on mobile as well
    videos[0].setAttribute('data-screen-mobile', '');
  } else {
    // if there are 2 videos, create a mediaquery
    const mq = window.matchMedia('(min-width:990px)');
    // add an event listener to the media query
    mq.addEventListener('change', (e) => {
      // either add mobile or desktop video element
      // eslint-disable-next-line no-unused-expressions
      e.target.matches ? videos[0].innerHTML = src.desktop : videos[1].innerHTML = src.mobile;
    });
    // trigger it to set the right video on load
    mq.dispatchEvent(new Event('change'));
  }
  div.append(...videos);
  return div;
}

export default async function decorate(block) {
  const heroContent = block.querySelector(':scope > div > div');
  const heroPic = block.querySelector(':scope picture');
  let heroVideo;
  if (block.classList.contains('hero-video')) {
    const videoContent = heroContent.querySelector(':scope > div');
    heroVideo = createVideo(videoContent);
    videoContent.remove();
  }
  if (heroPic) {
    const img = heroPic.querySelector('img');
    heroPic.remove();
    const optimizedHeroPic = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 600px)', width: '2000' }, { width: '1200' }]);
    block.append(optimizedHeroPic);
  } else if (heroVideo) {
    block.append(heroVideo);
  }
  if (heroContent) {
    if (heroContent.parentElement) {
      heroContent.parentElement.remove();
      // Remove button class from all except first link
      Array.from(heroContent.querySelectorAll('.button:not(:first-of-type)'))
        .forEach((button) => {
          button.classList.remove('button');
        });
    }
    heroContent.classList.add('hero-content');
    block.append(heroContent);
  }

  // add navigation to hero block
  addNavigation(block);

  return block;
}
