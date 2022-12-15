export default function decorate(block) {
  const links = block.querySelectorAll('a');

  links.forEach((link) => {
    link.setAttribute('target', '_blank');
  })
}