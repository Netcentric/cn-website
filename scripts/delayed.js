/* eslint-disable import/no-cycle */
import { sampleRUM } from './lib-franklin.js';
import decorateTwitterFeed from './modules/twitterFeed.js';
import decorateEmbed from './modules/embed.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
const main = document.querySelector('main');
decorateTwitterFeed(main);
decorateEmbed();
