export default function decorate(block) {
  const link = block.querySelector('a');
  if (link !== null && link.parentElement.type !== 'p') {
    link.classList.add('button', 'primary');
    const wrapper = document.createElement('p');
    wrapper.classList.add('button-container');
    wrapper.innerHTML = link.outerHTML;
    link.replaceWith(wrapper);
  }
}
