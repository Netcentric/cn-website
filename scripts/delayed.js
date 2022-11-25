/* eslint-disable import/no-cycle */
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
const main = document.querySelector('main');

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

function decorateTwitterFeed() {
  const anchors = main.getElementsByTagName('a');
  const twitterAnchors = Array.from(anchors).filter((a) => a.href.includes('twitter') && a.href.includes('ref_src'));

  twitterAnchors.forEach((a) => {
    a.innerText = `Tweets by ${a.pathname.split('/').pop()}`;
    a.setAttribute('data-height', '500px');
    a.classList.add('twitter-timeline');
    injectScript('https://platform.twitter.com/widgets.js');
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

function decorateEmbed() {
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

function loadLaunch() {
  window.adobeDataLayer = window.adobeDataLayer || [];

  const src = window.location.host === 'www.netcentric.biz'
    ? 'https://assets.adobedtm.com/2d725b839720/bfa5096a0ae6/launch-f793edd9423d.min.js'
    : 'https://assets.adobedtm.com/2d725b839720/bfa5096a0ae6/launch-2033de7801fe-staging.min.js';
  injectScript(src);
}

// decorateTwitterFeed();
//decorateEmbed();
loadLaunch();
