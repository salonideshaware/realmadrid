export default function decorate(block) {
  /* change to ul, li */

  Array.from(block.querySelectorAll('.button-container'))
    .forEach((buttonContainer) => {
      let removeButton;
      Array.from(buttonContainer.querySelectorAll('a[href]'))
        .filter((alink) => alink.href.startsWith('mailto:') || alink.href.startsWith('tel:'))
        .forEach((alink) => {
          alink.classList.remove('button');
          alink.classList.remove('primary');
          removeButton = true;
        });
      if (removeButton) {
        buttonContainer.classList.remove('button-container');
      }
    });
}
