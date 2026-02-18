/**
 * Calculates padding-bottom percentage from aspect ratio
 * @param {string} ratio - Aspect ratio in format "width:height" (e.g., "9:16")
 * @returns {string} - Padding-bottom percentage (e.g., "177.78%")
 */
const calculatePaddingFromRatio = (ratio) => {
  const [width, height] = ratio.split(':').map(Number);
  if (!width || !height) {
    return null;
  }
  return `${(height / width) * 100}%`;
};

const getDefaultEmbed = (url, paddingBottom = '40.75%') => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: ${paddingBottom}">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute; overflow: visible;" allowfullscreen=""
        scrolling="yes" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;

const embedOfferings = (url) => {
  const embedHTML = `<div class="embed-offerings-wrapper">
    <iframe src="${url.href}" class="embed-offerings-content" allowfullscreen=""
      scrolling="yes" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
    </iframe>
  </div>`;
  return embedHTML;
};

const embedDiversity = (url) => {
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 42.75%;">
      <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute; overflow: visible;" allowfullscreen=""
        scrolling="yes" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;
  return embedHTML;
};

const loadEmbed = (block, link) => {
  if (block.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['offerings'],
      embed: embedOfferings,
    },
    {
      match: ['diversity'],
      embed: embedDiversity,
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);

  // Check for custom aspect ratio from autoblock
  let paddingBottom;
  const parentSection = block.closest('.section');
  if (parentSection && parentSection.dataset.embedAspectRatio) {
    paddingBottom = calculatePaddingFromRatio(parentSection.dataset.embedAspectRatio);
  }

  if (config) {
    block.innerHTML = config.embed(url);
    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    block.innerHTML = getDefaultEmbed(url, paddingBottom);
    block.classList = 'block embed';
  }
  block.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  const link = block.querySelector('a').href;
  block.textContent = '';
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadEmbed(block, link);
    }
  });
  observer.observe(block);
}
