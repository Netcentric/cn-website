import { readBlockConfig, decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { addChevronToButtons } from '../../scripts/scripts.js';
import { createCardsList, getArticles, createPopup } from '../blog-posts/blog-posts.js';

const searchEndpoint = 'https://search.netcentric.biz/search';
const maxArticlesToShow = 3;

function buildHeadline(parent, tagConf) {
  const head4 = document.createElement('h4');
  const text4head = document.createTextNode(`${window.placeholders?.default?.more || 'More'} ${tagConf}`);
  head4.appendChild(text4head);
  parent.appendChild(head4);
}

function buildCTASection(parent, checkBtnLink, count) {
  const buttonRow = document.createElement('div');
  buttonRow.classList.add('related-button-row');
  if (checkBtnLink && count > 1) {
    buttonRow.innerHTML = `<a href="${checkBtnLink}" class="button secondary">${window.placeholders?.default?.blogOverview || 'Blog Overview'}</a>`;
  } else {
    buttonRow.innerHTML = `<a href="/insights/blog" class="button secondary">${window.placeholders?.default?.blogOverview || 'Blog Overview'}</a>`;
  }
  addChevronToButtons(buttonRow);
  decorateIcons(buttonRow);
  parent.append(buttonRow);
}

function reset(block) {
  block.innerHTML = '<div class="related-container"></div>';
  return block.querySelector('.related-container');
}

async function buildAutoRelatedBlogs(block, config) {
  // get the tag to be fetched
  const { tag } = config;

  const container = reset(block);

  // headline
  buildHeadline(container, tag);

  // list of cards
  const relatedArticles = await getArticles((item) => item.tags.includes(tag), maxArticlesToShow);
  createCardsList(container, relatedArticles);

  buildCTASection(block);
}

async function buildManualRelatedBlogs(block) {
  const configuredPaths = [...block.querySelectorAll(':scope > div > div > a')]
    .map((anchor) => new URL(anchor.href).pathname);

  const count = block.querySelectorAll(':scope > div > div').length;
  const blogOverviewBtnRow = block.lastElementChild.children;
  const checkBtnLink = blogOverviewBtnRow[0].innerText;

  const container = reset(block);

  const relatedArticles = await getArticles(
    (item) => configuredPaths.includes(item.path),
    maxArticlesToShow,
  );
  createCardsList(container, relatedArticles);

  block.append(container);
  buildCTASection(block, checkBtnLink, count);
}

async function queryPosts(block, config) {
  const container = reset(block);
  const response = await fetch(config.endpoint || searchEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
      query ($q: String, $l: Int) {search(q: $q, limit: $l) {
          items {
            path
          }
        }
      }
    `,
      variables: {
        l: maxArticlesToShow,
        q: `${config.query}

last visited topics: ${JSON.parse(localStorage.getItem('user.history') || '[]').sort((a, b) => new Date(b.time) - new Date(a.time)).map((tag) => tag.tag).join(', ')}`,
      },
    }),
  });
  const result = await response.json();
  const paths = result.data.search.items.map((item) => item.path);
  const relatedArticles = await getArticles(
    (item) => paths.includes(item.path),
    maxArticlesToShow,
  );
  createCardsList(container, relatedArticles);
}

/**
 * Get a build mode and returns the proper build function
 * @param {object} config
 * @returns {Function}
 */
function getMode(config) {
  if (config.tag) {
    return buildAutoRelatedBlogs;
  }
  if (config.query) {
    return queryPosts;
  }
  return buildManualRelatedBlogs;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const buildVariant = getMode(config);

  await buildVariant(block, config);

  loadCSS('/blocks/blog-posts/blog-card.css');
  createPopup('.related-blogs');
}
