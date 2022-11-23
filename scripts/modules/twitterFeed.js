import injectScript from "./injectScript.js";

export default function decorateTwitterFeed(main) {
    const anchors = main.getElementsByTagName('a');
    const twitterAnchors = Array.from(anchors).filter((a) => a.href.includes('twitter') && a.href.includes('ref_src'));

    twitterAnchors.forEach((a) => {
        a.innerText = `Tweets by ${a.pathname.split('/').pop()}`;
        a.setAttribute('data-height', '500px');
        a.classList.add('twitter-timeline');
        injectScript('https://platform.twitter.com/widgets.js');
    });
}