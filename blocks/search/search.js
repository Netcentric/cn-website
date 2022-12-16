import { TEST_RESULTS, TEST_RESULTS_PLUS } from '../../tools/search/test.js';

function search(term) {
  // TODO: do this query async without the mock results
  const testTerms = {
    test: TEST_RESULTS_PLUS,
    squad: TEST_RESULTS,
  };
  return testTerms[term.toLowerCase()] ?? { results: null };
}

function showResults(results, html = '') {
  let resultsHTML = html;
  results.forEach((result) => {
    const { title, snipped, link } = result;
    resultsHTML += `
      <h3 class="results-title"><a class="results-link" href="${link}">${title}</a></h3>
      <p class="results-snipped">${snipped}</p>
    `;
  });
  return resultsHTML;
}

function getSearchTerm() {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  return params.get('terms');
}

export default function decorate(block) {
  const searchResults = block.children[0];
  const searchTerm = getSearchTerm();
  const hasSearchTerm = searchTerm && searchTerm.trim() !== '';
  const noResultText = searchResults.children[0].innerText;
  let showResultsHTML = `
    <h2 class="results-empty">${noResultText}</h2>
  `;

  searchResults.classList.add('search-results');

  if (hasSearchTerm) {
    const { results } = search(searchTerm);
    if (results) {
      showResultsHTML = showResults(results);
    }
  }

  searchResults.innerHTML = showResultsHTML;
}
