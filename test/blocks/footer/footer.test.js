/* eslint-disable no-unused-expressions */
/* global describe it */

import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';

document.body.innerHTML = await readFile({ path: '../../scripts/dummy.html' });

const { buildBlock, decorateBlock, loadBlock } = await import('../../../scripts/lib-franklin.js');

document.body.innerHTML = await readFile({ path: '../../scripts/body.html' });

const sleep = async (time = 1000) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

const navMeta = document.createElement('meta');
navMeta.setAttribute('name', 'footer');
navMeta.setAttribute('content', 'https://main--helix-project-boilerplate--adobe.hlx.page/test/blocks/footer/footer');
document.head.append(navMeta);

const footerBlock = buildBlock('footer', [[]]);
document.querySelector('footer').append(footerBlock);
decorateBlock(footerBlock);
await loadBlock(footerBlock);
await sleep();

describe('Footer block', () => {
  it('Displays footer content', async () => {
    const a = document.querySelector('footer a');
    expect(a).to.exist;
    expect(a.href).to.equal('https://www.adobe.com/privacy.html');
  });
});
