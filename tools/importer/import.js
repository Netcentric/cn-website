/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

function transformRelatedBlogPosts(document) {
  // This is a teaser component, but easier to edit as dedicated block
  document
    .querySelectorAll('.topicrelatedblog__list')
    .forEach((relatedBlogPosts) => {
      const cells = [['Related Blogs']];

      const blogLinks = [];
      for (let i = 0; i < relatedBlogPosts.childElementCount; i++) {
        const href =
          relatedBlogPosts.children[i].querySelector('.teaser__link').href;
        const a = document.createElement('a');
        a.href = href;
        a.innerHTML = href;
        blogLinks.push(a);
      }
      cells.push([blogLinks]);

      const table = WebImporter.DOMUtils.createTable(cells, document);
      relatedBlogPosts.replaceWith(table);
    });
}

// convert embed objects
function transformEmbed(document) {
  document.querySelectorAll('div.embed, div.video').forEach((embed) => {
    const cells = [[`Embed`]];

    // detect embed iframe
    const iframeContent = embed.querySelector('iframe');
    if (iframeContent) {
      cells.push([iframeContent.src]);
    }

    const table = WebImporter.DOMUtils.createTable(cells, document);
    embed.replaceWith(table);
  });
}

// Transform all image urls
function makeProxySrcs(document) {
  const host = 'https://www.netcentric.biz/';
  document.querySelectorAll('img').forEach((img) => {
    if (img.src.startsWith('/')) {
      // make absolute
      const cu = new URL(host);
      img.src = `${cu.origin}${img.src}`;
    }
    try {
      const u = new URL(img.src);
      u.searchParams.append('host', u.origin);
      img.src = `http://localhost:3001${u.pathname}${u.search}`;
    } catch (error) {
      console.warn(`Unable to make proxy src for ${img.src}: ${error.message}`);
    }
  });
}

function makeAbsoluteLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('/')) {
      const ori = a.href;
      const u = new URL(a.href, 'https://main--netcentric--hlxsites.hlx.page/');

      // Remove .html extension
      if (u.pathname.endsWith('.html')) {
        u.pathname = u.pathname.slice(0, -5);
      }

      a.href = u.toString();

      if (a.textContent === ori) {
        a.textContent = a.href;
      }
    }
  });
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document,
    url,
    html,
    params,
  }) => {
    const meta = {};

    // find the <title> element
    const title = document.querySelector('title');
    if (title) {
      meta.Title = title.innerHTML
        .replace(/[\n\t]/gm, '')
        .split('|')[0]
        .trim();
    }

    // find the <meta property="og:description"> element
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      meta.Description = desc.content;
    }

    // find the <meta property="keywords"> element
    const categories = document.querySelector('meta[name="keywords"]');
    if (categories) {
      meta.Categories = categories.content;
    }

    // find doc authors
    const authors = [];
    document
      .querySelectorAll(
        '.authorprofile.authorprofile--medium.sidebar__authorprofile',
      )
      .forEach((author) => {
        authors.push(author.querySelector('.authorprofile__name').textContent);
      });
    if (authors.length > 0) {
      meta.Authors = authors.join();
    }

    // use helper method to remove header, footer, etc.
    WebImporter.DOMUtils.remove(document.body, [
      'div.header', // entire header XF
      'div.footer', // entire footer XF
      'a.skip-nav-link', // skip main navigation link
      '#onetrust-consent-sdk',
      'hr.line__base line__base--', // styling HR above the title
      'div.scroll-indicator__container',
      'div.topicrelatedblog__btn-row',
      'div.sidebar', // sidebar with social share buttons and author
      'div.blogfooter', // blog footer with author, categories, social share buttons
    ]);

    document.body.append(WebImporter.Blocks.getMetadataBlock(document, meta));

    // Convert all blocks
    [
      transformRelatedBlogPosts,
      transformEmbed,
      makeProxySrcs,
      makeAbsoluteLinks,
    ].forEach((f) => f.call(null, document));

    return document.body;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  // eslint-disable-next-line no-unused-vars
  generateDocumentPath: ({ document, url, html, params }) =>
    new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
};
