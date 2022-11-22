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
import { buildAccordionBlock } from '../blocks/accordion/accordion.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
window.hlx.RUM_GENERATION = 'project-1'; // add your RUM generation information here

/**
 * Adds chevron to all buttons that are children of element
 * @param element The dom subtree containing buttons
 * @param selector The selector to match buttons
 */
export function addChevronToButtons(element, selector = 'a.button') {
  /* Add chevron to buttons */
  element.querySelectorAll(selector).forEach((button) => {
    const chevron = document.createElement('span');
    chevron.classList.add('icon', 'icon-chevron-right');
    button.append(chevron);
  });
}

function buildHeroBlock(main) {
  /* 1. If there is an explicit hero block, add it to its own section, so it can be full-width */
  const heroBlock = main.querySelector('.hero');
  if (heroBlock) {
    const section = document.createElement('div');
    section.append(heroBlock);
    main.prepend(section);
    return;
  }

  /* 2. If we are on a blog post with image, add the image and h1 */
  const h1 = main.querySelector('h1');
  let picture;
  let subtitle;

  const h1Sibling = document.querySelector('body.blogpost main h1 + p');

  if (h1Sibling && h1Sibling.firstElementChild.nodeName === 'PICTURE') {
    picture = h1Sibling;
  } else if (h1Sibling && h1Sibling.nextElementSibling.firstElementChild.nodeName === 'PICTURE') {
    picture = h1Sibling.nextElementSibling.firstElementChild;
    subtitle = h1Sibling;
  }

  if (h1 && picture) {
    const section = document.createElement('div');
    const hr = document.createElement('hr');
    section.append(buildBlock('hero', { elems: [hr, h1, subtitle, picture] }));
    main.prepend(section);
    return;
  }

  /* 3. If there is only a h1, build a block out of the h1 */
  if (h1) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [h1] }));
    main.prepend(section);
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
  const youTubeAnchors = Array.from(anchors).filter((a) => a.href.includes('youtu') && encodeURI(a.textContent.trim()).indexOf(a.href) !== -1);
  const spotifyAnchors = Array.from(anchors).filter((a) => a.href.includes('spotify') && encodeURI(a.textContent.trim()).indexOf(a.href) !== -1);
  const wistiaAnchors = Array.from(anchors).filter((a) => a.href.includes('wistia') && encodeURI(a.textContent.trim()).indexOf(a.href) !== -1);

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

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    buildAccordionBlock(main);
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
  decorateIcons(main);

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
