import { getParents } from '../../scripts/scripts.js';

function styleBlock(block) {
  const badgeElements = block.querySelector('a').children;
  if (badgeElements.length > 2) {
    badgeElements[0].classList.add('background-image');
    badgeElements[1].classList.add('upper-box');
    badgeElements[2].classList.add('lower-box');
  }
}

function rearrangeMergeSection(mergeBlockSection) {
  const fragment = document.createElement('div');
  mergeBlockSection.classList.remove('merge-blocks-desktop');
  fragment.classList.add('merge-blocks-desktop');
  const blocks = [...mergeBlockSection.children];
  blocks.forEach((block) => {
    fragment.appendChild(block);
  });
  mergeBlockSection.appendChild(fragment);
}

export default function decorate(block) {
  const elements = [...block.children];
  // wrap link around block
  const badgeLink = elements[0].querySelector('a');
  if (badgeLink != null) {
    const anchorWrapper = document.createElement('a');
    anchorWrapper.setAttribute('href', badgeLink.getAttribute('href'));
    badgeLink.closest('.button-container').remove();
    elements.forEach((el) => {
      anchorWrapper.innerHTML += el.outerHTML;
      el.remove();
    });
    block.prepend(anchorWrapper);
  }
  styleBlock(block);
  // extract merge-blocks-desktop elements in a dedicated div
  const mergeBlocks = getParents(block, '.merge-blocks-desktop');
  if (mergeBlocks.length > 0) {
    rearrangeMergeSection(mergeBlocks[0]);
  }
}
