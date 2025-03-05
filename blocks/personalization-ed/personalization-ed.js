import { isValidJSON } from '../../scripts/personalisation-helpers.js';

function createEdOffer(offer) {
  const offerElement = document.createElement('div');
  offerElement.classList.add('ed-offer');
  offerElement.innerHTML = `
    <h2>${offer.content}</h2>
  `;
  return offerElement;
}

function handleOffers(block, offer) {
  const edOffer = createEdOffer(offer);
  block.append(edOffer);
}

export default function decorate(block) {
  const content = block.textContent.trim();
  const editedContent = content.replace('Personalization ED:', '').trim();
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