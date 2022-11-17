import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
    //get the tag to be fetched
    const tagConf = getConfiguredTag(readBlockConfig(block));

    console.debug(tagConf);
    
    block.innerHTML = '';
    const response = await fetch('/insights/query-index.json');
    const json = await response.json();
    //console.debug(json);
}

function getRelatedArticles() {

}

function getConfiguredTag(config) {
    //should we have a default if no tag configured?
    return config.tags;
}
//http://localhost:3000/insights/2022/09/take-your-cx-strategy