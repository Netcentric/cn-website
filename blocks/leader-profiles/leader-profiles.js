import { createOptimizedPicture, decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { addChevronToButtons } from '../../scripts/scripts.js';

let focusedElement;
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

async function handleEvent(block, closeIcon, event) {
  const { target, type, keyCode } = event;
  let flyoutContent = document.querySelector('.leader-profiles-flyout > div');
  let flyout = flyoutContent && flyoutContent.parentElement;
  let closeButton = flyoutContent && flyoutContent.querySelector('span.icon-close');
  if (((type === 'keydown' && keyCode === 13) || type === 'click') && block.contains(target)) {
    focusedElement = document.activeElement;
    const li = target.closest('li');
    if (!flyout) {
      flyout = document.createElement('div');
      flyout.classList.add('leader-profiles-flyout');
      flyoutContent = document.createElement('div');
      flyoutContent.innerHTML = li.innerHTML;

      closeButton = document.createElement('span');
      closeButton.classList.add('icon', 'icon-close', 'icon-decorated');
      closeButton.ariaLabel = 'Close';
      closeButton.tabIndex = 0;
      closeButton.role = 'button';
      closeButton.innerHTML = closeIcon;

      flyoutContent.appendChild(closeButton);
      flyout.appendChild(flyoutContent);
      document.body.appendChild(flyout);
    } else {
      flyoutContent.innerHTML = li.innerHTML;
    }
    closeButton.focus();
    window.requestAnimationFrame(() => flyout.classList.add('opened'));
    window.setTimeout(() => document.body.classList.add('no-scroll'), 200);
  }
  if (((type === 'keydown' && keyCode === 27)
    || (((type === 'keydown' && keyCode === 13) || type === 'click') && closeButton && closeButton.contains(target))
    || (type === 'click' && target === flyout))
    && flyoutContent) {
    window.requestAnimationFrame(() => {
      flyout.classList.remove('opened');
      window.setTimeout(() => flyout.remove(), 200);
      if (focusedElement) {
        focusedElement.focus();
      }
      focusedElement = null;
      document.body.classList.remove('no-scroll');
    });
  }
}

export default function decorate(block) {
  let blockHtml = '<ul>';
  [...block.children].forEach((row) => {
    blockHtml += '<li role="button" tabindex="0">';
    [...row.children].forEach((div) => {
      let className;
      if (div.querySelector('h2,h3,h4')) {
        className = 'leader-profile-heading';
        addChevronToButtons(div, 'h2,h3,h4');
      } else if (div.children.length === 1 && div.querySelector('picture')) {
        className = 'leader-profile-image';
      } else {
        className = 'leader-profile-body';
        div.querySelectorAll('.icon').forEach((icon) => {
          icon.closest('a').target = '_blank';
          icon.closest('ul').classList.add('leader-profile-social-icons');
        });
      }
      blockHtml += `<div class="${className}">${div.innerHTML}</div>`;
    });
    blockHtml += '</li>';
  });
  blockHtml += '</ul>';
  const ul = document.createRange().createContextualFragment(blockHtml);
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

  // defer adding the event listeners until flyout style and close icon are loaded
  Promise.all([
    fetch(`${window.hlx.codeBasePath}/icons/close.svg`).then((resp) => (resp.ok ? resp.text() : 'X')),
    new Promise((resolve) => {
      window.setTimeout(() => loadCSS(`${window.hlx.codeBasePath}/blocks/leader-profiles/leader-profiles-flyout.css`, resolve), 1000);
    }),
  ]).then(([closeIcon]) => {
    document.addEventListener('click', handleEvent.bind(document, block, closeIcon));
    document.addEventListener('keydown', handleEvent.bind(document, block, closeIcon));
  });
}
