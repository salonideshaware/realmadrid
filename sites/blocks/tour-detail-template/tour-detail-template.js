import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  toClassName,
  loadBlocks,
} from '../../scripts/lib-franklin.js';

export function readTemplateDetailConfig(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    if (row.children) {
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

async function loadTemplate(path, customText) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      const placeholder = main.querySelector('.custom-text');
      const parentCustomText = placeholder ? placeholder.parentElement : '';
      if (parentCustomText) {
        parentCustomText.classList.add('main-content');
        placeholder.insertAdjacentHTML('afterend', customText);
        placeholder.remove();
      }

      decorateMain(main);
      await loadBlocks(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const { 'template-path': templatePath, 'custom-text': customText } = readTemplateDetailConfig(block);

  const fragment = await loadTemplate(templatePath, customText);
  if (fragment) {
    document.querySelector('body').replaceChild(fragment, document.querySelector('main'));
  }
  return block;
}
