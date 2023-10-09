const iframeElement = document.createElement('iframe');
iframeElement.src = 'https://www.careers-page.com/netcentric';
iframeElement.className = 'embed-job-openings';

function resizeIframeToFitContent(target) {
  try {
    target.style.height = `${target.contentWindow.document.body.scrollHeight}px`;
  } catch (error) {
    console.error('Could not resize iframe:', error);
  }
}

export default function decorate(block) {
  const fragment = document.createDocumentFragment();
  fragment.appendChild(iframeElement);

  iframeElement.addEventListener('load', (event) => {
    resizeIframeToFitContent(event.target);
  });

  block.appendChild(fragment);
}
