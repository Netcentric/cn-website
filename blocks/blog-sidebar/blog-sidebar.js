export function buildBlogSidebar(main) {
  const blogpost = main.querySelector('.blogpost > main > div:nth-child(2)');
  if (blogpost === null) {
    return;
  }

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

  // TODO cache and share with related-blogs?
  const response = await fetch('/profile-blog.json');
  const json = await response.json();
  if (!response.ok) {
    console.log('error loading profile blog', response);
    return;
  }

  const authorInfo = json.data.find((element) => element.Name === authors);
  console.log('author info', authorInfo);

  // TODO remove afterwards, this is just for testing
  authorInfo.Image = 'http://localhost:3000/insights/2022/09/media_1935b3dcc6abaebc63bbfd19146145c6b67c0e6b4.jpeg?width=2000&format=webply&optimize=medium';

  block.innerHTML = `
<div class="authorprofile">
  <img src="${authorInfo.Image}" alt="Picture of the author" /><!-- TODO i18n on alt text? -->
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
