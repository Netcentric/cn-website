import { isValidJSON, getImageURL, getCookie } from '../../scripts/personalisation-helpers.js';
import { createOptimizedPicture } from '../../scripts/lib-franklin.js';


function createEdOffer(offer, index) {
  const offerElement = document.createElement('div');
  const imageSrc = offer.imageURL ? getImageURL(offer.imageURL) : '/insights/2023/12/media_1db1f637bcc9a28245d76086f2d141781cbcc080d.png?width=2000&format=webply&optimize=medium';
  const subject = offer.subject ? `<p>${offer.subject}</p>` : '';
  const button = offer.buttonText ? `<p class="button-container"><a href="#" class="button primary">${offer.buttonText}</a></p>` : '';
  const isAutenticated = getCookie('ncUser');
  const imgMask = isAutenticated ? '<div class="img-mask"></div>' : '';
  const imageLoading = !isAutenticated && index === 1 ? 'eager' : 'lazy';
  const offerPicture = createOptimizedPicture(imageSrc, offer.offerName, imageLoading, [{ media: '(min-width: 900px)', width: '2000' }, { width: '1200' }]);
  offerElement.classList.add('ed-offer');
  offerElement.innerHTML = `
    <div class="img-wrapper">
        ${offerPicture.outerHTML}
        ${imgMask}
    </div>
    <div class="offer-details">
      ${subject}
      <h2>${offer.text}</h2>
      ${button}
    </div>
  `;
  return offerElement;
}

function handleOffers(block, offer, index) {
  const edOffer = createEdOffer(offer, index);
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
  data.forEach((offer, index) => {
    if (Array.isArray(offer.content)) {
      offer.content.forEach((subOffer, subIndex) => {
        handleOffers(block, subOffer, subIndex);
      });
    } else {
      handleOffers(block, offer.content, index);
    }
  });
}