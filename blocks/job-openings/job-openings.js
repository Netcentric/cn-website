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

function initIframe(block) {
  const iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.classList.add('embed-job-openings');

  // Set an explicit width for the iframe
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
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        initIframe(block);
        observer.disconnect();
      }
    });
    observer.observe(block);
  } else {
    initIframe(block);
  }

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
