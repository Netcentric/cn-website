let accordionItemOpen = null;
const openAttribute = 'aria-expanded';
const hiddenAttribute = 'aria-hidden';
const btnTextOpen = `${window.placeholders?.default?.Details || 'Details'}`;
const btnTextClose = `${window.placeholders?.default?.Close || 'Close'}`;

function getOpenAccordian(buttonWrapper, content) {
  accordionItemOpen = buttonWrapper;
  buttonWrapper.setAttribute(openAttribute, true);
  content.setAttribute(hiddenAttribute, false);
  const panel = buttonWrapper.nextElementSibling;
  panel.style.maxHeight = `${panel.scrollHeight}px`;
  const openAccordianBtn = accordionItemOpen.children[1];
  openAccordianBtn.className = 'btn close-button';
  openAccordianBtn.innerText = btnTextClose;
}

function toggleAccordian(buttonWrapper, content) {
  if (accordionItemOpen) {
    const panelClosed = accordionItemOpen.nextElementSibling;
    panelClosed.style.maxHeight = null;
    accordionItemOpen.setAttribute(openAttribute, false);
    content.setAttribute(hiddenAttribute, true);
    const btn = accordionItemOpen.querySelector('.btn');
    btn.className = 'btn details-button';
    btn.innerText = btnTextOpen;
  }
  if (accordionItemOpen === buttonWrapper) {
    accordionItemOpen = null;
    return;
  }
  getOpenAccordian(buttonWrapper, content);
}

function getAccordianItems(ul, accordionItem, index) {
  const [title, content] = accordionItem.children;
  const buttonWrapper = document.createElement('button');
  const span = document.createElement('span');
  span.className = 'btn details-button';
  span.innerText = btnTextOpen;
  buttonWrapper.append(title, span);
  buttonWrapper.classList.add('accordion-trigger');
  buttonWrapper.setAttribute(openAttribute, false);
  buttonWrapper.setAttribute('aria-controls', `panel${index + 1}`);
  content.className = 'accordion-content';
  content.setAttribute(hiddenAttribute, true);
  const newItem = document.createElement('li');
  newItem.append(buttonWrapper, content);
  newItem.classList.add('accordion-item');
  content.id = `panel${index + 1}`;
  ul.append(newItem);
  accordionItem.replaceWith(ul);

  buttonWrapper.addEventListener('click', () => toggleAccordian(buttonWrapper, content));
}

export default async function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach(getAccordianItems.bind(null, ul));
}
