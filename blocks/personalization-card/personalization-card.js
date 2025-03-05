function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function createCardOffer(offer) {
  const offerElement = document.createElement('div');
  offerElement.classList.add('card-offer');
  offerElement.innerHTML = `
    <h2>${offer.body?.content}</h2>
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