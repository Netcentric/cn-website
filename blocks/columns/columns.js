import { loadCSS } from '../../scripts/lib-franklin.js';

function decorateTeasers(cols) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/columns-teasers.css`);
  cols.forEach((div) => {
    const headings = div.querySelectorAll('h2,h3,h4');
    let title;
    if (headings.length > 1) {
      headings[0].classList.add('columns-column-title');
      [, title] = headings;
    } else if (headings.length === 1) {
      [title] = headings;
    }
    if (title) {
      title.classList.add('columns-teaser-title');
      if (title.previousElementSibling) title.previousElementSibling.classList.add('columns-teaser-pretitle');
    }
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  if (block.matches('.teasers')) {
    decorateTeasers(cols);
  }
}
