/* eslint-disable import/no-cycle */
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
const main = document.querySelector('main');

function injectScript(src, crossOrigin = '') {
  window.scriptsLoaded = window.scriptsLoaded || [];

  if (window.scriptsLoaded.indexOf(src)) {
    const head = document.querySelector('head');
    const script = document.createElement('script');

    script.src = src;
    script.setAttribute('async', 'true');
    if (['anonymous', 'use-credentials'].includes(crossOrigin)) {
      script.crossOrigin = crossOrigin;
    }
    head.append(script);
    window.scriptsLoaded.push(src);
  }
}

function decorateTwitterFeed() {
  const anchors = main.getElementsByTagName('a');
  const twitterAnchors = Array.from(anchors).filter(
    (a) => a.href.includes('twitter') && a.href.includes('ref_src'),
  );

  twitterAnchors.forEach((a) => {
    a.innerText = `${window.placeholders?.default?.tweetsBy || 'Tweets by'} ${a.pathname.split('/').pop()}`;
    a.setAttribute('data-height', '500px');
    a.classList.add('twitter-timeline');
    injectScript('https://platform.twitter.com/widgets.js');
  });
}

function isProd() {
  return window.location.host === 'www.netcentric.biz';
}

function loadLaunch() {
  window.adobeDataLayer = window.adobeDataLayer || [];

  const src = isProd()
    ? 'https://assets.adobedtm.com/2d725b839720/bfa5096a0ae6/launch-f793edd9423d.min.js'
    : 'https://assets.adobedtm.com/2d725b839720/bfa5096a0ae6/launch-2033de7801fe-staging.min.js';
  injectScript(src);
}

function loadSidekickExtension() {
  injectScript('/scripts/sidekick.js');
}

class ScrollIndicator {
  constructor() {
    this.container = document.createElement('div');
    this.bar = document.createElement('div');
  }

  init() {
    this.decorate();
    window.addEventListener('scroll', this.checkScroll.bind(this), { passive: true });
  }

  decorate() {
    this.container.classList.add('scroll-indicator-container');
    this.bar.classList.add('scroll-indicator-bar');
    this.container.append(this.bar);
    document.body.prepend(this.container);
  }

  checkScroll() {
    const pageScroll = window.scrollY;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollValue = (pageScroll / height) * 100;
    this.bar.style.width = `${scrollValue}%`;
  }
}

async function waitForOneTrust() {
  if (!isProd()) { return Promise.resolve(); }
  return new Promise((resolve, reject) => {
    let oneTrustPollCounter = 0;
    const pollOneTrustObject = setInterval(() => {
      if (window.OneTrust) {
        resolve();
        clearInterval(pollOneTrustObject); // Stop polling once detected
      }
      oneTrustPollCounter += 1;
      if (oneTrustPollCounter >= 50) {
        // eslint-disable-next-line no-console
        console.warn('OneTrust object not found after 5 seconds. Exiting polling.');
        clearInterval(pollOneTrustObject);
        reject();
      }
    }, 100);
  });
}

function cleanupHistory(history) {
  const threshold = new Date(Date.now() - 1000 * 60 * 60 * 24 /* one day */).toISOString();
  return history.filter((tag) => tag.time > threshold
    && !history.some((otherTag) => otherTag.tag === tag.tag && otherTag.time > tag.time));
}

async function initTagCollector() {
  await waitForOneTrust();
  if (isProd() && !window.OnetrustActiveGroups.indexOf(',C0004,')) {
    // eslint-disable-next-line no-console
    console.debug('Tag collector disabled.');
    return;
  }
  const tags = [...document.head.querySelectorAll('meta[property="article:tag"]')].map((tag) => ({ time: new Date().toISOString(), tag: tag.content }));
  const history = cleanupHistory([...JSON.parse(localStorage.getItem('user.history') || '[]'), ...tags]);
  localStorage.setItem('user.history', JSON.stringify(history));
  // eslint-disable-next-line no-console
  console.debug('Tag collector enabled.', localStorage.getItem('user.history'));
}

decorateTwitterFeed();
initTagCollector();
loadLaunch();
loadSidekickExtension();

if (document.body.classList.contains('blogpost')) {
  const scrollIndicator = new ScrollIndicator();

  scrollIndicator.init();
}
