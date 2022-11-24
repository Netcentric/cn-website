import { readBlockConfig, decorateIcons } from "../../scripts/lib-franklin.js";
import { addChevronToButtons } from "../../scripts/scripts.js";

const maxAutoItems = 3;
const defaultAuthorName = 'Cognizant Netcentric';
const defaultAuthorTitle = '';
const defaultAuthorImage = '/icons/nc.svg';

async function enrichProfiles(rArticles) {
  const response = await fetch('/profile-blog.json');
  const json = await response.json();

  Object.values(rArticles).forEach((value) => {
    value.profiles = json.data.find((profile) => profile.Name === value.authors) ?? {};
  });

  return rArticles;
}

async function getRelatedArticles(tag) {
  const blogList = document.createElement('ul');
  blogList.classList.add('related-list');
  const response = await fetch('/insights/query-index.json');
  const json = await response.json();
  const qresult = json.data.filter((obj) => obj.tags.includes(tag)).slice(0, maxAutoItems);

  const enrichedArticles = await enrichProfiles(qresult);

  enrichedArticles.forEach((value) => {
    const blogListItem = document.createElement('li');
    blogListItem.classList.add('related-list-item');
    const ttr = document.createElement('div');
    ttr.classList.add('teasertopicrelated');
    blogListItem.append(ttr);
    const article = document.createElement('article');
    article.classList.add('teaser-base');

    article.innerHTML = `<div class="teaser">

    <a href="${value.path}" target="_self" class="teaser-link">
        <div class="teaser-container">
            <div>
                <h2 class="teaser-description">
                    ${value.title}
                </h2>
            </div>
        </div>
    </a>
    <div class="authorprofile">
            <div class="authorprofile-container">
                <div class="authorprofile-image">
                    <div class="nc-image-base">
                        <div class="nc-image-container " itemscope="" itemtype="http://schema.org/ImageObject">
                            <img class="nc-image" src="${value.profiles.Image ?? defaultAuthorImage}" itemprop="contentUrl" alt="" sizes="10vw">
                        </div>
                    </div>
                </div>
                <div class="authorprofile-info">
                    <div class="authorprofile-name">${value.profiles.Name ?? defaultAuthorName}</div>
                    <div class="authorprofile-position">${value.profiles.Title ?? defaultAuthorTitle}</div>
                </div>
            </div>
    </div>
</div>`;

    ttr.appendChild(article);
    blogList.appendChild(blogListItem);
  });

  return blogList;
}

function createDynamicHeading(tagName) {

}

export default async function decorate(block) {
  // get the tag to be fetched
  const { tag } = readBlockConfig(block);

  block.innerHTML = ""; // reset

  const container = document.createElement("div");
  container.classList.add("related-container");

  // dynamic headline if filtered by tag
  if (tag) {
    const heading = document.createElement("h4");
    heading.textContent = `More ${tag}`;
    container.appendChild(heading);
  }

  // render blog article teaser
  container.appendChild(await getRelatedArticles(tag));
  block.append(container);

  // render blog overview cta button
  const buttonRow = document.createElement("div");
  buttonRow.classList.add("related-button-row");
  const button = document.createElement("a");
  button.classList.add("button");
  button.classList.add("secondary");
  button.href = "/insights";
  button.textContent = "Blog Overview";
  buttonRow.appendChild(button);
  addChevronToButtons(buttonRow);
  decorateIcons(buttonRow);
  block.append(buttonRow);
}
