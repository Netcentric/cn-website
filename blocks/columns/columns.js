import { loadCSS } from "../../scripts/lib-franklin.js";

function decorateTeasers(cols) {
  loadCSS(`${window.hlx.codeBasePath}/blocks/columns/columns-teasers.css`);
  cols.forEach((div) => {
    const headings = div.querySelectorAll('h2,h3,h4');
    let title;
    if (headings.length > 1) {
      headings[0].classList.add('columns-column-title');
      headings[1].classList.add('columns-teaser-title');
      title = headings[1];
    } else if (headings.length == 1) {
      headings[0].classList.add('columns-teaser-title');
      title = headings[0];
    }
    if (title && title.previousElementSibling) title.previousElementSibling.classList.add('columns-teaser-pretitle');
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  if (block.matches('.teasers')) {
    decorateTeasers(cols);
  }
}
