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

// helper to wrap links
function wrapWithLink(document, tag, url) {
  const link = document.createElement('a');
  link.href = url;
  link.appendChild(tag);
  return link;
}

// convert related blog posts based on tags
function transformBlogRelatedPosts(document) {
  // related blogs are based on tags we extract from the heading
  const titleTag = document.querySelector(
    'div.topicrelatedblog h4.topicrelatedblog__title',
  );
  if (titleTag) {
    let title = titleTag.textContent;
    if (title) {
      // eslint-disable-next-line prefer-destructuring
      title = title.split('More ')[1];
    }
    const cells = [['Related Blogs'], ['tag', title]];

    const table = WebImporter.DOMUtils.createTable(cells, document);
    titleTag.replaceWith(table);
  }
}

// convert libraryteaserlist to related articles
function transformLibraryRelatedPosts(document) {
  // related blogs are based on tags we extract from the heading
  const teaserContainer = document.querySelector('.libraryteaserlist');
  if (teaserContainer) {
    const links = document.createElement('div');
    teaserContainer
      .querySelectorAll('.libraryteaserlist__item')
      .forEach((card) => {
        const link = card.querySelector('.teaser__link');
        link.textContent = link.href;
        const br = document.createElement('br');
        links.appendChild(link);
        links.appendChild(br);
      });

    const cells = [['Related Articles'], [links]];
    const table = WebImporter.DOMUtils.createTable(cells, document);

    // add extra section if the original teaser list is hidden
    if (teaserContainer.classList.contains('aem-GridColumn--default--hide')) {
      teaserContainer.parentElement.append(document.createElement('hr'));
      teaserContainer.parentElement.append(table);

      const metaCells = [['Section Metadata'], ['style', 'desktop-hidden']];
      const metaTable = WebImporter.DOMUtils.createTable(metaCells, document);
      teaserContainer.parentElement.append(metaTable);
      teaserContainer.parentElement.append(document.createElement('hr'));
    } else {
      teaserContainer.querySelector('.libraryteaserlist__base').replaceWith(table);
    }
  }
}

// cleanup source code of older blog posts
function transformBlogSourceCode(document) {
  // sample: https://www.netcentric.biz/insights/2015/08/adobe-experience-manager-6-with-a-mongodb-setup.html
  if (document.querySelector('body.articlepage')) {
    document.querySelectorAll('table').forEach((table) => {
      const code = table.querySelector('pre,p,i');
      if (code) {
        if (code.tagName === 'PRE') {
          table.replaceWith(code);
        } else {
          const codeContainer = document.createElement('pre');
          codeContainer.append(code.innerHTML);
          table.replaceWith(codeContainer);
        }
      }
    });
  }
}

// map testimonial blocks
function transformTestimonial(document) {
  let container = document.querySelector('.testimonial');
  if (container) {
    container = container.parentElement;

    const testimonialCards = document.querySelectorAll('.testimonial');
    if (testimonialCards) {
      const cells = [['Cards (testimonial)']];
      testimonialCards.forEach((card) => {
        // capture profile
        const profileName = card.querySelector('.authorprofile__name');
        const profileRole = card.querySelector('.authorprofile__position');

        const imageContainer = document.createElement('div');
        const imgTag = card.querySelector('.authorprofile__image img');
        if (imgTag) {
          imgTag.alt = profileName.textContent;
          imageContainer.append(imgTag);
        }

        // capture text
        const text = card.querySelector('h2.testimonial__title');
        const contentContainer = document.createElement('div');
        contentContainer.appendChild(text);
        contentContainer.appendChild(profileName);
        const roleContainer = document.createElement('em');
        roleContainer.appendChild(profileRole);
        contentContainer.appendChild(roleContainer);

        cells.push([imageContainer, contentContainer]);
        card.remove();
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    }
  }
}

// map office location blocks
function transformOffice(document) {
  let container = document.querySelector('.office');
  if (container) {
    container = container.parentElement;

    const officeCards = document.querySelectorAll('.office');
    if (officeCards) {
      const cells = [['Cards (office)']];
      officeCards.forEach((card) => {
        // capture office details
        const officeDetails = card.querySelector('article.office__container');
        const imageContainer = document.createElement('div');
        const imgTag = officeDetails.querySelector('img');
        if (imgTag) {
          imgTag.alt = officeDetails.querySelector('.office__city').textContent;
          imageContainer.append(imgTag);
        }

        cells.push([imageContainer, officeDetails]);
        card.remove();
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    }
  }
}

// insert section & meta data for blog footer
function insertRelatedBlogsSection(document) {
  document.querySelectorAll('div.topicrelatedblog.container').forEach((e) => {
    e.before(document.createElement('hr'));
    const cells = [['Section Metadata'], ['style', 'dark']];
    const table = WebImporter.DOMUtils.createTable(cells, document);
    e.before(table);
  });
}

// convert accordion components
function transformAccordion(document) {
  document.querySelectorAll('div.accordion').forEach((e) => {
    // TODO collect all in one block
    let name = 'Accordion';
    const style = e.classList
      .item(1)
      .substring(e.classList.item(1).indexOf('accordion--title-') + 17);
    if (style) {
      name = `Accordion (${style})`;
    }
    const cells = [[name]];

    const row = document.createElement('div');
    row.append(e.querySelector('dt .accordion__title'));
    row.append(e.querySelector('dd .accordion__text'));
    cells.push([row]);

    const table = WebImporter.DOMUtils.createTable(cells, document);
    e.replaceWith(table);
  });
}

// convert accordion components
function transformLeaderProfile(document) {
  let container = document.querySelector('.leaderprofile');
  if (container) {
    container = container.parentElement.parentElement;

    const leaderProfiles = document.querySelectorAll('.leaderprofile');
    if (leaderProfiles) {
      const cells = [['Leader Profiles']];
      leaderProfiles.forEach((card) => {
        // capture profile image
        const imageContainer = document.createElement('div');
        const profileImgTag = card.querySelector('article img');
        if (profileImgTag) {
          imageContainer.append(profileImgTag);
        }

        // capture profile name & role
        const name = document.createElement('h4');
        name.textContent = card.querySelector(
          '.leaderprofile__name',
        ).textContent;
        const title = document.createElement('p');
        title.textContent = card.querySelector(
          '.leaderprofile__jobtitle',
        ).textContent;
        const profileContainer = document.createElement('div');
        profileContainer.append(name);
        profileContainer.append(title);

        // capture profile details & social links
        const detailsContainer = document.createElement('div');
        const descriptionTag = card.querySelector(
          '.leaderprofile__lightbox__description',
        );
        if (descriptionTag) {
          detailsContainer.append(
            card.querySelector('.leaderprofile__lightbox__description')
              .textContent,
          );
        }
        const socialContainerTag = card.querySelector(
          '.leaderprofile__socialcontainer',
        );
        if (socialContainerTag) {
          // eslint-disable-next-line no-restricted-syntax
          for (const item of socialContainerTag.children) {
            console.log(item.querySelector('a').href);
            if (item.querySelector('a').href.includes('twitter')) {
              item.querySelector('a').innerHTML = ':twitter:';
            } else if (item.querySelector('a').href.includes('linkedin')) {
              item.querySelector('a').innerHTML = ':linkedin:';
            } else {
              item.querySelector('a').innerHTML = ':social:';
            }
          }
          detailsContainer.append(socialContainerTag);
        }
        cells.push([imageContainer, profileContainer, detailsContainer]);
        card.remove();
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    }
  }
}

// convert "icontextcard"s
function transformIconTextCard(document) {
  let container = document.querySelector('.icontextcard');
  if (container) {
    container = container.parentElement;

    const iconTextCards = document.querySelectorAll('.icontextcard');
    if (iconTextCards) {
      const cells = [['Cards (icon with text)']];
      iconTextCards.forEach((card) => {
        // capture icon
        const imageContainer = document.createElement('div');
        const iconImgTag = card.querySelector('.cmp-teaser__image img');
        if (iconImgTag) {
          iconImgTag.alt = 'icon';
          imageContainer.append(iconImgTag);
        }

        // capture headline & text
        const header = card.querySelector(
          '.icontextcard__content h4',
        );
        const text = card.querySelector(
          '.cmp-teaser__description',
        );
        const contentContainer = document.createElement('div');
        contentContainer.append(header);
        contentContainer.append(text);

        cells.push([imageContainer, contentContainer]);
        card.remove();
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    }
  }
}

// convert "Side By Side" teasers
function transformSideBySideTeasers(document) {
  document.querySelectorAll('.sidebysideteaser').forEach((container) => {
    const teaserEntries = container.querySelectorAll(
      '.sidebysideteaser__teaser > article',
    );
    if (teaserEntries) {
      const cells = [['Cards (Side By Side)']];
      teaserEntries.forEach((card) => {
        // capture headline & text
        const header = card.querySelector('.imagetextandlink__link h2');
        const text = card.querySelector('.imagetextandlink__description');
        const cta = card.querySelector('.imagetextandlink__action');
        const link = card.querySelector('.imagetextandlink__link');
        const contentContainer = document.createElement('div');
        if (header) {
          contentContainer.append(wrapWithLink(document, header, link));
        }
        contentContainer.append(text);
        contentContainer.append(wrapWithLink(document, cta, link));

        // capture image
        const imageContainer = document.createElement('div');
        const img = card.querySelector('.imagetextandlink__image img');
        if (img) {
          img.alt = text.textContent;
          imageContainer.append(img);
        }

        cells.push([imageContainer, contentContainer]);
        card.remove();
      });

      const table = WebImporter.DOMUtils.createTable(cells, document);
      container.replaceWith(table);
    }
  });
}

// convert responsive grid to sections and add styles
function transformSections(document) {
  document.querySelectorAll('.backgroundfull.background').forEach((div) => {
    div.before(document.createElement('hr'));

    const cells = [['Section Metadata']];
    let style = 'white';
    const styles = div.classList;
    styles.forEach((s) => {
      if (s.indexOf('nc-background--') > -1) {
        style = s.substring(s.indexOf('nc-background--') + 15);
        cells.push(['style', style]);
      }
    });
    // we only need a section meta data table for non white colour background
    if (style !== 'white') {
      const table = WebImporter.DOMUtils.createTable(cells, document);
      div.append(table);
      div.append(document.createElement('hr'));
    }
  });
}

// convert embed objects
function transformEmbed(document) {
  document.querySelectorAll('div.embed, div.video').forEach((embed) => {
    // detect embed iframe
    const iframeContent = embed.querySelector('iframe');
    if (iframeContent) {
      embed.replaceWith(iframeContent.src);
    }

    // detect wistia player
    const wistiaPlayer = document.querySelector('.video__wistia');
    if (wistiaPlayer) {
      const wistiaVideoId = JSON.parse(
        wistiaPlayer.getAttribute('data-nc-params-videowistia'),
      ).id;
      embed.replaceWith(`https://netcentric.wistia.com/medias/${wistiaVideoId}`);
    }
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
  preprocess: ({ document }) => {
    document.querySelectorAll('img').forEach((img) => {
      if (img.src && img.src.startsWith('data:')) {
        const json = img.getAttribute('data-nc-params-imagelazy');
        if (json) {
          const params = JSON.parse(json);
          img.src = params.src;
        }
      }
    });
  },

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
    document, url, html, params,
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
    const keywords = document.querySelector('meta[name="keywords"]');
    if (keywords) {
      meta.Tags = keywords.content;
    }

    const img = document.querySelector('[property="og:image"]');
    if (img) {
      const el = document.createElement('img');
      el.src = img.content;

      const alt = document.querySelector(
        '[property="og:image:alt"], [property="twitter:image:alt"]',
      );
      if (alt) {
        el.alt = alt.content;
      }
      meta.Image = el;
    }

    // find blog post authors
    const authors = [];
    document
      .querySelectorAll(
        'body.articlepage .sidebar .authorprofile.authorprofile--medium.sidebar__authorprofile',
      )
      .forEach((author) => {
        authors.push(author.querySelector('.authorprofile__name').textContent);
      });
    if (authors.length > 0) {
      meta.Authors = authors.join();
    }

    // find blog publish date
    const publishDateDiv = document.querySelector(
      'body.articlepage .sidebar .date',
    );
    if (publishDateDiv) {
      const publishDateStr = publishDateDiv.firstElementChild.textContent
        .replace(/\r?\n|\r/g, '')
        .trim();
      const publishDate = new Date(publishDateStr);
      meta.PublishDate = publishDate.toISOString();
    }

    // add blog template
    if (document.querySelector('div.blogfooter')) {
      meta.Template = 'blogpost';
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
      'div.topicrelatedblog ul.topicrelatedblog__list', // related blog list
      'div.sidebar', // sidebar with social share buttons and author
      'div.blogfooter', // blog footer with author, categories, social share buttons
      'a i.icons.icon__wrapper', // remove > icon on buttons, teaser links etc.
      'p.leaderprofile__name i.icons.icon__wrapper', // remove > icon from leader profile
      'div.socialmediabar',
    ]);

    document.body.append(WebImporter.Blocks.getMetadataBlock(document, meta));

    // Convert all blocks
    [
      insertRelatedBlogsSection,
      transformBlogRelatedPosts,
      transformBlogSourceCode,
      transformLibraryRelatedPosts,
      transformAccordion,
      transformLeaderProfile,
      transformIconTextCard,
      transformSideBySideTeasers,
      transformTestimonial,
      transformOffice,
      transformSections,
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
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''),
};
