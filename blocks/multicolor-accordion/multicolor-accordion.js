const btnTextOpen = `${window.placeholders?.default?.Details || 'Details'}`;
const btnTextClose = `${window.placeholders?.default?.Close || 'Close'}`;

function closePrevItem(item) {
  const button = item.previousElementSibling;
  button.setAttribute('aria-expanded', false);
  const [, span] = button.children;
  span.innerText = btnTextOpen;
  span.classList.remove('details-button-open');

  item.setAttribute('aria-hidden', true);
  item.style.height = null;
}

function openCurrentItem(item, button) {
  item.setAttribute('aria-hidden', false);
  item.style.height = `${item.scrollHeight}px`;

  button.setAttribute('aria-expanded', true);
  const [, span] = button.children;
  span.innerText = btnTextClose;
  span.classList.add('details-button-open');
}

function toggleAccordian(event) {
  const button = event.currentTarget;

  const openedItem = button.closest('ul').querySelector('.accordion-content[aria-hidden="false"]');

  if (openedItem) {
    closePrevItem(openedItem);
  }

  const itemToOpen = button.nextElementSibling;

  if (openedItem !== itemToOpen) {
    openCurrentItem(itemToOpen, button);
  }
}

function createDetailsButton(title, index) {
  const span = document.createElement('span');
  span.classList.add('btn', 'details-button');
  span.innerText = btnTextOpen;

  const button = document.createElement('button');
  button.classList.add('accordion-trigger');
  button.setAttribute('aria-expanded', false);
  button.setAttribute('aria-controls', `panel-${index}`);
  button.append(title, span);
  button.addEventListener('click', toggleAccordian);

  return button;
}

function createAccordianItems({ children }, index) {
  const [title, content] = children;

  const button = createDetailsButton(title, index);

  content.classList.add('accordion-content');
  content.setAttribute('aria-hidden', true);
  content.id = `panel-${index}`;
  content.querySelectorAll('a').forEach((link) => {
    link.target = '_blank';
  });

  const li = document.createElement('li');
  li.classList.add('accordion-item');
  li.append(button, content);

  return li;
}

export default async function decorate(block) {
  const ul = document.createElement('ul');
  ul.classList.add('multicolor-accordion-wrap');

  const items = [...block.children].map(createAccordianItems);
  ul.append(...items);

  block.replaceWith(ul);
}
