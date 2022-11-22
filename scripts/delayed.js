// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import {decorateEmbed, decorateTwitterFeed} from "./scripts.js";

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
const main = document.querySelector('main');
decorateTwitterFeed(main);
decorateEmbed();