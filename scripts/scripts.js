import {
  sampleRUM,
  getLanguagePath,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  fetchPlaceholders,
  waitForLCP,
  loadBlocks,
  toClassName,
  getMetadata,
  loadCSS,
} from './lib-franklin.js';
import TEMPLATE_LIST from '../templates/config.js';

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

/**
 * Check button type and return the right classList to be added to the anchor tag, if needed
 * @param {HTMLElement} up Anchor tag parent Element
 * @returns {({string, HTMLElement} | null)} {string, HTMLElement} or null
 */
function setButtonClassName(up) {
  const twoUp = up.parentElement;
  const buttonTags = {
    P: 'P',
    DIV: 'DIV',
    STRONG: 'STRONG',
    EM: 'EM',
  };
  const upLength = up.childNodes.length;
  const twoUpLength = twoUp.childNodes.length;
  const isButton = upLength === 1 && buttonTags[up.tagName] !== undefined;
  const isInPTag = twoUpLength === 1 && twoUp.tagName === buttonTags.P;
  const isPrimary = isButton && up.tagName === buttonTags.STRONG && isInPTag;
  const isSecondary = isButton && up.tagName === buttonTags.EM && isInPTag;

  if (isPrimary) { // primary CTA button link
    return { classList: 'button primary', el: twoUp };
  }

  if (isSecondary) { // secondary CTA button link
    return { classList: 'button secondary', el: twoUp };
  }

  if (isButton) { // default navigational link
    return { classList: 'button', el: up };
  }

  return null;
}

/**
 * decorates paragraphs containing a single link as buttons with classes and
 * chevron icon.
 * @param {Element} element container element
 */
function decorateButtons(element) {
  element.querySelectorAll('a').forEach((a) => {
    if (a.href === a.textContent) return;
    const up = a.parentElement;
    const threeUp = up.parentElement.parentElement;

    if (a.querySelector('img') || threeUp.classList.contains('fixed-social-media')) return;
    a.title = a.title || a.textContent.trim();

    if (setButtonClassName(up)) {
      const { classList, el } = setButtonClassName(up);
      a.className = classList;
      el.classList.add('button-container');
      addChevronToButtons(up);
    }
  });
}

/**
 * Build the Hero block depends if the block is present or not in the document
 * @param {HTMLElement} main
 */
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

  if (h1Sibling && h1Sibling.firstElementChild?.nodeName === 'PICTURE') {
    picture = h1Sibling;
  } else if (h1Sibling && h1Sibling.nextElementSibling?.firstElementChild?.nodeName === 'PICTURE') {
    picture = h1Sibling.nextElementSibling?.firstElementChild;
    subtitle = h1Sibling;
  }

  if (h1) {
    const section = document.createElement('div');
    let elems = [h1]; /* 3. If there is only a h1, build a block out of the h1 */
    if (picture) {
      const hr = document.createElement('hr');
      elems = [hr, h1, subtitle, picture];
    }
    section.append(buildBlock('hero', { elems }));
    main.prepend(section);
  }
}

/**
 * Returns a Franklin icon span (that will be expanded by decorateIcons)
 * @param {string} name The icon file name (minus ".svg")
 * @returns {HTMLSpanElement}
 */
export function createIcon(name) {
  const icon = document.createElement('span');
  icon.classList.add('icon', `icon-${name}`);

  return icon;
}

/**
 * Creates an Embed Media element in a iframe
 * @param {HTMLAnchorElement} a
 * @param {string} vendor
 * @returns {HTMLDivElement} the embedded element
 */
function createEmbedIFrame(a, vendor) {
  const div = document.createElement('div');
  div.classList.add(`${vendor}-base`);
  const id = a.pathname.split('/').pop();

  const vendors = {
    youtube: {
      source: `https://www.youtube.com/embed/${id}`,
      className: 'youtube-player',
      allow: 'encrypted-media; accelerometer; gyroscope; picture-in-picture',
    },
    spotify: {
      source: `https://open.spotify.com/embed/episode/${id}`,
      className: 'spotify-player',
      allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
    },
    wistia: {
      source: `https://fast.wistia.net/embed/iframe/${id}`,
      className: 'wistia-player',
      allow: 'autoplay; clipboard-write; encrypted-media; fullscreen;',
    },
  };
  const { source, className, allow } = vendors[vendor];

  div.innerHTML = `<iframe data-src="${source}"
        class="${className}"
        allow="${allow}"
        style="display: none"
        loading="auto">
    </iframe>`;

  a.replaceWith(div);
  return div;
}

/**
 * Checks if the anchor element is a media-type link based on the string passed by parameter
 * @param {HTMLAnchorElement} a HTMLAnchorElement
 * @param {string} type vendor type
 * @returns {boolean} true | false
 */
function isMediaLink(a, type) {
  return a.href.includes(type) && encodeURI(a.textContent.trim()).indexOf(a.href) !== -1;
}

/**
 * Prepare en Embed Element to be parsed by the decoration phase
 * @param {HTMLElement} main Main Element tag
 */
function preDecorateEmbed(main) {
  const lazyEmbeds = [];

  const anchors = [...main.getElementsByTagName('a')];
  const youTubeAnchors = anchors.filter((a) => isMediaLink(a, 'youtu'));
  const spotifyAnchors = anchors.filter((a) => isMediaLink(a, 'spotify'));
  const wistiaAnchors = anchors.filter((a) => isMediaLink(a, 'wistia'));

  youTubeAnchors.forEach((a) => {
    lazyEmbeds.push(createEmbedIFrame(a, 'youtube'));
  });
  spotifyAnchors.forEach((a) => {
    lazyEmbeds.push(createEmbedIFrame(a, 'spotify'));
  });
  wistiaAnchors.forEach((a) => {
    lazyEmbeds.push(createEmbedIFrame(a, 'wistia'));
  });

  if ('IntersectionObserver' in window) {
    // eslint-disable-next-line vars-on-top
    const lazyEmbedObserver = new IntersectionObserver((entries) => {
      entries.forEach((embed) => {
        if (embed.isIntersecting) {
          const iframe = embed.target.firstChild;
          iframe.src = iframe.dataset.src;
          iframe.style.display = iframe.style.display === 'none' ? '' : 'none';
          lazyEmbedObserver.unobserve(embed.target);
        }
      });
    });

    lazyEmbeds.forEach((lazyEmbed) => {
      lazyEmbedObserver.observe(lazyEmbed);
    });
  } else {
    lazyEmbeds.forEach((embed) => {
      const iframe = embed.querySelector('iframe');
      iframe.src = iframe.dataset.src;
      iframe.style.display = iframe.style.display === 'none' ? '' : 'none';
    });
  }
}

/**
 * Check if the url is a Marketo one
 * @param {URL} url - url to check
 * @returns {boolean} true | false
 */
export function isMarketoFormUrl(url) {
  return url.hostname === 'engage-lon.marketo.com';
}

/**
 * Check if an HTMLElement has a parentElement or not and
 * returns it from having it based on the callback
 * @param {HTMLElement} element - the HTMLElement to check
 * @param {Function} callback - recursive call to itself
 * @returns {(HTMLElement | Function | null)} te parentElement, this function itself or null
 */
function findParent(element, callback) {
  if (!element.parentElement) {
    return null;
  }
  if (callback(element.parentElement)) {
    return element.parentElement;
  }
  return findParent(element.parentElement, callback);
}

/**
 * Prepare the HTMLAnchorElement container to convert it to be a HTMLFormElement
 * @param {HTMLElement} main
 */
function preDecorateMarketoForm(main) {
  [...main.getElementsByTagName('a')].filter((a) => {
    try {
      return a.href
        && isMarketoFormUrl(new URL(a.href))
        && !findParent(a, (parent) => parent.classList.contains('form'));
    } catch (e) {
      console.error('error while parsing form anchors', e); // eslint-disable-line no-console
      return false;
    }
  }).forEach((a) => {
    const formDiv = document.createElement('div');
    formDiv.classList.add('form');
    formDiv.innerHTML = `<div><div>${a.outerHTML}</div></div>`;
    a.parentElement.replaceWith(formDiv);
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
async function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    const template = toClassName(getMetadata('template'));
    const templates = TEMPLATE_LIST;
    if (templates.includes(template)) {
      const mod = await import(`../templates/${template}/${template}.js`);
      if (mod.default) {
        await mod.default(main);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Instruments the main element with document metadata for LiveUX tracking
 * @param {HTMLElement} main The main element
 */
function instrumentMain(main) {
  [...document.head.children]
    .filter((child) => child.nodeName === 'META' && child.name.startsWith('wp-'))
    .forEach((meta) => main.setAttribute(`data-${meta.name}`, meta.content));
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export async function decorateMain(main) {
  instrumentMain(main);
  // hopefully forward compatible button decoration
  decorateButtons(main);
  preDecorateMarketoForm(main);
  await buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  preDecorateEmbed(main);
}

/**
 * Lazy loads Gellix font from css file
 */
async function loadGellix() {
  await loadCSS('/styles/lazy-styles.css');
}

/**
 * sets the language attribute in the html tag
 */
function setPageLanguage() {
  let languagePath = getLanguagePath();

  if (languagePath) {
    languagePath = languagePath.slice(1);
  } else {
    languagePath = 'en';
  }
  document.documentElement.lang = languagePath;
}

/**
 * loads everything needed to get to LCP.
 */
async function loadEager(doc) {
  setPageLanguage();
  decorateTemplateAndTheme();
  await fetchPlaceholders();
  loadHeader(doc.querySelector('header'));
  const main = doc.querySelector('main');
  if (main) {
    await decorateMain(main);
    if (document.querySelector('main .section:first-child img')) {
      await waitForLCP(LCP_BLOCKS);
    } else {
      document.querySelector('body').classList.add('appear');
    }
    await loadGellix();
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

  loadFooter(doc.querySelector('footer'));

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

const params = new URLSearchParams(window.location.search);
if (params.get('performance')) {
  window.hlx.performance = true;
  import('./performance.js').then((mod) => {
    if (mod.default) mod.default();
  });
}
