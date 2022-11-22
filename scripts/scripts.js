import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

function injectScript(src) {
  window.scriptsLoaded = window.scriptsLoaded || [];

  if (window.scriptsLoaded.indexOf(src)) {
    const head = document.querySelector('head');
    const script = document.createElement('script');

    script.src = src;
    script.setAttribute('async', 'true');
    head.append(script);
    window.scriptsLoaded.push(src);
  }
}

function createEmbedWrap(a, vendor) {
  const div = document.createElement('div');
  div.classList.add(`${vendor}-base`);

  a.style.display = 'none';
  a.insertAdjacentElement('afterend', div);
}

function preDecorateEmbed(main) {
  const anchors = main.getElementsByTagName('a');
  const youTubeAnchors = Array.from(anchors).filter((a) => a.href.includes('youtu'));
  const spotifyAnchors = Array.from(anchors).filter((a) => a.href.includes('spotify'));
  const wistiaAnchors = Array.from(anchors).filter((a) => a.href.includes('wistia'));

  window.embedAnchors = {
    youTubeAnchors,
    spotifyAnchors,
    wistiaAnchors,
  };

  youTubeAnchors.forEach((a) => {
    createEmbedWrap(a, 'youtube');
  });
  spotifyAnchors.forEach((a) => {
    createEmbedWrap(a, 'spotify');
  });
  wistiaAnchors.forEach((a) => {
    createEmbedWrap(a, 'wistia');
  });
}

function createIframe(a, vendor) {
  const div = a.nextElementSibling;
  const embed = a.pathname;
  const id = embed.split('/').pop();
  let source;
  let className;
  let allow;

  a.remove();

  if (vendor === 'youtube') {
    source = `https://www.youtube.com/embed/${id}`;
    className = 'youtube-player';
    allow = 'encrypted-media; accelerometer; gyroscope; picture-in-picture';
  } else if (vendor === 'spotify') {
    source = `https://open.spotify.com/embed/episode/${id}`;
    className = 'spotify-player';
    allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  } else if (vendor === 'wistia') {
    source = `https://fast.wistia.net/embed/iframe/${id}`;
    className = 'wistia-player';
    allow = 'autoplay; clipboard-write; encrypted-media; fullscreen;';
  }

  div.innerHTML = `<iframe src="${source}" 
        class="${className}"
        allowfullscreen  
        allow="${allow}"
        loading="lazy">
    </iframe>`;
}

export function decorateEmbed() {
  window.embedAnchors?.youTubeAnchors?.forEach((a) => {
    createIframe(a, 'youtube');
  });
  window.embedAnchors?.spotifyAnchors?.forEach((a) => {
    createIframe(a, 'spotify');
  });
  window.embedAnchors?.wistiaAnchors?.forEach((a) => {
    createIframe(a, 'wistia');
  });
}

export function decorateTwitterFeed(main) {
  const anchors = main.getElementsByTagName('a');
  const twitterAnchors = Array.from(anchors).filter((a) => a.href.includes('twitter'));

  twitterAnchors.forEach((a) => {
    a.innerText = `Tweets by ${a.pathname.split('/').pop()}`;
    a.setAttribute('data-height', '500px');
    a.classList.add('twitter-timeline');
    injectScript('https://platform.twitter.com/widgets.js');
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  preDecorateEmbed(main);
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.parentElement.replaceChild(link, existingLink);
  } else {
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

/**
 * loads everything that doesn't need to be delayed.
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? main.querySelector(hash) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/icons/favicon.ico`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * loads everything that happens a lot later, without impacting
 * the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
