import { createOptimizedPicture, readBlockConfig } from '../../scripts/lib-franklin.js';

const maxAutoItems = 3;
const defaultAuthorName = 'Cognizant Netcentric';
const defaultAuthorTitle = '';
const defaultAuthorImage = '/icons/nc.svg';

function getConfiguredTag(config) {
  // should we have a default if no tag is configured?
  return config.tag;
}

async function enrichProfiles(rArticles) {
  const response = await fetch('/profile-blog.json');
  const json = await response.json();

  Object.values(rArticles).forEach((value) => {
    value.profiles = json.data.find((profile) => profile.Name === value.authors) ?? {};
  });

  return rArticles;
}

function buildCard(card) {
  const {
    path, title, image, tags, profiles: authorProfile,
  } = card;

  const cardElement = document.createElement('article');
  cardElement.classList.add('teaser');

  if (authorProfile.Image === '') authorProfile.Image = defaultAuthorImage;

  cardElement.innerHTML = `
    <p class="tags">${JSON.parse(tags).join(', ')}</p>
    <a href="${path}" target="_self" class="teaser-link">
      <h2 class="teaser-description">
        ${title}
      </h2>
    </a>
    <div class="authorprofile-container">
      <div class="authorprofile-image">
        <div class="nc-image-base">
            <div class="nc-image-container " itemscope="" itemtype="http://schema.org/ImageObject">
                <img class="nc-image" src="${authorProfile.Image ?? defaultAuthorImage}" itemprop="contentUrl" alt="" sizes="10vw" />
            </div>
        </div>
      </div>
      <div class="authorprofile-info">
          <div class="authorprofile-name">${authorProfile.Name ?? defaultAuthorName}</div>
          <div class="authorprofile-position">${authorProfile.Title ?? defaultAuthorTitle}</div>
      </div>
    </div>`;

  const pictureElement = createOptimizedPicture(image);
  if (image && pictureElement) {
    cardElement.prepend(pictureElement);
  }

  return cardElement;
}

function buildHeadline(parent, tagConf) {
  const head4 = document.createElement('h4');
  const text4head = document.createTextNode(`More ${tagConf}`);
  head4.appendChild(text4head);
  parent.appendChild(head4);
}

async function getRelatedArticles(filter = () => true, maxItems = maxAutoItems) {
  const response = await fetch('/insights/query-index.json');
  const json = await response.json();
  const queryResult = json.data.filter(filter).slice(0, maxItems);

  return enrichProfiles(queryResult);
}

function createCardsRow(parent, cards) {
  const blogList = document.createElement('ul');
  blogList.classList.add('related-list');

  cards.forEach((card) => {
    const blogListItem = document.createElement('li');
    blogListItem.classList.add('related-list-item');

    blogListItem.append(buildCard(card));
    blogList.appendChild(blogListItem);
  });

  parent.appendChild(blogList);
}

function buildCTASection(parent) {
  const ovr = document.createElement('div');
  ovr.classList.add('btn--light-teal', 'btn--solid', 'related-button-row');
  const ovrlink = document.createElement('a');
  ovrlink.href = '/insights';
  ovrlink.classList.add('btn');
  ovrlink.innerHTML = `BLOG OVERVIEW &nbsp; <i class="icons icon-wrapper ">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 465 1024"><path d="M465.455 525.838L76.738 1020.226.001 966.133l319.528-455.391L.001 54.093 76.738 0l388.717 491.872z"></path></svg>
    </i>`;
  ovr.appendChild(ovrlink);
  parent.append(ovr);
}

async function buildAutoRelatedBlogs(block) {
  // get the tag to be fetched
  const tagConf = getConfiguredTag(readBlockConfig(block));

  block.innerHTML = ''; // reset

  // create container
  const outerDiv = document.createElement('div');
  outerDiv.classList.add('related-container');

  // headline
  buildHeadline(outerDiv, tagConf);

  // list of cards
  const relatedArticles = await getRelatedArticles((item) => item.tags.includes(tagConf));
  createCardsRow(outerDiv, relatedArticles);

  block.append(outerDiv);
  buildCTASection(block);
}

async function buildManualRelatedBlogs(block) {
  const configuredPaths = [...block.querySelectorAll(':scope > div > div > a')]
    .map((anchor) => new URL(anchor.href).pathname);

  block.innerHTML = ''; // reset

  // create container
  const outerDiv = document.createElement('div');
  outerDiv.classList.add('related-container');

  const relatedArticles = await getRelatedArticles((item) => configuredPaths.includes(item.path));
  createCardsRow(outerDiv, relatedArticles);

  block.append(outerDiv);
}

export default async function decorate(block) {
  // TODO improve variant handling - is this the final logic? Do we want a tag?
  const variant = document.querySelector('body.blogpost') ? 'auto' : 'manual';

  switch (variant) {
    case 'auto':
      await buildAutoRelatedBlogs(block);
      break;
    case 'manual':
    default:
      await buildManualRelatedBlogs(block);
  }
}
