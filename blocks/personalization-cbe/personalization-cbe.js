import { isValidJSON } from '../../scripts/personalisation-helpers.js';

function createCbeOffer(offer) {
  const offerElement = document.createElement('div');
  offerElement.classList.add('cbe-offer');
  offerElement.innerHTML = `
    <h2>${offer.content}</h2>
  `;
  return offerElement;
}

function handleOffers(block, offer) {
  const cbeOffer = createCbeOffer(offer);
  block.append(cbeOffer);
}

export default function decorate(block) {
  const content = block.textContent.trim();
  const editedContent = content.replace('Personalization CBE:', '').trim();
  if(!isValidJSON(editedContent)) return;
  const data = JSON.parse(editedContent);
  block.children[0].remove();
  data.forEach((offer) => {
    if (Array.isArray(offer.content)) {
      offer.content.forEach((subOffer) => {
        handleOffers(block, subOffer);
      });
    } else {
      handleOffers(block, offer.content);
    }
  });
  block.append(content);
}