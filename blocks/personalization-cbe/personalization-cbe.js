function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function createCbeOffer(offer) {
  const offerElement = document.createElement('div');
  offerElement.classList.add('cbe-offer');
  offerElement.innerHTML = `
    <h2>${offer.content?.content}</h2>
  `;
  return offerElement;
}

export default function decorate(block) {
  const content = block.textContent.trim();
  const editedContent = content.replace('Personalization CBE:', '').trim();
  if(!isValidJSON(editedContent)) return;
  const data = JSON.parse(editedContent);
  block.children[0].remove();
  data.forEach((offer) => {
    const cbeOffer = createCbeOffer(offer);
    block.append(cbeOffer);
  });
  block.append(content);
}