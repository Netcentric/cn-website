import { isValidJSON, getImageURL } from '../../scripts/personalisation-helpers.js';

function createEdOffer(offer) {
  const offerElement = document.createElement('div');
  const imageSrc = offer.imageURL ? getImageURL(offer.imageURL) : '/insights/2023/12/media_1db1f637bcc9a28245d76086f2d141781cbcc080d.png?width=2000&format=webply&optimize=medium';
  const subject = offer.subject ? `<p>${offer.subject}</p>` : '';
  offerElement.classList.add('ed-offer');
  offerElement.innerHTML = `
    <div class="img-wrapper">
        <img src="${imageSrc}" alt="${offer.offerName}" />
        <div class="img-mask"></div>
    </div>
    <div class="offer-details">
      ${subject}
      <h2>${offer.text}</h2>
    </div>
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