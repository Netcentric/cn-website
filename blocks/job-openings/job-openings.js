/**
 * @returns {string}
 */
const getEmbedURL = () => {
  const baseUrl = 'https://www.careers-page.com/netcentric';

  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('jobId');

  if (jobId) {
    const url = new URL(`/netcentric/job/${jobId}`, baseUrl);
    return url.href;
  }

  return baseUrl;
};

/**
 * @param {string} url
 * @returns {string}
 */
const iframe = (url) => `<iframe src="${url}" class="embed-job-openings" style="width:100%; border:none;" scrolling="no"></iframe>`;

/**
 * @param {HTMLIFrameElement} target
 */
function resizeIframeToFitContent(target) {
  try {
    target.style.height = `${target.contentWindow.document.body.scrollHeight}px`;
    // eslint-disable-next-line no-empty
  } catch (error) {}
}

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  block.innerHTML = iframe(getEmbedURL());

  const iframeElement = block.querySelector('iframe');

  iframeElement.addEventListener('load', (event) => {
    resizeIframeToFitContent(event.target);
  });
}
