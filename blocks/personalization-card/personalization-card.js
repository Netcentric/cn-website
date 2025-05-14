import { isValidJSON } from '../../scripts/personalisation-helpers.js';
import { addChevronToButtons } from '../../scripts/scripts.js';

function createCardOffer(offer) {
  const offerElement = document.createElement('div');
  const title = offer.title?.content ? `<h1>${offer.title?.content}</h1>` : '';
  const text = offer.body?.content ? `<p>${offer.body?.content}</p>` : '';
  const button = offer.buttons[0]?.text?.content ? `<p class="button-container"><a href="#" class="button primary">${offer.buttons[0]?.text?.content}</a></p>` : '';
  const image = offer.image?.url ? `<img src="${offer.image?.url}" alt="${offer.image?.alt}" />` : '';
  offerElement.className = 'section dark-plum card-offer';
  offerElement.innerHTML = `
    ${image}
    <div class="offer-details">
      ${title}
      ${text}
      ${button}
    </div>
  `;
  return offerElement;
}

function handleOffers(block, offer) {
  const cardOffer = createCardOffer(offer);
  addChevronToButtons(block);
  block.append(cardOffer);
}

export default function decorate(block) {
  const content = block.textContent.trim();
  const editedContent = content.replace('Personalization Card:', '').trim();
  if (!isValidJSON(editedContent)) {
    block.parentElement.remove();
    return;
  }
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
}