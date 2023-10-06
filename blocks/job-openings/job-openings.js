const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

let iframeElement = null;

function resizeIframeToFitContent(target) {
  try {
    requestAnimationFrame(() => {
      target.style.height = `${target.contentWindow.document.body.scrollHeight}px`;
    });
  } catch (error) {
    console.error('Could not resize iframe:', error);
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
    requestAnimationFrame(() => {
      iframeElement.style.height = newHeight;
    });
  }
}

function initIframe(block) {
  block.innerHTML = `
    <iframe src="https://www.careers-page.com/netcentric" 
            class="embed-job-openings" 
            style="width:100%; border:none;" 
            scrolling="no"
            loading="lazy">
    </iframe>
  `;

  iframeElement = block.querySelector('iframe');

  iframeElement.addEventListener('load', (event) => {
    resizeIframeToFitContent(event.target);
  });

  setIframeHeightBasedOnViewport();
}

export default function decorate(block) {
  const debouncedResize = debounce(setIframeHeightBasedOnViewport, 200);

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

  window.addEventListener('resize', debouncedResize);
}
