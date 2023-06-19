/*
 * Fragment Block
 * Include content from one Helix page in another.
 * https://www.hlx.live/developer/block-collection/fragment
 */

import {
  loadFragment,
  loadFragmentWithPlaceholder,
} from '../../scripts/scripts.js';

import {
  toClassName,
} from '../../scripts/lib-franklin.js';

function getFragmentPath(container) {
  const link = container.querySelector('a');
  return link ? link.getAttribute('href') : container.textContent.trim();
}

export function readFragmentWithPlaceholderConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row, index) => {
    if (index === 0) {
      config.path = getFragmentPath(row);
    } else {
      const cols = [...row.children];
      if (cols[1]) {
        const name = toClassName(cols[0].textContent);
        const value = name === 'custom-text' ? cols[1].getInnerHTML() : cols[1].textContent;
        config[name] = value;
      }
    }
  });
  return config;
}

async function getFragmentClassic(block) {
  const path = getFragmentPath(block);
  const fragment = await loadFragment(path);
  return fragment;
}

async function getFragmentWithPlaceholder(block) {
  const config = readFragmentWithPlaceholderConfig(block);
  const fragment = await loadFragmentWithPlaceholder(config.path, '.placeholder', config['custom-text']);
  return fragment;
}

export default async function decorate(block) {
  const fragment = block.classList.contains('placeholder') ? await getFragmentWithPlaceholder(block) : await getFragmentClassic(block);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.fragment-wrapper').replaceWith(...fragmentSection.childNodes);
    }
  }
}
