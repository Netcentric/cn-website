import { isValidJSON } from '../../scripts/personalisation-helpers.js';

export default function decorate(block) {
  const content = block.textContent.trim();
  const editedContent = content.replace('Personalization CBE:', '').trim();
  if(!isValidJSON(editedContent)) return;
  const data = JSON.parse(editedContent);
  block.children[0].remove();
  window.personalizationData = {...data[0]};
  console.log(data)
}