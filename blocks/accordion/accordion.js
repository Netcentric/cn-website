import { decorateIcons, createIcon } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const accordionItems = block.querySelectorAll(':scope > div > div');
  accordionItems.forEach((accordionItem) => {
    const nodes = accordionItem.children;

    const titleText = nodes[0];
    const rest = Array.prototype.slice.call(nodes, 1);

    const titleDiv = document.createElement('div');
    titleDiv.appendChild(titleText);
    titleDiv.appendChild(createIcon('accordionarrow'));

    titleDiv.classList.add('accordion-trigger');

    const content = document.createElement('div');
    content.classList.add('accordion-content');
    rest.forEach((elem) => {
      content.appendChild(elem);
    });

    const newItem = document.createElement('div');
    newItem.appendChild(titleDiv);
    newItem.appendChild(content);

    newItem.classList.add('accordion-item');
    decorateIcons(newItem);

    accordionItem.replaceWith(newItem);
  });

  const triggers = block.querySelectorAll('.accordion-trigger');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const openAttribute = 'aria-expanded';
      const wasOpen = trigger.parentElement.hasAttribute(openAttribute);

      triggers.forEach((_trigger) => {
        _trigger.parentElement.removeAttribute('aria-expanded');
      });

      if (!wasOpen) {
        trigger.parentElement.setAttribute('aria-expanded', '');
      }
    });
  });
}
