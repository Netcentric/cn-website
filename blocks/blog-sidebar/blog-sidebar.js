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
  const authors = getMetaContent('authors');
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

  const authorInfo = json.data.find((element) => element.name === authors);

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

  block.innerHTML = `
<div class="authorprofile">
  <div class="image">
    ${authorImageHTML}
  </div>
  <div class="info">
    <p class="name" >${authorInfo?.name ?? defaultAuthorName}</p>
    <p class="role">${authorInfo?.role ?? defaultAuthorRole}</p>
  </div>
</div>
<div class="date">${printableDate}</div>
<div class="share">
  <p>SHARE</p>
  <div>
    <span class="icon icon-facebook"></span>
    <span class="icon icon-twitter"></span>
    <span class="icon icon-linkedin"></span>    
    <span class="icon icon-email"></span>
  </div>
</div>
  `;
}
