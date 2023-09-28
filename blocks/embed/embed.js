const getDefaultEmbed = (url, additionalWrapperClass = false) => `<div class="embed-wrapper ${additionalWrapperClass ? ` embed-${additionalWrapperClass}-wrapper` : ''}">
      <iframe src="${url.href}" class="embed-content" allowfullscreen=""
        scrolling="yes" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
      </iframe>
    </div>`;

const embedOfferings = (url) => getDefaultEmbed(url, 'offerings');

const embedDiversity = (url) => getDefaultEmbed(url, 'diversity');

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
  if (config) {
    block.innerHTML = config.embed(url);
    block.classList = `block embed embed-${config.match[0]}`;
  } else {
    block.innerHTML = getDefaultEmbed(url);
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
