class SearchResults {
  constructor(element, options) {
    this.element = element;
    this.options = options;
  }

  init() {
    this.searchterm = this.getSearchTerm();

    if (this.searchterm) {
      this.searchterm.trim();
      this.getResults();
    }
  }

  getResults() {
    fetch(this.options.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        query ($q: String) {search(q: $q){
              count
            items {
              title
              snippet
              path
            }
          }
        }
      `,
        variables: {
          q: this.searchterm,
        },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        this.searchResults = result.data.search;
        this.showResults();
      })
      .catch((error) => {
        this.showResults();
      });
  }

  showResults() {
    let resultsText = window.placeholders?.default?.noResultsFor.replace('{value}', this.searchterm) || `No results for ${this.searchterm}`;
    let HTMLResults = `<h2 class="results-empty">${resultsText}</h2>`;

    if (this.searchResults && this.searchResults.count > 0) {
      resultsText = window.placeholders?.default?.resultsFor.replace('{value}', this.searchterm) || `Results for ${this.searchterm}:`
      HTMLResults = `<h2>${resultsText}</h2>`

      this.searchResults.items.forEach((result) => {
        HTMLResults += `
          <h3 class="results-title"><a class="results-link" href="${result.path}">${result.title}</a></h3>
          <p class="results-text">${result.snippet}</p>
        `;
      });
    }

    this.element.innerHTML = HTMLResults;
  }

  getSearchTerm() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    return params.get('terms');
  }
}

export default function decorate(block) {
  const container = block.children[0];
  const endpoint = block.innerText;
  const searchResults = new SearchResults(container, {endpoint: endpoint});

  container.innerHTML = '';
  container.classList.add('search-results-content');
  searchResults.init();
}
