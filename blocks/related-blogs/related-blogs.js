import { readBlockConfig, decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { addChevronToButtons } from '../../scripts/scripts.js';
import { createCardsList, getArticles, createPopup } from '../blog-posts/blog-posts.js';

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

function getVariants(variant) {
  const defaultVariant = buildManualRelatedBlogs;
  const variants = {
    auto: buildAutoRelatedBlogs,
    manual: defaultVariant,
  };

  return variants[variant] ?? defaultVariant;
}

export default async function decorate(block) {
  const variant = document.querySelector('body.blogpost') ? 'auto' : 'manual';
  const buildVariant = getVariants(variant);

  await buildVariant(block);

  loadCSS('/blocks/blog-posts/blog-card.css');
  createPopup('.related-blogs');
}
