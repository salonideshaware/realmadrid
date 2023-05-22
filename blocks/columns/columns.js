import { loadCSS } from '../../scripts/lib-franklin.js';

function decorateOrganizeVisit(el) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/organize-visit.css`);
  [...el.children].forEach((row) => {
    row.classList.add('visit-box');
    if (row.children.length > 1) {
      const rowElements = [...row.children];
      rowElements[0].classList.add('icon-wrapper');
      rowElements[1].classList.add('text-wrapper');
      // remove buttons styling from stand-alone links
      rowElements[1].querySelectorAll('.button, .button-container')
        .forEach((button) => {
          button.classList.remove('button', 'button-container', 'primary');
        });
    }
  });
}

function decorateFullColumns(el) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/full-columns.css`);
  const elements = el.querySelectorAll(':scope > div > div');
  if (elements != null) {
    elements.forEach((element) => {
      Array.from(element.children).forEach((row, index) => {
        switch (index) {
          case 0:
            row.classList.add('image');
            break;
          case 1:
            row.classList.add('subtitle');
            break;
          case 2:
            row.classList.add('title');
            break;
          default:
            row.classList.add('text');
            break;
        }
      });
    });
  }
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // customization for organize-visit-column
  if (block.classList.contains('organize-visit')) {
    decorateOrganizeVisit(block);
  }
  // customization for full-column
  if (block.classList.contains('full')) {
    decorateFullColumns(block);
  }
}
