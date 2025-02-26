function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function createEdOffer(offer) {
  const offerElement = document.createElement('div');
  offerElement.classList.add('ed-offer');
  offerElement.innerHTML = `
    <h2>${offer.content?.content}</h2>
  `;
  return offerElement;
}

export default function decorate(block) {
  const content = block.textContent.trim();
  const editedContent = content.replace('Personalization ED:', '').trim();
  if(!isValidJSON(editedContent)) return;
  const data = JSON.parse(editedContent);
  block.children[0].remove();
  data.forEach((offer) => {
    const edOffer = createEdOffer(offer);
    block.append(edOffer);
  });
  block.append(content);
}