export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.classList.add('chapter-cards-wrap');

  [...block.children].forEach((row) => {
    const [chapterName, title, link] = row.children;
    const cardLink = document.createElement('a');
    cardLink.href = link.innerText;
    chapterName.classList.add('chapter-cards-name');
    title.classList.add('chapter-cards-title');
    const span = document.createElement('span');
    span.classList.add('icon', 'icon-plus');
    title.append(span);
    const li = document.createElement('li');
    li.classList.add('chapter-cards-item');
    cardLink.append(chapterName, title);
    li.append(cardLink);
    ul.append(li);
  });
  block.innerHTML = ul.outerHTML;
}
