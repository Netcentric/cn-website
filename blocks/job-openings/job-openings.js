import {
  decorateIcons,
} from '../../scripts/lib-franklin.js';

let jobListOffset = 0;
const selectedRole = 'All categories';
const selectedLocation = 'All categories';

function addCardsToCardList(cards, cardList) {
  cards.forEach((card) => {
    const jobListItem = document.createElement('li');
    jobListItem.classList.add('job-opening-list-item');

    jobListItem.innerHTML = `
    <a href="https://www.smartrecruiters.com/Netcentric/${
  card.id
}" target="_blank" rel="noopener noreferrer">
      <span class="position">${card.name}</span>
      <span class="location">${card.location.country.toUpperCase()} - ${
  card.location.city
}</span>
    </a>`;

    cardList.appendChild(jobListItem);
  });
}

function createJobList(parent, cards = []) {
  const results = document.createElement('p');
  results.classList.add("job-openings-results");
  
  const jobOpeningList = document.createElement('ul');
  jobOpeningList.classList.add('job-openings-list');

  addCardsToCardList(cards, jobOpeningList);

  parent.appendChild(results);
  parent.appendChild(jobOpeningList);
}

function createCTASection(parent, callback) {
  const buttonRow = document.createElement('div');
  buttonRow.classList.add('button-row');
  buttonRow.innerHTML = '<button id="load-more-button" class="button primary">Show More</button>';
  parent.append(buttonRow);
  parent.querySelector('#load-more-button').addEventListener('click', callback);
}

async function getJobOpenings(filter = () => true, maxItems = 7, offset = 0) {
  const response = await fetch(
    `https://api.smartrecruiters.com/v1/companies/netcentric/postings?offset=${offset}&limit=${maxItems}`,
  );
  const json = await response.json();
  // const queryResult = json.data.filter(filter).slice(offset, offset + maxItems);


  return json;
}

async function loadMoreJobOpenings(num = 16) {
  // const filter = getCardFilter();

  const jobOpenings = await getJobOpenings(null, num, jobListOffset);

  // update result count and list
  const results = document.querySelector(
    ".job-openings p.job-openings-results"
  );
  const count = jobListOffset + jobOpenings.limit;
  results.textContent = `Showing ${count} of ${jobOpenings.totalFound} jobs`;
  const jobList = document.querySelector(".job-openings ul.job-openings-list");
  addCardsToCardList(jobOpenings.content, jobList);

  // adjust offset for next loading
  jobListOffset += num;
}

export default async function decorate(block) {
  block.innerHTML = '';

  createJobList(block);
  await loadMoreJobOpenings();

  createCTASection(block, () => {
    loadMoreJobOpenings();
  });
}
