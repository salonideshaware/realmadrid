export default async function decorate(block) {
  const heroContent = block.querySelector(':scope > div > div');
  const heroPic = block.querySelector(':scope picture');
  if (heroPic) {
    block.append(heroPic);
  }
  if (heroContent) {
    heroContent.parentElement.remove();
    heroContent.classList.add('hero-content');
    block.append(heroContent);
  }
  return block;
}
