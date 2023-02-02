/**
 * This template is for run some test code and can be edited and/or removed it
 */

function addTestButtons() {
  return `
  <div className="buttons-container">
  <button type="button" id="small">small</button>
  <button type="button" id="medium">medium</button>
  <button type="button" id="current">current</button>
  </div>
  `;
}

function addListeners(buttons, main) {
  const container = buttons.children[0];
  const heroBlock = main.querySelector('.hero.block');
  container.addEventListener('click', (e) => {
    const { id } = e.target;
    const classes = ['small', 'medium'];
    heroBlock.classList.remove(...classes);
    if (id !== 'current') {
      heroBlock.classList.add(id);
    }
  });
}

export default function buildAutoBlocks() {
  const main = document.querySelector('main');
  const buttons = main.children[1];

  const observer = new MutationObserver((list) => {
    list.forEach((change) => {
      const { oldValue } = change;
      const status = change.target.dataset.sectionStatus;
      if (status === 'loaded' && oldValue === 'initialized') {
        buttons.innerHTML = addTestButtons();
        addListeners(buttons, main);
        observer.disconnect();
      }
    });
  });

  observer.observe(buttons, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-section-status'],
  });
}
