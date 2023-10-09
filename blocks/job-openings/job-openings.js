const iframeSrc = 'https://www.careers-page.com/netcentric';
let iframeElement = null;
let resizeTimeout;

function resizeIframeToFitContent() {
  if (iframeElement) {
    const newHeight = `${iframeElement.contentWindow.document.body.scrollHeight}px`;
    if (iframeElement.style.height !== newHeight) {
      iframeElement.style.height = newHeight;
    }
  }
}

function setIframeHeightBasedOnViewport() {
  if (!iframeElement) return;

  const width = window.innerWidth;
  let newHeight;

  if (width <= 768) {
    newHeight = '5000px';
  } else if (width <= 1024) {
    newHeight = '4200px';
  } else {
    newHeight = '2300px';
  }

  if (iframeElement.style.height !== newHeight) {
    iframeElement.style.height = newHeight;
  }
}

function onWindowResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    setIframeHeightBasedOnViewport();
  }, 100);
}

function initIframe(block) {
  if (iframeElement) return;

  iframeElement = document.createElement('iframe');
  iframeElement.src = iframeSrc;
  iframeElement.classList.add('embed-job-openings');
  iframeElement.style.cssText = 'width:100%; height:0; border:none;';
  iframeElement.scrolling = 'no';
  iframeElement.loading = 'lazy';
  block.appendChild(iframeElement);

  iframeElement.addEventListener('load', resizeIframeToFitContent);

  setIframeHeightBasedOnViewport();
}

export default function decorate(block) {
  const observerOptions = {
    rootMargin: '0px',
    threshold: 0.2,
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      initIframe(block);
      observer.disconnect();
    }
  }, observerOptions);

  observer.observe(block);

  window.addEventListener('resize', onWindowResize);
}
