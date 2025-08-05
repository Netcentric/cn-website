import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const supportedBackgroundColors = [
  'dark-plum',
  'light-plum',
  'mid-plum',
];

function getImageWidth(block) {
  if (block.matches('.icon-with-text')) {
    // scaling all the images down to the actual size makes them blury
    return 150;
  }
  return 750;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const linkName = row.querySelector('h5 a')?.getAttribute('title');
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      if (supportedBackgroundColors.indexOf(div.textContent) >= 0) {
        li.removeChild(div);
        li.classList.add(`cards-card-bg-${div.textContent}`);
      } else if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
        if (linkName) {
          div.querySelector('a')?.setAttribute('title', linkName);
        }
      } else {
        div.className = 'cards-card-body';
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('img').forEach((img) => {
    const width = getImageWidth(block);
    if (width !== img.width) {
      const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
      const optimizedImg = optimizedPicture.querySelector('img');
      optimizedImg.width = width;
      optimizedImg.height = img.height * (width / img.width);
      img.closest('picture').replaceWith(optimizedPicture);
    }
  });
  block.textContent = '';
  block.append(ul);
}
