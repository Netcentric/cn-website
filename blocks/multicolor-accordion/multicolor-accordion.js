export default async function decorate(block) {
  const accordionItems = block.querySelectorAll(':scope > div > div');
  accordionItems.forEach((accordionItem) => {
    const nodes = accordionItem.children;

    const titleText = nodes[0];
    const rest = Array.prototype.slice.call(nodes, 1);

    const titleDiv = document.createElement('div');
    const detailsBtn = document.createElement('button');
    detailsBtn.innerText = 'Details';
    detailsBtn.className = 'details-button';
    titleDiv.append(titleText, detailsBtn);

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

    accordionItem.replaceWith(newItem);
  });

  const triggers = block.querySelectorAll('.accordion-trigger');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const openAttribute = 'aria-expanded';
      const wasOpen = trigger.parentElement.hasAttribute(openAttribute);

      triggers.forEach((_trigger) => {
        const getDetailsBtn = _trigger.children[1];
        getDetailsBtn.className = 'details-button';
        getDetailsBtn.innerText = 'Details';
        _trigger.parentElement.removeAttribute('aria-expanded');
      });

      if (!wasOpen) {
        const closeBtn = trigger.children[1];
        closeBtn.className = 'close-button';
        closeBtn.innerText = 'close';
        trigger.parentElement.setAttribute('aria-expanded', '');
      }
    });
  });
}
