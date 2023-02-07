/**
 * This template is for run some test code and can be edited and/or removed it
 */

function addTestButtons() {
  return `
  <div className="buttons-container">
  <button type="button" id="small">Small</button>
  <button type="button" id="medium">Medium</button>
  <button type="button" id="current">Current</button>
  <button type="button" id="blogpost">Blogpost</button>
  <button type="button" id="simple">Simple Hero content</button>
  <button type="button" id="complete">Complete Hero content</button>
  <button type="button" id="fit-content">Fit the content</button>
  </div>
  `;
}

function addListeners(buttons, main) {
  const container = buttons.children[0];
  const heroBlock = main.querySelector('.hero.block');
  const heroContent = heroBlock.children[0].children[0];
  const title = heroContent.querySelector('h1');
  const subTitle = heroContent.querySelector('p');
  const ctaBtn = heroContent.querySelector('.button-container');
  const defaultTitleText = title.innerText;
  const simpleTitle = 'Blogs & Insights';
  const { body } = document;
  container.addEventListener('click', (e) => {
    const { id } = e.target;
    const classes = ['small', 'medium'];
    if (id !== 'fit-content') {
      heroBlock.classList.remove(...classes);
      body.classList.remove('blogpost');
    } else {
      const { classList } = heroBlock;
      heroBlock.classList.toggle('fit-content');
      e.target.style.backgroundColor = classList.contains('fit-content') ? 'gold' : 'inherit';
    }
    if (classes.includes(id)) {
      heroBlock.classList.add(id);
    } else if (id === 'blogpost') {
      body.classList.add(id);
    } else if (id === 'simple') {
      title.innerText = simpleTitle;
      subTitle.style.display = 'none';
      ctaBtn.style.display = 'none';
    } else if (id === 'complete') {
      title.innerText = defaultTitleText;
      subTitle.style.display = 'inherit';
      ctaBtn.style.display = 'inherit';
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
