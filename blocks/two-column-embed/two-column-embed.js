/**
 * Creates an iframe embed HTML
 * Note: Aspect ratio is controlled by CSS classes on the block element
 * @param {URL} url - The URL to embed
 * @returns {string} - The iframe HTML
 */
const createIframeEmbed = (url) => `<div class="two-column-embed-iframe-wrapper">
  <iframe src="${url.href}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute; overflow: visible;"
    allowfullscreen="" scrolling="yes" allow="encrypted-media" title="Content from ${url.hostname}" loading="lazy">
  </iframe>
</div>`;

/**
 * Loads the iframe embed into the target column
 * @param {HTMLElement} column - The column element to contain the iframe
 * @param {string} link - The URL to embed
 */
const loadEmbed = (column, link) => {
  if (column.classList.contains('embed-loaded')) {
    return;
  }

  const url = new URL(link);
  column.innerHTML = createIframeEmbed(url);
  column.classList.add('embed-loaded', 'two-column-embed-iframe');
};

/**
 * Decorates the two-column-embed block
 * @param {HTMLElement} block - The block element
 */
export default function decorate(block) {
  const cols = [...block.firstElementChild.children];

  if (cols.length !== 2) {
    // eslint-disable-next-line no-console
    console.warn('two-column-embed block requires exactly 2 columns');
    return;
  }

  // Find which column has a link (URL) - that becomes the embed column
  let embedColumn = null;
  let embedLink = null;
  let contentColumn = null;

  cols.forEach((col) => {
    const link = col.querySelector('a');
    if (link && link.href && !embedColumn) {
      // Check if it's a standalone link (likely for embed)
      const linkText = link.textContent.trim();
      const linkHref = link.href;
      if (linkText === linkHref || linkText.includes('http')) {
        embedColumn = col;
        embedLink = link.href;
      }
    }
  });

  // If we found an embed column, mark the other as content
  if (embedColumn) {
    contentColumn = cols.find((col) => col !== embedColumn);
    contentColumn.classList.add('two-column-embed-content');

    // Clear the embed column and lazy load the iframe
    embedColumn.textContent = '';

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        loadEmbed(embedColumn, embedLink);
      }
    });
    observer.observe(embedColumn);
  } else {
    // No embed link found, treat both as content columns
    cols.forEach((col) => col.classList.add('two-column-embed-content'));
  }
}
