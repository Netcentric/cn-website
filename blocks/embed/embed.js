const getDefaultEmbed = (url) => `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 40.75%">
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
