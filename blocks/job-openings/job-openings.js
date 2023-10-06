const iframeHTML = `
  <iframe src="https://www.careers-page.com/netcentric" 
          class="embed-job-openings" 
          style="width:100%; border:none;" 
          scrolling="no">
  </iframe>
`;

let resizeTimer;

function setIframeHeightBasedOnViewport(iframeElement) {
  const width = window.innerWidth;
  if (width <= 768) {
    iframeElement.style.height = '5000px';
  } else if (width <= 1024) {
    iframeElement.style.height = '4200px';
  } else {
    iframeElement.style.height = '2300px';
  }
}

function decorate(block) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        block.innerHTML = iframeHTML;
        const iframeElement = block.querySelector('iframe');
        setIframeHeightBasedOnViewport(iframeElement);
        observer.disconnect();
      }
    });
    observer.observe(block);
  } else {
    block.innerHTML = iframeHTML;
    const iframeElement = block.querySelector('iframe');
    setIframeHeightBasedOnViewport(iframeElement);
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const iframeElement = block.querySelector('iframe');
      setIframeHeightBasedOnViewport(iframeElement);
    }, 200);
  });
}

export default decorate;
