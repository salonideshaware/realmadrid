function decorateOrganizeVisit(el) {
  [...el.children].forEach((row) => {
    row.classList.add('visit-box');
    if (row.children.length > 1) {
      const rowElements = [...row.children];
      rowElements[0].classList.add('icon-wrapper');
      rowElements[1].classList.add('text-wrapper');
      // remove buttons styling from stand-alone links
      rowElements[1].querySelectorAll('.button, .button-container').forEach((button) => {
        button.classList.remove('button', 'button-container', 'primary');
      });
    }
  });
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
}
