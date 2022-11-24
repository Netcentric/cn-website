import { readBlockConfig } from '../../scripts/lib-franklin.js';

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

export default async function decorate(block) {
  // get the tag to be fetched
  const tagConf = getConfiguredTag(readBlockConfig(block));

  block.innerHTML = ''; // reset

  const outerDiv = document.createElement('div');
  outerDiv.classList.add('related-container');

  // headline
  const head4 = document.createElement('h4');
  const text4head = document.createTextNode(`More ${tagConf}`);
  head4.appendChild(text4head);
  outerDiv.appendChild(head4);

  outerDiv.appendChild(await getRelatedArticles(tagConf));
  block.append(outerDiv);

  const ovr = document.createElement('div');
  ovr.classList.add('btn--light-teal');
  ovr.classList.add('btn--solid');
  ovr.classList.add('related-button-row');
  const ovrlink = document.createElement('a');
  ovrlink.href = '/insights';
  ovrlink.classList.add('btn');
  ovrlink.innerHTML = `BLOG OVERVIEW &nbsp; <i class="icons icon-wrapper ">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 465 1024"><path d="M465.455 525.838L76.738 1020.226.001 966.133l319.528-455.391L.001 54.093 76.738 0l388.717 491.872z"></path></svg>
    </i>`;
  ovr.appendChild(ovrlink);
  block.append(ovr);
}
