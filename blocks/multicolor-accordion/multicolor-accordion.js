function setLabel(label, btn, btnText) {
  const checkClass = btn.classList.contains('close-button');
  if (label === 'Button Label') {
    btn.innerText = btnText;
  } else {
    btn.innerText = 'Details';
    if (checkClass) {
      btn.innerText = 'Close';
    }
  }
}

export default async function decorate(block) {
  const accordionItems = Array.from(block.children);
  const buttonLabelRow = Array.from(block.lastElementChild.children);
  const btnLabel = buttonLabelRow[0].textContent;
  const btnLabelText = buttonLabelRow[1].textContent;
  const btnLabelTextArr = btnLabelText.split(',');
  buttonLabelRow[0].classList.add('config-hidden');

  let accordionItemOpen = null;
  accordionItems.forEach((accordionItem, index) => {
    const openAttribute = 'aria-expanded';
    const hiddenAttribute = 'aria-hidden';
    const nodes = Array.from(accordionItem.children);
    const buttonWrapper = document.createElement('button');
    buttonWrapper.append(nodes[0]);
    const span = document.createElement('span');
    span.append(btnLabelTextArr[0]);
    span.className = 'btn details-button';
    setLabel(btnLabel, span, btnLabelTextArr[0]);
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

    buttonWrapper.addEventListener('click', () => {
      if (accordionItemOpen) {
        const panelClosed = accordionItemOpen.nextElementSibling;
        panelClosed.style.maxHeight = null;
        accordionItemOpen.setAttribute(openAttribute, false);
        accordionItemOpen.parentElement.setAttribute(hiddenAttribute, true);
        const btn = accordionItemOpen.querySelector('.btn');
        btn.className = 'btn details-button';
        setLabel(btnLabel, btn, btnLabelTextArr[0]);
      }
      if (accordionItemOpen === buttonWrapper) {
        accordionItemOpen = null;
        return;
      }
      accordionItemOpen = buttonWrapper;
      buttonWrapper.setAttribute(openAttribute, true);
      buttonWrapper.parentElement.setAttribute(hiddenAttribute, false);
      const panel = buttonWrapper.nextElementSibling;
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      const closeBtn = accordionItemOpen.children[1];
      closeBtn.className = 'btn close-button';
      setLabel(btnLabel, closeBtn, btnLabelTextArr[1]);
    });
  });
  const configHidden = block.querySelector('.config-hidden');
  if (configHidden) {
    configHidden.parentElement.remove();
  }
}
