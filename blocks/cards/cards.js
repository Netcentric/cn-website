import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function getImageWidth(block) {
  if (block.matches('.icon-with-text')) {
    // scaling the images down to the actual size makes them blury
    return 150;
  }

  return 750;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: getImageWidth(block) }])));
  block.textContent = '';
  block.append(ul);
}
