import { createElement } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const ul = createElement('ul', 'chapter-cards-wrap');

  [...block.children].forEach((row) => {
    const [chapterName, title, link] = row.children;

    const cardLink = createElement('a', '', { href: link.innerText });
    const span = createElement('span', ['icon', 'icon-plus']);
    const li = createElement('li', 'chapter-cards-item');

    chapterName.classList.add('chapter-cards-name');
    title.classList.add('chapter-cards-title');

    title.append(span);
    cardLink.append(chapterName, title);
    li.append(cardLink);
    ul.append(li);
  });

  block.innerHTML = ul.outerHTML;
}
