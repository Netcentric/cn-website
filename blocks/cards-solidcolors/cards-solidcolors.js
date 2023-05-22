export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.innerHTML = row.innerHTML;
    const stylerow = [...block.lastElementChild.children];
    const divdata = stylerow[1].textContent;
    const arr = divdata.split(',');
    [...ul.children].forEach(() => {
      for (let i = 0; i < arr.length; i += 1) {
        // eslint-disable-next-line prefer-destructuring
        ul.children[0].className = arr[0];
        if (ul.children[1] !== undefined) {
          // eslint-disable-next-line prefer-destructuring
          ul.children[1].className = arr[1];
          if (ul.children[2] !== undefined) {
          // eslint-disable-next-line prefer-destructuring
            ul.children[2].className = arr[2];
          }
        }
      }
    });
    [...li.children].forEach((div) => {
      div.className = 'cards-solidcolors-card-body';
      if (div.innerHTML === 'style') {
        div.parentNode.className = 'config-hidden';
      }
    });
    ul.append(li);
    const configHidden = ul.querySelector('.config-hidden');
    if (configHidden) configHidden.remove();
  });
  block.textContent = '';
  block.append(ul);
}
