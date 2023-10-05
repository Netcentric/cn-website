import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const defaultAuthorName = 'Cognizant Netcentric';
const defaultAuthorRole = '';
const defaultAuthorImage = '/icons/nc.svg';

function getLang() {
  return document
    .querySelector('html')
    .getAttribute('lang');
}

function getMetaContent(metadataName) {
  return document
    .querySelector(`meta[name="${metadataName}"]`)
    .getAttribute('content');
}

export default async function decorate(block) {
  const authors = getMetaContent('authors').split(',');
  const date = new Date(getMetaContent('publishdate'));

  // TODO when we have blog articles in German we'll need to get the language
  const locale = getLang();
  const printableDate = date.toLocaleDateString(
    locale,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).toUpperCase();

  // TODO cache and share with related-blogs?
  const response = await fetch('/profiles/query-index.json');
  const json = await response.json();
  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.log('error loading profile blog', response);
    return;
  }

  // eslint-disable-next-line max-len
  const authorInfos = authors.map((author) => json.data.find((element) => element.name.trim() === author.trim()));

  let authorHTML = '';

  authorInfos.forEach((authorInfo) => {
    const authorImageAlt = `Picture of ${authorInfo?.name ?? defaultAuthorName}`;
    let authorImageHTML = `<img src="${authorInfo?.image ?? defaultAuthorImage}" alt="${authorImageAlt}" />`;
    if (authorInfo?.image) {
      authorImageHTML = createOptimizedPicture(
        authorInfo.image,
        authorImageAlt,
        false,
        [{ width: 70 }],
      ).outerHTML;
    }
    authorHTML += `
      <div class="authorprofile">
        <div class="image">
          ${authorImageHTML}
        </div>
        <div class="info">
          <p class="name">${authorInfo?.name ?? defaultAuthorName}</p>
          <p class="role">${authorInfo?.role ?? defaultAuthorRole}</p>
        </div>
      </div>
    `;
  });

  const pageURL = window.location.href;
  // TODO is twitter title good enough?
  //  should we check whether it exists and hide the icon otherwise?
  const shareText = getMetaContent('twitter:title');
  const shareSource = 'netcentric.biz';

  const setShareUrl = (clazz, base, params, urlPostProcess = (url) => url) => {
    const url = new URL(base);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    block.querySelector(`.share a.${clazz}`).href = urlPostProcess(url.toString());
  };
  block.innerHTML = `
  ${authorHTML} 
<div class="date">${printableDate}</div>
<div class="share">
  <p>${window.placeholders?.default?.share || 'SHARE'}</p>
  <div>
    <a class="facebook"><span class="icon icon-facebook"></span></a>
    <a class="twitter"><span class="icon icon-twitter"></span></a>
    <a class="linkedin"><span class="icon icon-linkedin"></span></a>
    <a class="mail"><span class="icon icon-email"></span></a>
  </div>
</div>
  `;
  setShareUrl('facebook', 'http://www.facebook.com/share.php', { u: pageURL });
  setShareUrl('twitter', 'http://www.twitter.com/share', { url: pageURL, text: shareText });
  setShareUrl('linkedin', 'http://www.linkedin.com/shareArticle?mini=true', { url: pageURL, title: shareText, source: shareSource });
  setShareUrl('mail', 'mailto:', { subject: shareText, body: pageURL }, (url) => url.replaceAll('+', '%20'));
  const imageElement = block.querySelector('.authorprofile .image img');
  imageElement.setAttribute('width', 70);
  imageElement.setAttribute('height', 70);
}
