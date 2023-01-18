import { loadBlock } from '../../scripts/lib-franklin.js';

export default function buildAutoBlocks() {
  const columnsBlock = document.querySelector('.columns:has(.form)');
  const formBlock = columnsBlock && columnsBlock.querySelector('.form');

  // Setup the element to be loaded as a regular block
  formBlock.classList.add('block', 'innerblock');
  formBlock.dataset.blockName = 'form';
  formBlock.dataset.blockStatus = 'initialized';

  loadBlock(formBlock);
}
