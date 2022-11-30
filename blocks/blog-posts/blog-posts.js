import {
  createOptimizedPicture, decorateIcons, loadCSS,
  readBlockConfig, toClassName,
} from '../../scripts/lib-franklin.js';

const defaultAuthorName = 'Cognizant Netcentric';
const defaultAuthorRole = '';
const defaultAuthorImage = '/icons/nc.svg';

export function buildCard(card, large = false) {
  const {
    path, title, image, tags = '[]', profiles: authorProfile,
  } = card;

  const cardElement = document.createElement('article');
  cardElement.classList.add('teaser');

  if (authorProfile.image === '') authorProfile.image = defaultAuthorImage;

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
            <div class="nc-image-container" itemscope="" itemtype="http://schema.org/ImageObject">
                <img class="nc-image" src="${authorProfile.image ?? defaultAuthorImage}" itemprop="contentUrl" alt="" sizes="10vw" />
            </div>
        </div>
      </div>
      <div class="authorprofile-info">
          <div class="authorprofile-name">${authorProfile.name ?? defaultAuthorName}</div>
          <div class="authorprofile-position">${authorProfile.role ?? defaultAuthorRole}</div>
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

function addCardsToCardList(cards, cardList) {
  cards.forEach((card, index) => {
    const blogListItem = document.createElement('li');
    blogListItem.classList.add('related-list-item');

    const largeCard = index === 0;

    blogListItem.append(buildCard(card, largeCard));
    cardList.appendChild(blogListItem);
  });
}

export function createCardsList(parent, cards = []) {
  const blogList = document.createElement('ul');
  blogList.classList.add('related-list', 'blog-cards-container');

  addCardsToCardList(cards, blogList);

  parent.appendChild(blogList);
}

export async function joinArticlesWithProfiles(articles) {
  const response = await fetch('/profiles/query-index.json');
  const json = await response.json();

  Object.values(articles).forEach((value) => {
    value.profiles = json.data.find((profile) => profile.name === value.authors) ?? {};
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

function buildCTASection(parent, callback) {
  const buttonRow = document.createElement('div');
  buttonRow.classList.add('related-button-row');
  buttonRow.innerHTML = '<button id="load-more-button" class="button secondary">Show More</button>';
  decorateIcons(buttonRow);
  parent.append(buttonRow);
  parent.querySelector('#load-more-button').addEventListener('click', callback);
}

let articleOffset = 0;
let selectedCategory = toClassName(new URLSearchParams(window.location.search).get('tag_filter')) || 'all-categories';

function getCardFilter() {
  return selectedCategory === 'all-categories'
    // TODO: Only articles with tags can show up now because there are some items that arent
    //  articles without tags
    ? (article) => JSON.parse(article.tags).length > 0
    : (article) => JSON.parse(article.tags)
      .map((tag) => toClassName(tag)).includes(selectedCategory);
}

async function loadMoreArticles(numArticles = 6) {
  const filter = getCardFilter();
  const articles = await getArticles(filter, numArticles, articleOffset);
  articleOffset += numArticles;

  const blogList = document.querySelector('.blog-posts ul');

  addCardsToCardList(articles, blogList);
}

async function updateFilter(newFilter) {
  selectedCategory = newFilter;

  // Reset all loaded articles
  articleOffset = 0;
  document.querySelector('ul.related-list').innerHTML = '';
  await loadMoreArticles(7);
}

function createCategoryDropdown(options, parent, callback) {
  const input = document.createElement('select');

  options.forEach((option) => {
    const optionTag = document.createElement('option');
    optionTag.innerText = option;
    optionTag.value = toClassName(option);
    input.append(optionTag);
  });

  const initialIndex = options.map((option) => toClassName(option)).indexOf(selectedCategory);
  if (initialIndex >= 0) {
    input.selectedIndex = initialIndex;
  }

  parent.append(input);
  input.addEventListener('change', callback);
}

export default async function decorate(block) {
  loadCSS('/blocks/blog-posts/blog-card.css');

  const config = readBlockConfig(block);

  const categories = config.categories.split(', ');

  block.innerHTML = '';

  createCategoryDropdown(categories, block, (e) => {
    updateFilter(e.target.value);
  });

  createCardsList(block);

  await loadMoreArticles(7);

  buildCTASection(block, () => {
    loadMoreArticles();
  });
}
