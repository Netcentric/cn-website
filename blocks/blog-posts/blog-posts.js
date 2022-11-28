import {
  createOptimizedPicture, loadCSS,
  readBlockConfig,
  toClassName,
} from '../../scripts/lib-franklin.js';

const defaultAuthorName = 'Cognizant Netcentric';
const defaultAuthorTitle = '';
const defaultAuthorImage = '/icons/nc.svg';

export function buildCard(card, large = false) {
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

  // Width based on max-width set in css
  const breakpoints = [{ width: large ? '1000' : '450' }];
  const pictureElement = createOptimizedPicture(image, `Image symbolising ${title}`, false, breakpoints);
  if (image && pictureElement) {
    cardElement.prepend(pictureElement);
  }

  return cardElement;
}

export function createCardsList(parent, cards) {
  const blogList = document.createElement('ul');
  blogList.classList.add('related-list', 'blog-cards-container');

  cards.forEach((card, index) => {
    const blogListItem = document.createElement('li');
    blogListItem.classList.add('related-list-item');

    const largeCard = index === 0;

    blogListItem.append(buildCard(card, largeCard));
    blogList.appendChild(blogListItem);
  });

  parent.appendChild(blogList);
}

export async function joinArticlesWithProfiles(articles) {
  const response = await fetch('/profile-blog.json');
  const json = await response.json();

  Object.values(articles).forEach((value) => {
    value.profiles = json.data.find((profile) => profile.Name === value.authors) ?? {};
  });

  return articles;
}

export async function getArticles(filter = () => true, maxItems = 7, offset = 0) {
  const response = await fetch('/insights/query-index.json');
  const json = await response.json();
  const queryResult = json.data
    .filter(filter)
    .slice(offset, offset + maxItems);

  return joinArticlesWithProfiles(queryResult);
}

function createCategoryDropdown(options, parent) {
  const input = document.createElement('select');
  options.forEach((option) => {
    const optionTag = document.createElement('option');
    optionTag.innerText = option;
    optionTag.value = toClassName(option);
    input.append(optionTag);
  });
  parent.append(input);
}

export default async function decorate(block) {
  loadCSS('/blocks/blog-posts/blog-card.css');

  const config = readBlockConfig(block);

  const categories = config.categories.split(', ');

  const selectedCategory = 'All Categories';

  const filter = selectedCategory === 'All Categories'
    // TODO: Only articles with tags can show up now because there are some items that arent
    //  articles without tags
    ? (article) => JSON.parse(article.tags).length > 0
    : (article) => article.tags.includes(selectedCategory);

  const articles = await getArticles(filter);

  block.innerHTML = '';

  createCategoryDropdown(categories, block);

  createCardsList(block, articles);
}
