class SearchResults {
  constructor(element, options) {
    this.element = element;
    this.options = options;
  }

  init() {
    this.searchterm = SearchResults.getSearchTerm();

    if (this.searchterm) {
      this.element.innerHTML = '<div class="results-loading"></div>';
      this.searchterm = this.searchterm.trim();
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
      .catch(() => {
        this.showResults();
      });
  }

  showResults() {
    const encodedSearchTerm = SearchResults.htmlEncode(this.searchterm);
    let resultsText = window.placeholders?.default?.noResultsFor.replace('{0}', `<span>${encodedSearchTerm}</span>`)
                      || `No results for <span>${encodedSearchTerm}</span>`;
    let HTMLResults = `<h2 class="results-empty">${resultsText}</h2>`;
    let hasResults = false;

    if (this.searchResults && this.searchResults.count > 0) {
      resultsText = window.placeholders?.default?.resultsFor.replace('{0}', `<span>${encodedSearchTerm}</span>`)
                    || `Results for <span>${encodedSearchTerm}</span>:`;
      HTMLResults = `<h2>${resultsText}</h2>`;
      // add toggle search below
      HTMLResults += `
        <div class="toggle">
          <label class="switch">
            <input type="checkbox">
            <span class="slider round"></span>
          </label>
          <span>Highlight term</span>
        </div>
      `;
      hasResults = true;

      this.searchResults.items.forEach((result) => {
        HTMLResults += `
        <h3 class="results-title"><a class="results-link" href="${result.path}">${result.title}</a></h3>
        <p class="results-text">${result.snippet}</p>
        `;
      });
    }

    this.element.innerHTML = HTMLResults;

    if (hasResults) {
      const toggle = this.element.querySelector('.toggle input');
      const emphasizedTerms = this.element.querySelectorAll('em');
      toggle.addEventListener('click', () => {
        emphasizedTerms.forEach((term) => term.classList.toggle('highlighted'));
      });
    }
  }

  static getSearchTerm() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    return params.get('terms');
  }

  static htmlEncode(input) {
    const textArea = document.createElement('textarea');
    textArea.innerText = input;
    return textArea.innerHTML.split('<br>').join('\n');
  }
}

export default function decorate(block) {
  const container = block.children[0];
  const endpoint = block.innerText;
  const searchResults = new SearchResults(container, { endpoint });

  container.innerHTML = '';
  container.classList.add('search-results-content');
  searchResults.init();
}
