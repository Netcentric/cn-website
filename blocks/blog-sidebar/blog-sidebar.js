import { toClassName } from '../../scripts/lib-franklin.js';

export function buildBlogSidebar(main) {
  const blogpost = main.querySelector('.blogpost > main > div:nth-child(2)');
  if (blogpost === null) {
    return;
  }

  console.log('blogpost:', blogpost);
  const sidebar = document.createElement('div');
  sidebar.classList.add('blog-sidebar');
  blogpost.prepend(sidebar);
}

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

  const sanitizedAuthorName = toClassName(authors);
  // TODO handle 404
  const authorImageHtml = await fetch(`/profiles/${sanitizedAuthorName}.plain.html`)
    .then((response) => response.text())
    .then((text) => {
      const parser = new DOMParser();
      const parsedHtml = parser.parseFromString(text, 'text/html');
      console.log('to be parsed:', text, parsedHtml);
      return parsedHtml.querySelector('picture');
    });
  console.log('author html:', authorImageHtml);

  // TODO cache and share with related-blogs?
  const response = await fetch('/profile-blog.json');
  const json = await response.json();
  if (!response.ok) {
    console.log('error loading profile blog', response);
    return;
  }

  const authorInfo = json.data.find((element) => element.Name === authors);

  block.innerHTML = `
<div class="authorprofile">
  <div class="image">
    ${authorImageHtml.outerHTML}  
  </div>
  <div class="info">
    <p class="name" >${authorInfo.Name}</p>
    <p class="role">${authorInfo.Title}</p>
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
