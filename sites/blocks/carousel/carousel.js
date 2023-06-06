import { createOptimizedPicture, getMetadata } from '../../scripts/lib-franklin.js';
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

  // Add listeners on images to be pupup showed in a bigger size after click
  // Get all elements with class 'pic-container'
  const photos = document.getElementsByClassName('pic-container');

  // Loop over all the photo elements
  Array.from(photos).forEach((photo) => {
    // Add click event listener to each photo
    photo.addEventListener('click', function () {
      // Create main wrap div and add classes and attributes to it
      const wrapDiv = document.createElement('div');
      wrapDiv.classList.add('photo-wrap');
      wrapDiv.tabIndex = '-1';
      wrapDiv.style.overflow = 'hidden auto';

      // Create container div and add classes to it
      const containerDiv = document.createElement('div');
      containerDiv.classList.add('photo-container');

      // Create content div and add classes to it
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('photo-content');

      // Create figure div and add classes to it
      const figureDiv = document.createElement('div');
      figureDiv.classList.add('photo-figure');

      // Create close button and add classes, attributes and content to it
      const closeButton = document.createElement('button');
      closeButton.title = 'Close (Esc)';
      closeButton.type = 'button';
      closeButton.classList.add('photo-close');

      // Create header div and add classes to it
      const headerDiv = document.createElement('div');
      headerDiv.classList.add('photo-header');

      // Create title div, add classes to it and set its content
      const titleDiv = document.createElement('div');
      titleDiv.classList.add('photo-title');
      const imgTitle = getMetadata('og:title');
      titleDiv.textContent = imgTitle;

      // Create an image, add classes and attributes to it - create the image with franklin
      const breakpoints = [
        { media: '(max-width: 480px)', width: '480' },
        { media: '(min-width: 480px) and (max-width: 600px)', width: '600' },
        { media: '(min-width: 600px) and (max-width: 750px)', width: '750' },
        { media: '(min-width: 750px) and (max-width: 990px)', width: '960' },
        { media: '(min-width: 990px) and (max-width:1200px)', width: '480' },
        { media: '(min-width: 1200px)', width: '960' },
      ];
      const optimizedPic = createOptimizedPicture(this.querySelector('img').src, imgTitle, false, breakpoints);
      const image = optimizedPic.querySelector('img');
      image.classList.add('photo-img');

      // Append all the created elements to the body or other elements
      headerDiv.appendChild(titleDiv);
      figureDiv.append(closeButton, headerDiv, image);
      contentDiv.appendChild(figureDiv);
      containerDiv.append(contentDiv);
      wrapDiv.appendChild(containerDiv);
      document.body.append(wrapDiv);

      // Add click event listener to the close button
      closeButton.addEventListener('click', () => {
        // Remove the created elements from the body when the close button is clicked
        document.body.removeChild(wrapDiv);
      });
    });
  });
}
