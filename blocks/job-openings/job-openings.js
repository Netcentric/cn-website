const iframeHTML = '<iframe src="https://www.careers-page.com/netcentric" class="embed-job-openings" style="width:100%; border:none;" scrolling="no"></iframe>';

function resizeIframeToFitContent(target) {
  try {
    target.style.height = `${target.contentWindow.document.body.scrollHeight}px`;
    // eslint-disable-next-line no-empty
  } catch (error) {}
}

function setIframeHeightBasedOnViewport(iframeElement) {
  const width = window.innerWidth;
  if (width <= 768) { // Mobile
    iframeElement.style.height = '5000px';
  } else if (width <= 1024) { // Tablet
    iframeElement.style.height = '4200px';
  } else { // Desktop
    iframeElement.style.height = '2300px';
  }
}

export default function decorate(block) {
  block.innerHTML = iframeHTML;

  const iframeElement = block.querySelector('iframe');

  setIframeHeightBasedOnViewport(iframeElement);

  iframeElement.addEventListener('load', (event) => {
    resizeIframeToFitContent(event.target);
  });

  window.addEventListener('resize', () => {
    setIframeHeightBasedOnViewport(iframeElement);
  });
}
