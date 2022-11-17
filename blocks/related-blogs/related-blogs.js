import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

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
    ovr_link.innerHTML=`BLOG OVERVIEW &nbsp; <i class="icons icon__wrapper ">
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
        blogListItem.classList.add('related-list_item');
        let ttr = document.createElement('div');
        ttr.classList.add('teasertopicrelated');
        blogListItem.append(ttr);
        let article = document.createElement('article');
        article.classList.add('teaser_base');

        article.innerHTML = `<div class="teaser">

    <a href="/insights/2022/08/agile-in-practice.html" target="_self" class="teaser__link">
        <div class="teaser__container">
            <div class="teaser__content">
                <header class="teaser__header">
                    <h2 class="teaser__description">
                        Agile in practice: embracing autonomy and experimentation
                    </h2>

                </header>
            </div>
        </div>
    </a>
    <div class="authorprofile authorprofile--small teaser__authorprofile">
        <div>
            <div class="authorprofile__base">
                <div class="authorprofile__image">
                    <div class="nc-image__base">
                        <div class="nc-image__container " itemscope="" itemtype="http://schema.org/ImageObject">
                            <img class="nc-image" src="https://main--netcentric--hlxsites.hlx.page/media_174d6621a512d354f5c07b1a535f830dbe628949c.jpeg#width=1200&height=1200" itemprop="contentUrl" alt="" sizes="10vw">
                        </div>
                    </div>
                </div>
                <div class="authorprofile__info">
                    <p class="authorprofile__name">Stefan Franck</p>
                    <p class="authorprofile__position">Senior Director</p>
                    <!--<p class="authorprofile__description">One Netcentric’s co-founders, Stefan is an expert in shaping solutions for clients - from requirements analysis to project specification and more. Stefan sees himself as the link between business and technology and, for over ten years now, he has filled various roles as architect, project lead and lead consultant. Stefan's focus is on the Adobe Marketing Cloud and AEM, to which he is strongly connected from his days at Day Software and Adobe. He says that co-founding Netcentric was one of the best choices in his professional life. Never before been able to work with so many brilliant people.</p>-->
                    <!--
                    <ul class="authorprofile__socialnetworks">
                        <li class="authorprofile__socialnetwork">
                            <i class="icons icon__wrapper ">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g data-name="Capa 2"><path d="M16 0a16 16 0 1016 16A16 16 0 0016 0zm-3.33 23.23H9.82v-9.87h2.85zm-1.43-10.91a1.75 1.75 0 01-1.73-1.75 1.77 1.77 0 011.73-1.79A1.79 1.79 0 0113 10.56a1.77 1.77 0 01-1.76 1.76zm11.25 10.91h-2.81v-6a1 1 0 00-.48-.81c-1.12-.64-2.29.5-2.29.5v6.33h-2.86v-9.89h2.85v.48a4.22 4.22 0 013.67.1 3.94 3.94 0 011.92 3.29z" data-name="Capa 1"></path></g></svg>
                            </i>
                        </li>
                    </ul>
                    -->
                </div>
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