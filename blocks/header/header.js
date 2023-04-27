/**
 * decorates the header.
 *
 * Placeholder for now until decision who/how/if we are going to
 * do the header ourselfs.
 *
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  block.setAttribute('style', 'background-color: lightgrey; height: var(--nav-height);');
  block.append('HEADER');
}
