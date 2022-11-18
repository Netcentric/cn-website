import { readBlockConfig } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
    //get the tag to be fetched
    const tagConf = getConfiguredTag(readBlockConfig(block));

    //console.debug(tagConf);

    block.innerHTML = ''; //reset
    const response = await fetch('/insights/query-index.json');
    const json = await response.json();
    //console.debug(json);

    const outerDiv = document.createElement('div');
    outerDiv.classList.add('related-container');

    //headline
    const head4 = document.createElement('h4');
    const text4head = document.createTextNode('More ' + tagConf);
    head4.appendChild(text4head);
    outerDiv.appendChild(head4);

    outerDiv.appendChild(getRelatedArticles(tagConf));
    block.append(outerDiv);

    const ovr = document.createElement('div');
    ovr.classList.add('btn--light-teal');
    ovr.classList.add('btn--solid');
    ovr.classList.add('related-button-row');
    const ovr_link = document.createElement('a');
    ovr_link.classList.add('btn');
    ovr_link.innerHTML=`BLOG OVERVIEW &nbsp; <i class="icons icon-wrapper ">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 465 1024"><path d="M465.455 525.838L76.738 1020.226.001 966.133l319.528-455.391L.001 54.093 76.738 0l388.717 491.872z"></path></svg>
    </i>`;
    ovr.appendChild(ovr_link);
    block.append(ovr);
}

function getRelatedArticles(tag) {

    const blogList = document.createElement('ul');
    blogList.classList.add('related-list');

    for (let i = 0; i < 3; i++) {
        let blogListItem = document.createElement('li');
        blogListItem.classList.add('related-list-item');
        let ttr = document.createElement('div');
        ttr.classList.add('teasertopicrelated');
        blogListItem.append(ttr);
        let article = document.createElement('article');
        article.classList.add('teaser-base');

        article.innerHTML = `<div class="teaser">

    <a href="/insights/2022/08/agile-in-practice.html" target="_self" class="teaser-link">
        <div class="teaser-container">
            <div>
                <h2 class="teaser-description">
                    Agile in practice: embracing autonomy and experimentation
                </h2>
            </div>
            
        </div>
    </a>
    <div class="authorprofile">
            <div class="authorprofile-container">
                <div class="authorprofile-image">
                    <div class="nc-image-base">
                        <div class="nc-image-container " itemscope="" itemtype="http://schema.org/ImageObject">
                            <img class="nc-image" src="https://main--netcentric--hlxsites.hlx.page/media_1f768e1c788626d4622c7d4b7e701f46f01be17ee.jpeg#width=512&height=512" itemprop="contentUrl" alt="" sizes="10vw">
                        </div>
                    </div>
                </div>
                <div class="authorprofile-info">
                    <div class="authorprofile-name">Stefan Franck</div>
                    <div class="authorprofile-position">Senior Director</div>
                </div>
            </div>
    </div>

</div>`;

        ttr.appendChild(article);
        blogList.appendChild(blogListItem);
    }

    return blogList;
}

function getConfiguredTag(config) {
    //should we have a default if no tag is configured?
    return config.tag;
}
//http://localhost:3000/insights/2022/09/take-your-cx-strategy
