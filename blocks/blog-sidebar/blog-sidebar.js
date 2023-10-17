import { createOptimizedPicture } from '../../scripts/lib-franklin.js';
import getAuthors from '../../scripts/authors.js';

function getLang() {
  return document.querySelector('html').getAttribute('lang');
}

function getMetaContent(metadataName) {
  return document.querySelector(`meta[name="${metadataName}"]`).getAttribute('content');
}

export default async function decorate(block) {
  const date = new Date(getMetaContent('publishdate'));
  const locale = getLang();
  const printableDate = date.toLocaleDateString(
    locale,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).toUpperCase();

  let authorHTML = '';
  const authors = await getAuthors();
  const defaultAuthor = { name: 'Cognizant Netcentric', role: '', image: '/icons/nc.svg' };

  authors.forEach((authorInfo) => {
    if (!authorInfo.role || !authorInfo.image) {
      // eslint-disable-next-line no-param-reassign
      authorInfo = { ...defaultAuthor };
    }

    const authorImageAlt = `Picture of ${authorInfo.name}`;
    let authorImageHTML = '';

    if (authorInfo.image) {
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
        ${authorImageHTML || `<img src="${defaultAuthor.image}" alt="Author Image">`}
      </div>
      <div class="info">
        <p class="name">${authorInfo.name}</p>
        <p class="role">${authorInfo.role}</p>
      </div>
    </div>
    `;
  });

  const pageURL = window.location.href;
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
