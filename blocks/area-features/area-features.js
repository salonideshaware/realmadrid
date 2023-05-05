import { buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';

function createDiv(...classNames) {
  const div = document.createElement('div');
  div.classList.add(...classNames);
  return div;
}

function showPopup(e) {
  const li = e.currentTarget;
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.classList.add('appear');
  li.querySelector('.modal').classList.add('appear');
}

function makePopupCards(block) {
  const items = block.querySelectorAll('li');
  items.forEach((li) => {
    const headingElements = li.querySelectorAll('span,h3');
    let content = [...li.querySelectorAll('p')];
    const iframeLink = li.querySelector('p > a[href$="iframe=true"]');
    const modalDiv = createDiv('modal');
    const modalContentDiv = createDiv('modal-content');
    const header = createDiv('header');
    if (iframeLink) {
      const { parentElement } = iframeLink;
      const link = iframeLink.href;
      if (link) {
        parentElement.innerHTML = `<iframe src="${link}" allow="fullscreen" frameborder="0"/>`;
      }
      content = [parentElement];
      modalContentDiv.classList.add('iframe-content');
    }
    header.append(...[...headingElements].map((h) => h.cloneNode(true)));
    modalContentDiv.append(header, ...content);
    modalDiv.append(modalContentDiv);
    li.append(modalDiv);
    modalDiv.addEventListener('click', (e) => {
      e.currentTarget.classList.remove('appear');
      const modalOverlay = document.getElementById('modal-overlay');
      modalOverlay.classList.remove('appear');
      e.stopPropagation();
    });
    modalContentDiv.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    li.addEventListener('click', showPopup);
  });
}

export default async function decorate(block) {
  const cardsBlock = buildBlock('cards', [...block.children].map((x) => [...x.children].map((y) => y.innerHTML)));
  block.innerHTML = '';
  block.append(cardsBlock);
  decorateBlock(cardsBlock);
  await loadBlock(cardsBlock);
  const modalOverlay = document.getElementById('modal-overlay');
  if (!modalOverlay) {
    const div = document.createElement('div');
    div.id = 'modal-overlay';
    document.body.insertAdjacentElement('afterbegin', div);
    div.addEventListener('click', () => {
      modalOverlay.classList.remove('appear');
      document.querySelector('modal.appear').classList.remove('appear');
    });
  }
  makePopupCards(block);
}
