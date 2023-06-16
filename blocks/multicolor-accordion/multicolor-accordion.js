function setLabel(label, btnText, btn) {
  btn.className = 'btn details-button';
  if (label === 'Button Label') {
    btn.innerText = btnText;
  } else {
    btn.innerText = 'Details';
  }
}

export default async function decorate(block) {
  const accordionItems = block.querySelectorAll(':scope > div');
  accordionItems.forEach((accordionItem) => {
    const nodes = accordionItem.children;

    const buttonLabelRow = [...block.lastElementChild.children];
    const btnLabel = buttonLabelRow[0].textContent;
    const btnLabelText = buttonLabelRow[1].textContent;
    buttonLabelRow[0].className = 'config-hidden';

    const titleText = nodes[0];
    const rest = [].slice.call(nodes, 1);

    const titleDiv = document.createElement('div');
    const detailsBtn = document.createElement('button');

    setLabel(btnLabel, btnLabelText, detailsBtn);

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

    titleDiv.addEventListener('click', () => {
      const openAttribute = 'aria-expanded';
      const wasOpen = titleDiv.parentElement.hasAttribute(openAttribute);
      titleDiv.parentElement.toggleAttribute(openAttribute);

      if (!wasOpen) {
        const closeBtn = titleDiv.children[1];
        closeBtn.className = 'btn close-button';
        closeBtn.innerText = 'close';
      } else {
        setLabel(btnLabel, btnLabelText, detailsBtn);
      }
    });
  });
  const configHidden = block.querySelector('.config-hidden');
  configHidden.parentElement.remove();
}
