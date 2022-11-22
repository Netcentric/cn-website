import { decorateIcons, createIcon } from '../../scripts/lib-franklin.js';

export function buildAccordionBlock(main) {
  const accordions = main.querySelectorAll('.accordion');

  accordions.forEach((accordion) => {
    const accordionItems = accordion.querySelectorAll(':scope > div > div');
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
  });
}
export default async function decorate(block) {
  const triggers = block.querySelectorAll('.accordion-trigger');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const wasOpen = trigger.parentElement.classList.contains('open');

      triggers.forEach((_trigger) => {
        _trigger.parentElement.classList.remove('open');
      });

      if (!wasOpen) {
        trigger.parentElement.classList.add('open');
      }
    });
  });
}
