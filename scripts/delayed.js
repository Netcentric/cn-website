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

function loadLaunch() {
  window.adobeDataLayer = window.adobeDataLayer || [];

  const src = window.location.host === 'www.netcentric.biz'
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

decorateTwitterFeed();
loadLaunch();
loadSidekickExtension();

if (document.body.classList.contains('blogpost')) {
  const scrollIndicator = new ScrollIndicator();

  scrollIndicator.init();
}
