export default async function decorate(block) {
  // first row is link to plan
  const planUrl = block.querySelector('a').href;
  block.children[0].remove();

  // get all legend entries
  const legendEntries = block.querySelectorAll(':scope > div');

  // clear the block content
  block.textContent = '';

  /* load the stadion svg with the section markers */
  const response = await fetch(planUrl);
  if (response.ok) {
    const svg = await response.text();
    block.innerHTML = svg;
  }

  // create legend table
  const legend = document.createElement('div');
  legend.classList.add('legend');

  // collect all path classes for filtering
  const pathClassesFilter = [];
  [...legendEntries].forEach((entry) => {
    pathClassesFilter.push(entry.children[0].textContent);
  });

  // set each legend entry
  [...legendEntries].forEach((entry) => {
    // the class of the SVG path element
    const svgPathClass = entry.children[0].textContent;
    // the link
    const a = entry.children[1].children[0];
    // set classes for entries
    a.removeAttribute('class');
    a.classList.add('legend-entry');
    // get the color from SVG
    const color = block.querySelector(`path.${svgPathClass}`).getAttribute('fill');
    a.style.setProperty('--vip-locations-color', color);

    // on hover hide all oder VIP sections
    a.addEventListener('mouseover', () => {
      pathClassesFilter.forEach((filter) => {
        if (filter !== svgPathClass) {
          const path = block.querySelector(`path.${filter}:not(.${svgPathClass})`);
          if (path) path.style.opacity = 0.1;
        }
      });
    });

    // on exit show all VIP sections again
    a.addEventListener('mouseout', () => {
      pathClassesFilter.forEach((filter) => {
        block.querySelector(`path.${filter}`).style.opacity = 1;
      });
    });

    legend.append(a);
  });

  block.append(legend);
}
