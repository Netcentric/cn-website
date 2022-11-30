export default function decorate(block) {
  const elements = Array.from(block.children);
  const wrap = document.createElement('div');

  block.classList.add('slider-base');
  wrap.classList.add('slider-wrap');
  elements.forEach((element) => {
    element.classList.add('slider-element');
    wrap.append(element);
  });
  block.innerHTML = '';
  block.append(wrap);
  waitForAppear(block);
}