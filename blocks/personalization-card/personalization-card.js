import { isValidJSON } from '../../scripts/personalisation-helpers.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

function createCardOffer(offer) {
  const offerElement = document.createElement('div');
  offerElement.classList.add('card-offer');
  offerElement.innerHTML = `
        <h2>${offer.title?.content}</h2>
        <p>${offer.body?.content}</p>
        <a href="#">${offer.buttons[0]?.text?.content}</a>
  `;
  return offerElement;
}

function handleOffers(block, offer) {
  const cardOffer = createCardOffer(offer);
  block.append(cardOffer);
}

export default function decorate(block) {
  const content = block.textContent.trim();
  const editedContent = content.replace('Personalization Card:', '').trim();
  if (!isValidJSON(editedContent)) {
    block.parentElement.remove();
    return;
  }
  loadCSS('/blocks/hero/hero.css');
  const data = JSON.parse(editedContent);
  block.children[0].remove();
  console.log(data)
  data.forEach((offer) => {
    if (Array.isArray(offer.content)) {
      offer.content.forEach((subOffer) => {
        handleOffers(block, subOffer);
      });
    } else {
      handleOffers(block, offer.content);
    }
  });
}