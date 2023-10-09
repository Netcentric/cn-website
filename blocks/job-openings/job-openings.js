const iframeSrc = 'https://www.careers-page.com/netcentric';
let iframeElement = null;
let resizing = false;

function resizeIframeToFitContent() {
  if (iframeElement) {
    iframeElement.style.height = `${iframeElement.contentWindow.document.body.scrollHeight}px`;
  }
}

function setIframeHeightBasedOnViewport() {
  const width = window.innerWidth;
  let newHeight = '2300px';

  if (width <= 768) {
    newHeight = '5000px';
  } else if (width <= 1024) {
    newHeight = '4200px';
  }

  if (iframeElement && iframeElement.style.height !== newHeight) {
    iframeElement.style.height = newHeight;
  }
}

const resizeObserver = new ResizeObserver(() => {
  setIframeHeightBasedOnViewport();
});

function initIframe(block) {
  const iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.classList.add('embed-job-openings');
  iframe.style.cssText = 'width:100%; height:0; border:none;';
  iframe.scrolling = 'no';
  iframe.loading = 'lazy';
  block.appendChild(iframe);
  iframeElement = iframe;

  iframeElement.addEventListener('load', () => {
    resizeIframeToFitContent();
  });

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

  resizeObserver.observe(iframeElement);

  window.addEventListener('resize', () => {
    if (!resizing) {
      resizing = true;
      requestAnimationFrame(() => {
        setIframeHeightBasedOnViewport();
        resizing = false;
      });
    }
  });
}
