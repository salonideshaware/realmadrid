export default function decorate(block) {
  // replace the first button-container (more info link) with simple link
  const moreInfo = block.querySelector(':scope .button-container');
  if (moreInfo) {
    const a = moreInfo.firstElementChild;
    a.classList.remove(...a.classList);
    moreInfo.replaceWith(a);
  }

  // add image and text class to the left / right to be able to change order in mobile view
  block.querySelector(':scope > div > div > picture')?.closest('div').classList.add('image');
  block.querySelector(':scope > div > div > :not(picture)')?.closest('div').classList.add('text');
}
