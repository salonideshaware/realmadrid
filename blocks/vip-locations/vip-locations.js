export default async function decorate(block) {
  // get all legend entries
  const legendEntries = block.querySelectorAll('a');
  // clear the block content
  block.textContent = '';
  /* load the stadion svg with the section markers */
  const response = await fetch(`${window.hlx.codeBasePath}/icons/plano_estadio.svg`);
  if (response.ok) {
    const svg = await response.text();
    block.innerHTML = svg;
  }
  /* create the legend */
  const legend = document.createElement('div');
  legend.classList.add('legend');

  const svgPathClasses = ['silverClub2', 'vip130132', 'silverClub127129', 'silverClub227', 'silverClub130132'];
  /* set each legend entry */
  [...legendEntries].forEach((entry, i) => {
    entry.removeAttribute('class');
    entry.classList.add('legend-entry');

    // on hover hide everything but selected VIP section
    entry.addEventListener('mouseover', () => {
      const svgPath = block.querySelectorAll(`path:not(.${svgPathClasses[i]},
        .silverClub1, .silverClub409410 , [id='baseEstadio st0'])`);
      [...svgPath].forEach((path) => { path.style.opacity = 0.1; });
    });

    // on exit show all svg paths again
    entry.addEventListener('mouseout', () => {
      const svgPath = block.querySelectorAll('path');
      [...svgPath].forEach((path) => { path.style.opacity = 1; });
    });

    legend.append(entry);
  });
  block.append(legend);
}
