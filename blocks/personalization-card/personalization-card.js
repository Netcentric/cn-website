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
    <h2>${offer.content?.body?.content}</h2>
  `;
  return offerElement;
}

export default function decorate(block) {
  const content = block.textContent.trim();
  const editedContent = content.replace('Personalization Card:', '').trim();
  if(!isValidJSON(editedContent)) return;
  const data = JSON.parse(editedContent);
  block.children[0].remove();
  data.forEach((offer) => {
    const cardOffer = createCardOffer(offer);
    block.append(cardOffer);
  });
  block.append(content);
}