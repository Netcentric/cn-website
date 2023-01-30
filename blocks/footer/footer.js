import { decorateIcons, getLanguagePath } from '../../scripts/lib-franklin.js';
import { getNavPath } from '../header/header.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  block.textContent = '';

  const resp = await fetch(`${getLanguagePath()}${getNavPath('footer')}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;

  // add link title for all icon only links
  footer.querySelectorAll('a > span.icon').forEach((icon) => {
    const a = icon.parentElement;
    const iconName = icon.classList[1].substring(5, icon.classList[1].length);
    a.title = a.title || iconName;
  });

  await decorateIcons(footer);
  block.append(footer);
}
