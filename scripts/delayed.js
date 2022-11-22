/* eslint-disable import/no-cycle */
import { sampleRUM } from './lib-franklin.js';
import {
  decorateEmbed,
  decorateTwitterFeed,
} from './scripts.js';
import { ScrollIndicator } from "./blogScrollIndicator.js";


// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
const main = document.querySelector('main');
decorateTwitterFeed(main);
decorateEmbed();

if(document.body.classList.contains('blogpost')) {
  const scrollIndicator = new ScrollIndicator();

  scrollIndicator.init();
}
