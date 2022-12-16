import { readBlockConfig, decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { addChevronToButtons } from '../../scripts/scripts.js';
import { createCardsList, getArticles } from '../blog-posts/blog-posts.js';

const maxArticlesToShow = 3;

function buildHeadline(parent, tagConf) {
  const head4 = document.createElement('h4');
  const text4head = document.createTextNode(`${window.placeholders?.default?.more || 'More'} ${tagConf}`);
  head4.appendChild(text4head);
  parent.appendChild(head4);
}

function buildCTASection(parent) {
  const buttonRow = document.createElement('div');
  buttonRow.classList.add('related-button-row');
  buttonRow.innerHTML = `<a href="/insights" class="button secondary">${window.placeholders?.default?.blogOverview || 'Blog Overview'}</a>`;
  addChevronToButtons(buttonRow);
  decorateIcons(buttonRow);
  parent.append(buttonRow);
}

async function buildAutoRelatedBlogs(block) {
  // get the tag to be fetched
  const { tag } = readBlockConfig(block);

  block.innerHTML = ''; // reset

  // create container
  const outerDiv = document.createElement('div');
  outerDiv.classList.add('related-container');

  // headline
  buildHeadline(outerDiv, tag);

  // list of cards
  const relatedArticles = await getArticles((item) => item.tags.includes(tag), maxArticlesToShow);
  createCardsList(outerDiv, relatedArticles);

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

  const relatedArticles = await getArticles(
    (item) => configuredPaths.includes(item.path),
    maxArticlesToShow,
  );
  createCardsList(outerDiv, relatedArticles);

  block.append(outerDiv);
  buildCTASection(block);
}

export default async function decorate(block) {
  loadCSS('/blocks/blog-posts/blog-card.css');
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
