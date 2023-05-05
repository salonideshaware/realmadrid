import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

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
    const content = [...li.querySelectorAll('p')];
    const modalDiv = createDiv('modal');
    const modalContentDiv = createDiv('modal-content');
    const header = createDiv('header');
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

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
  if (block.classList.contains('popup')) {
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
}
