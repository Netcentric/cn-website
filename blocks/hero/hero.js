export default function decorate(block) {
  /* Move all buttons to one container */
  const firstButtonContainer = block.querySelector('.button-container');
  if (firstButtonContainer) {
    block.querySelectorAll('.button-container a.button').forEach((button, i) => {
      if (i === 0) return;
      const buttonContainer = button.parentNode;
      firstButtonContainer.append(button);
      button.classList.remove('primary');
      button.classList.add('secondary');
      buttonContainer.remove();
    });
  }
}
