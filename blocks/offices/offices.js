function removeChevronFromContactLinks(textBlock) {
  const contactLinksChevron = textBlock.querySelectorAll('.button-container:not(:last-of-type) .icon');
  contactLinksChevron.forEach((element) => {
    element.remove();
  });
}

function addTitleClass(textblock) {
  const btn = '.button-container';
  const ctaBtn = `${btn} strong`;
  const hasBtn = textblock.querySelector(btn);
  const isCallToActionBlock = !hasBtn || (hasBtn && textblock.querySelector(ctaBtn));
  if (!isCallToActionBlock) {
    const title = textblock.querySelector('h2');
    title.classList.add('offices__title');
  }
}

export default function decorate(block) {
  const textBlocks = block.querySelectorAll('.offices > div > div:has(h2)');
  textBlocks.forEach((textBlock) => {
    removeChevronFromContactLinks(textBlock);
    addTitleClass(textBlock);
  });
}
