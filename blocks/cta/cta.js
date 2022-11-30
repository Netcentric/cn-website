export default function decorate(block) {
  const link = block.querySelector('a');
  if (link != null) {
    link.classList.add('button', 'primary');
  }
}
