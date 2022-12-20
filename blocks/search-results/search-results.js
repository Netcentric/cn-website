import {TEST_RESULTS, TEST_RESULTS_PLUS} from '../../tools/search/test.js';

class SearchResults {
  constructor(element) {
    this.element = element;
  }

  init() {
    this.searchterm = this.getSearchTerm();

    if (this.searchterm) {
      this.getResults();
    }
  }

  getResults() {
    //TODO here goes the fetch
    const testTerms = {
      test: TEST_RESULTS_PLUS,
      squad: TEST_RESULTS,
    };

    this.searchResults = testTerms[this.searchterm.toLowerCase()] ?? null;

    this.showResults();
  }

  showResults() {
    let resultsText = window.placeholders?.default?.noResultsFor.replace('{value}', this.searchterm) || `No results for ${this.searchterm}`;
    let HTMLResults = `<h2 class="results-empty">${resultsText}</h2>`;

    if (this.searchResults) {
      resultsText = window.placeholders?.default?.resultsFor.replace('{value}', this.searchterm) || `Results for ${this.searchterm}`
      HTMLResults = `<h2>${resultsText}</h2>`

      this.searchResults.results.forEach((result) => {
        HTMLResults += `
          <h3 class="results-title"><a class="results-link" href="${result.link}">${result.title}</a></h3>
          <p class="results-text">${result.snipped}</p>
        `;
      });
    }

    this.element.innerHTML = HTMLResults;
  }

  getSearchTerm() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    return params.get('terms').trim();
  }
}

export default function decorate(block) {
  const container = block.children[0];
  const searchResults = new SearchResults(container)

  container.classList.add('search-results-content');
  searchResults.init();
}
