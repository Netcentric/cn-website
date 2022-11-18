import { readBlockConfig } from '../../scripts/lib-franklin.js';

function getConfiguredTag(config) {
  // should we have a default if no tag configured?
  return config.tags;
}
export default async function decorate(block) {
  const tagConf = getConfiguredTag(readBlockConfig(block));
  block.innerHTML = tagConf.tag;
  // const response = await fetch('/insights/query-index.json');
  // const json = await response.json();
}
