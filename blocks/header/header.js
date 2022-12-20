import { readBlockConfig, decorateIcons } from '../../scripts/lib-franklin.js';
import { addChevronToButtons } from '../../scripts/scripts.js';

const mobileBreakpoint = 992;
let globalWindowWidth = window.innerWidth;

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */
function collapseAllNavSections(sections) {
  sections.querySelectorAll(':scope .nav-drop').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Attaches event listeners for nav submenus on desktop
 * @private
 */
function addEventListenersDesktop() {
  const block = document.querySelector('.block.header');
  // all nav open
  block.querySelectorAll('.nav-sections ul > .nav-drop > a').forEach((navAnchor) => {
    navAnchor.addEventListener('mouseenter', () => {
      collapseAllNavSections(navAnchor.closest('ul'));
      navAnchor.parentElement.setAttribute('aria-expanded', 'true');
    });
  });

  // close sub-level navs if hover over a new anchor (even if no sub menu at that anchor)
  block.querySelectorAll('.nav-sections ul > :not(.nav-drop) > a').forEach((navAnchor) => {
    navAnchor.addEventListener('mouseenter', () => {
      collapseAllNavSections(navAnchor.closest('ul'));
    });
  });

  // top-level nav close
  block.querySelector('.nav-sections').addEventListener('mouseleave', () => {
    collapseAllNavSections(block.querySelector('.nav-sections'));
  });

  block.querySelectorAll('.nav-overlay').forEach((overlay) => {
    overlay.addEventListener('click', () => {
      collapseAllNavSections(overlay.closest('.nav-sections'));
    });
  });
}

/**
 * Attaches event listeners for nav submenus on mobile
 * @private
 */
function addEventListenersMobile() {
  const block = document.querySelector('.block.header');
  block.querySelectorAll('span.icon.open-menu-arrow').forEach((expansionArrow) => {
    expansionArrow.addEventListener('click', () => {
      const section = expansionArrow.parentElement;
      section.setAttribute('aria-expanded', 'true');
    });
  });
  block.querySelectorAll('span.icon.close-menu-arrow').forEach((expansionArrow) => {
    expansionArrow.addEventListener('click', () => {
      const section = expansionArrow.closest('li[aria-expanded="true"]');
      section.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Handles re-attaching event listeners after a window resize
 * @private
 */
function reAttachEventListeners() {
  if (window.innerWidth < mobileBreakpoint) {
    addEventListenersMobile();
  } else {
    addEventListenersDesktop();
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch nav content
  // const navPath = cfg.nav || '/nav';
  const navPath = cfg.nav || '/drafts/jlledo/nav'; // FIXME: don't merge this line
  const resp = await fetch(`${navPath}.plain.html`);
  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.innerHTML = html;

    const classes = ['brand', 'sections', 'search', 'tools'];
    classes.forEach((e, j) => {
      const section = nav.children[j];
      if (section) section.classList.add(`nav-${e}`);
    });

    const navSections = [...nav.children][1];
    const navSearch = [...nav.children][2];

    // Set up sub menu classes and elements
    navSections.querySelectorAll(':scope ul > li').forEach((section) => {
      const subSection = section.querySelector(':scope > ul');
      if (subSection) {
        // Add icon to open sub-section
        const openArrow = document.createElement('span');
        openArrow.classList.add('icon', 'icon-chevron-right', 'open-menu-arrow');
        section.append(openArrow);
        section.classList.add('nav-drop');

        // Add wrapper div to center dropdown items on screen
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('nav-drop-ul-wrapper');
        wrapperDiv.append(subSection);
        section.insertBefore(wrapperDiv, openArrow);

        // Add icon/text to close sub-section
        const sectionBack = section.querySelector('a')?.outerHTML ?? '<span>Back</span>';
        const backLi = document.createElement('li');
        const closeArrow = document.createElement('span');
        closeArrow.classList.add('icon', 'icon-chevron-right', 'close-menu-arrow');
        backLi.innerHTML = sectionBack;
        backLi.classList.add('back-button');
        backLi.prepend(closeArrow.cloneNode());
        subSection.prepend(backLi);
      }
    });

    // add classes to li containing sub-menu image
    navSections.querySelectorAll('.nav-drop-ul-wrapper > ul > li > picture').forEach((picture) => {
      picture.parentElement.classList.add('nav-picture');
    });

    // Set up background overlay for open menu
    navSections.querySelectorAll(':scope > ul > li.nav-drop').forEach((dropSection) => {
      const overlay = document.createElement('div');
      overlay.classList.add('nav-overlay');
      dropSection.append(overlay);
    });

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
    hamburger.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      document.body.style.overflowY = expanded ? '' : 'hidden';
      nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    block.append(nav);

    // Add icons to buttons
    addChevronToButtons(nav, '.nav-tools li:last-child a');
    decorateIcons(nav);

    // Add search form
    const searchIcon = navSearch.children[0].children[0].children[0];
    const placeholder = 'search';
    const searchForm = document.createElement('form');
    searchForm.classList.add('search-form');
    searchForm.setAttribute('action', '/drafts/jlledo/search'); // FIXME: don't merge this line
    navSearch.replaceChild(searchForm, navSearch.children[0]);
    const searchElement = [...navSearch.children][0];
    searchElement.innerHTML = `
      <input type="text" class="search-input" id="search" value="" placeholder="${placeholder}" />
      <button type="submit" class="search-submit"></button>
    `;
    const button = searchElement.children[1];
    button.appendChild(searchIcon);
    searchElement.addEventListener('submit', (e) => {
      e.preventDefault();
      const { value } = e.target[0];
      const url = new URL(e.target.action);
      const params = new URLSearchParams(url.search);
      params.set('terms', value);
      url.search = params;
      window.open(url.href, '_self');
    });

    // mobile language selector
    const langToggleButton = document.createElement('button');
    langToggleButton.classList.add('lang-toggle');
    nav.querySelector('.nav-tools').append(langToggleButton);
    langToggleButton.addEventListener('click', () => {
      const expanded = langToggleButton.closest('.nav-tools').getAttribute('aria-expanded') === 'true';
      langToggleButton.closest('.nav-tools').setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });

    // Handle different event listeners for mobile/desktop on window resize
    const removeAllEventListeners = (element) => {
      element.replaceWith(element.cloneNode(true));
    };

    const shouldResize = () => {
      const resize = (window.innerWidth > mobileBreakpoint && globalWindowWidth <= mobileBreakpoint)
        || (window.innerWidth < mobileBreakpoint && globalWindowWidth >= mobileBreakpoint);
      globalWindowWidth = window.innerWidth;
      return resize;
    };

    window.addEventListener('resize', () => {
      if (shouldResize()) {
        nav.setAttribute('aria-expanded', 'false');
        removeAllEventListeners(document.querySelector('nav .nav-sections'));
        collapseAllNavSections(block);
        reAttachEventListeners();
      }
    });

    reAttachEventListeners();
  }
}
