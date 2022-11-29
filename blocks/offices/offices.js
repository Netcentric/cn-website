function removeChevronFromContactLinks(textBlock) {
  const contactLinksChevron = textBlock.querySelectorAll('.button-container:not(:last-of-type) .icon');
  contactLinksChevron.forEach((element) => {
    element.remove();
  });
}

export default function decorate(block) {
  const textBlocks = block.querySelectorAll('.offices > div > div:has(h2)');
  textBlocks.forEach((textBlock) => {
    removeChevronFromContactLinks(textBlock);
  });
}
