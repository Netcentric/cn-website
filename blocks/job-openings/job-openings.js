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
  const blogList = document.createElement('ul');
  blogList.classList.add('job-openings-list');

  addCardsToCardList(cards, blogList);

  parent.appendChild(blogList);
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
  const queryResult = json.content;

  return queryResult;
}

async function loadMoreJobOpenings(num = 20) {
  // const filter = getCardFilter();

  const jobOpenings = await getJobOpenings(null, num, jobListOffset);
  jobListOffset += num;

  const jobList = document.querySelector('.job-openings ul');
  addCardsToCardList(jobOpenings, jobList);
}

export default async function decorate(block) {
  block.innerHTML = '';

  createJobList(block);
  await loadMoreJobOpenings(16);

  createCTASection(block, () => {
    loadMoreJobOpenings();
  });
}
