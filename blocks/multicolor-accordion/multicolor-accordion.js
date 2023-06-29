let accordionItemOpen = null;
const openAttribute = 'aria-expanded';
const hiddenAttribute = 'aria-hidden';
const btnOpen = `${window.placeholders?.default?.Details || 'Details'}`;
const btnClose = `${window.placeholders?.default?.Close || 'Close'}`;

function getOpenAccordian(buttonWrapper) {
  accordionItemOpen = buttonWrapper;
  buttonWrapper.setAttribute(openAttribute, true);
  buttonWrapper.parentElement.setAttribute(hiddenAttribute, false);
  const panel = buttonWrapper.nextElementSibling;
  panel.style.maxHeight = `${panel.scrollHeight}px`;
  const openAccordianBtn = accordionItemOpen.children[1];
  openAccordianBtn.className = 'btn close-button';
  openAccordianBtn.innerText = btnClose;
}

function toggleAccordian(buttonWrapper) {
  buttonWrapper.addEventListener('click', () => {
    if (accordionItemOpen) {
      const panelClosed = accordionItemOpen.nextElementSibling;
      panelClosed.style.maxHeight = null;
      accordionItemOpen.setAttribute(openAttribute, false);
      accordionItemOpen.parentElement.setAttribute(hiddenAttribute, true);
      const btn = accordionItemOpen.querySelector('.btn');
      btn.className = 'btn details-button';
      btn.innerText = btnOpen;
    }
    if (accordionItemOpen === buttonWrapper) {
      accordionItemOpen = null;
      return;
    }
    getOpenAccordian(buttonWrapper);
  });
}

function getAccordianItems(accordionItems) {
  accordionItems.forEach((accordionItem, index) => {
    const nodes = Array.from(accordionItem.children);
    const buttonWrapper = document.createElement('button');
    const span = document.createElement('span');
    span.className = 'btn details-button';
    span.innerText = btnOpen;
    buttonWrapper.append(nodes[0], span);
    buttonWrapper.classList.add('accordion-trigger');
    buttonWrapper.setAttribute(openAttribute, false, 'aria-controls', `panel${index + 1}`);
    nodes[1].className = 'accordion-content';
    const newItem = document.createElement('div');
    newItem.append(buttonWrapper, nodes[1]);
    newItem.classList.add('accordion-item');
    newItem.setAttribute(hiddenAttribute, true);
    newItem.id = `panel${index + 1}`;
    accordionItem.replaceWith(newItem);

    toggleAccordian(buttonWrapper);
  });
}

export default async function decorate(block) {
  const accordionItems = Array.from(block.children);
  getAccordianItems(accordionItems);
}
