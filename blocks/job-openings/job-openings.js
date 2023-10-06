const iframeHTML = `
  <iframe src="https://www.careers-page.com/netcentric" 
          class="embed-job-openings" 
          style="width:100%; border:none;" 
          scrolling="no"
          loading="lazy">
  </iframe>
`;

function resizeIframeToFitContent(target) {
  try {
    requestAnimationFrame(() => {
      target.style.height = `${target.contentWindow.document.body.scrollHeight}px`;
    });
  } catch (error) {
    console.error('Could not resize iframe:', error);
  }
}

function setIframeHeightBasedOnViewport(iframeElement) {
  const width = window.innerWidth;
  let newHeight = '2300px';

  if (width <= 768) {
    newHeight = '5000px';
  } else if (width <= 1024) {
    newHeight = '4200px';
  }

  if (iframeElement.style.height !== newHeight) {
    requestAnimationFrame(() => {
      iframeElement.style.height = newHeight;
    });
  }
}

function init(block, iframeElement) {
  setIframeHeightBasedOnViewport(iframeElement);

  iframeElement.addEventListener('load', (event) => {
    resizeIframeToFitContent(event.target);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setIframeHeightBasedOnViewport(iframeElement);
    }, 200);
  });
}

export default function decorate(block) {
  block.innerHTML = iframeHTML;
  const iframeElement = block.querySelector('iframe');

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      init(block, iframeElement);
      observer.disconnect(); // stop observing once initialized
    }
  });

  observer.observe(block);
}
