import { loadCSS } from '../../scripts/lib-franklin.js';

function decorateTeasers(cols, block) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/columns-teasers.css`);
  const pictures = cols.map((div) => div.querySelector('picture')).filter((picture) => !!picture);
  if (pictures.length === cols.length) {
    block.classList.add('columns-teasers-align-images');
  }
  pictures.forEach((picture) => picture.closest('p').classList.add('columns-teaser-image'));
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
    decorateTeasers(cols, block);
  }
}
