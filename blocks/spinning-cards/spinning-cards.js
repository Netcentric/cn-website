import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function getImageWidth() {
  return 150;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.classList.add('spinning-cards-grid');

  [...block.children].forEach((row) => {
    const [profilePicture, title, content] = row.children;

    ul.querySelectorAll('img').forEach((img) => {
      const width = getImageWidth();
      if (width !== img.width) {
        const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
        const optimizedImg = optimizedPicture.querySelector('img');
        optimizedImg.width = width;
        optimizedImg.height = img.height * (width / img.width);
        img.closest('picture').replaceWith(optimizedPicture);
      }
    });
    const innerDiv = document.createElement('div');
    innerDiv.classList.add('spinning-cards-inner');
    const divFront = document.createElement('div');
    divFront.innerHTML = profilePicture.innerHTML + title.innerHTML;

    divFront.classList.add('spinning-cards-front');
    content.classList.add('spinning-cards-back');
    innerDiv.append(divFront, content);

    const li = document.createElement('li');
    li.classList.add('spinning-cards-item');
    li.append(innerDiv);

    ul.append(li);
  });
  block.innerHTML = ul.outerHTML;
}
