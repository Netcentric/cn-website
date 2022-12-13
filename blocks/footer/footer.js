import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';
import { getLanguagePath } from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${getLanguagePath()}${footerPath}.plain.html`);
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
