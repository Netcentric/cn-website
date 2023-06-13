export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.classList.add('flip-cards--wrap');

  [...block.children].forEach((row) => {
    const [defaultState, hoverState] = row.children;

    defaultState.classList.add('flip-cards--default');
    hoverState.classList.add('flip-cards--hover');

    const li = document.createElement('li');
    li.classList.add('flip-cards-item');
    li.append(defaultState, hoverState);

    ul.append(li);
  });

  block.innerHTML = ul.outerHTML;
}
