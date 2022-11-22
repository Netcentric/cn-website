import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';

const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

function getImageWidth() {
  if (viewportWidth >= 992) {
    return 262; // 4 columns
  }
  if (viewportWidth >= 600) {
    return 380; // 2 columns
  }
  return 280;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    [...li.children].forEach((div) => {
      const heading = div.querySelector('h1,h2,h3,h4');
      if (heading) {
        div.className = 'leader-profile-heading';
        heading.insertAdjacentHTML('beforeend', '<span class="icon icon-chevron-right"></span>');
      } else if (div.children.length === 1 && div.querySelector('picture')) div.className = 'leader-profile-image';
      else div.className = 'leader-profile-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => {
    const width = getImageWidth();
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    const optimizedImg = optimizedPicture.querySelector('img');
    optimizedImg.width = width; // 1:1 aspect ratio
    optimizedImg.height = width;
    img.closest('picture').replaceWith(optimizedPicture);
  });
  block.textContent = '';
  block.append(ul);
  decorateIcons(ul);
}
