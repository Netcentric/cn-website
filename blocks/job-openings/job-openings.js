const iframe = '<iframe src="https://www.careers-page.com/netcentric" class="embed-job-openings" scrolling="no"></iframe>';

function resizeIframeToFitContent(target) {
  try {
    target.style.height = `${target.contentWindow.document.body.scrollHeight}px`;
    // eslint-disable-next-line no-empty
  } catch (error) {}
}

export default function decorate(block) {
  block.innerHTML = iframe;

  const iframeElement = block.querySelector('iframe');

  iframeElement.addEventListener('load', (event) => {
    resizeIframeToFitContent(event.target);
  });
}
