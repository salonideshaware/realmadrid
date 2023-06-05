import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import { getLanguage } from '../../scripts/scripts.js';

function createButtons(isRTL) {
  const divButtons = document.createElement('div');
  divButtons.classList.add('carousel-buttons-container');
  const prevButton = isRTL ? 'Next slide' : 'Previous slide';
  const nextButton = isRTL ? 'Previous slide' : 'Next slide';
  divButtons.innerHTML = `<a class="carousel-button carousel-button-prev" aria-label="${prevButton}" aria-disabled="false"></a>
                          <a class="carousel-button carousel-button-next" aria-label="${nextButton}" aria-disabled="false"></a>`;
  return divButtons;
}

function createPicturesContainer(block) {
  const divPicContainer = document.createElement('div');
  divPicContainer.classList.add('carousel-pics-container');
  [...block.children].forEach((child) => divPicContainer.append(child));
  return divPicContainer;
}

function showPic(picNumber, picWidth, carouselPicContainer) {
  const transform = `transform: translate3d(${-1 * picWidth * picNumber}px, 0px, 0px); transition-duration: 300ms;`;
  carouselPicContainer.style.cssText = transform;
}

function showHideButtons(currentPic, maxShift, prevButton, nextButton, isRTL) {
  prevButton.style.display = (currentPic === 0 && !isRTL) || (currentPic === -maxShift && isRTL) ? 'none' : '';
  nextButton.style.display = (currentPic === maxShift && !isRTL) || (currentPic === 0 && isRTL) ? 'none' : '';
}

export default function decorate(block) {
  const isRTL = getLanguage() === 'ar';
  const carouselPicContainer = createPicturesContainer(block);
  const buttonContainer = createButtons(isRTL);

  block.append(carouselPicContainer);
  block.append(buttonContainer);

  let carouselInterval = null;
  let numPics = 0;
  let currentPic = 0;
  let picContainerStyle = null;

  [...block.querySelectorAll('picture')].forEach((pic) => {
    const div = pic.closest('div');
    const img = pic.querySelector('img');
    if (img) {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 990px)', width: '750' }, { width: '600' }]);
      pic.remove();
      div.append(optimizedPic);
    }
    div.classList.add('pic-container');
    picContainerStyle = picContainerStyle || getComputedStyle(div);
    numPics += 1;
  });

  if (!numPics) {
    return;
  }

  const prevButton = buttonContainer.querySelector('.carousel-button-prev');
  const nextButton = buttonContainer.querySelector('.carousel-button-next');
  // Calculate image with and maximum number of images in the carousel, based on the screen size
  const picWidth = picContainerStyle
    ? parseInt(picContainerStyle.width, 10) + parseInt(picContainerStyle.marginRight, 10) : 0;

  const maxShift = numPics - parseInt(window.innerWidth / picWidth, 10);
  showHideButtons(currentPic, maxShift, prevButton, nextButton, isRTL);

  carouselInterval = window.setInterval(() => {
    if (isRTL) {
      currentPic = currentPic === -maxShift ? 0 : currentPic - 1;
    } else {
      currentPic = currentPic === maxShift ? 0 : currentPic + 1;
    }
    showPic(currentPic, picWidth, carouselPicContainer);
    showHideButtons(currentPic, maxShift, prevButton, nextButton, isRTL);
  }, 5000);

  // add listeners to prev and next buttons
  prevButton.addEventListener('click', () => {
    window.clearInterval(carouselInterval);
    if (isRTL) {
      currentPic = currentPic < maxShift ? currentPic - 1 : maxShift;
    } else {
      currentPic = currentPic > 0 ? currentPic - 1 : 0;
    }
    showPic(currentPic, picWidth, carouselPicContainer);
    showHideButtons(currentPic, maxShift, prevButton, nextButton, isRTL);
  });

  nextButton.addEventListener('click', () => {
    window.clearInterval(carouselInterval);
    if (isRTL) {
      currentPic = currentPic < 0 ? currentPic + 1 : 0;
    } else {
      currentPic = currentPic < maxShift ? currentPic + 1 : maxShift;
    }
    showPic(currentPic, picWidth, carouselPicContainer);
    showHideButtons(currentPic, maxShift, prevButton, nextButton, isRTL);
  });
}
