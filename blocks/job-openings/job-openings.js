import { readBlockConfig } from '../../scripts/lib-franklin.js';

let jobOpenings;
let jobListOffset = 0;
let selectedPosition = 'all';
let selectedLocation = 'all';

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

function createJobFilters(parent, positions, locations, callback) {
  const filterContainer = document.createElement('div');
  filterContainer.classList.add('job-openings-filters');

  // positions filter
  const filterPositions = document.createElement('select');
  filterPositions.setAttribute('filter-type', 'positions');
  const defaultPositionTag = document.createElement('option');
  defaultPositionTag.innerText = `${window.placeholders?.default?.allRoles || 'all roles'}`;
  defaultPositionTag.value = `${window.placeholders?.default?.all || 'all'}`;
  filterPositions.append(defaultPositionTag);

  positions.forEach((position) => {
    const optionTag = document.createElement('option');
    optionTag.innerText = position.trim();
    optionTag.value = position.trim();
    filterPositions.append(optionTag);
  });
  filterContainer.append(filterPositions);
  filterPositions.addEventListener('change', callback);

  // locations filter
  const filterLocations = document.createElement('select');
  filterLocations.setAttribute('filter-type', 'locations');
  const defaultLocationTag = document.createElement('option');
  defaultLocationTag.innerText = `${window.placeholders?.default?.allCountries || 'all countries'}`;
  defaultLocationTag.value = `${window.placeholders?.default?.all || 'all'}`;
  filterLocations.append(defaultLocationTag);

  locations.forEach((location) => {
    const optionTag = document.createElement('option');
    optionTag.innerText = location.trim();
    optionTag.value = location.trim();
    filterLocations.append(optionTag);
  });
  filterContainer.append(filterLocations);
  filterLocations.addEventListener('change', callback);

  parent.appendChild(filterContainer);
}

function createJobList(parent, cards = []) {
  const results = document.createElement('p');
  results.classList.add('job-openings-results');

  const jobOpeningList = document.createElement('ul');
  jobOpeningList.classList.add('job-openings-list');

  addCardsToCardList(cards, jobOpeningList);

  parent.appendChild(results);
  parent.appendChild(jobOpeningList);
}

function createCTASection(parent, callback) {
  const buttonRow = document.createElement('div');
  buttonRow.classList.add('button-row');
  buttonRow.innerHTML = `
    <button id="load-more-button" class="button primary">${window.placeholders?.default?.showMore || 'Show More'}</button>`;
  parent.append(buttonRow);
  parent.querySelector('#load-more-button').addEventListener('click', callback);
}

async function getJobOpenings(offset = 0) {
  const response = await fetch(
    `https://api.smartrecruiters.com/v1/companies/netcentric/postings?offset=${offset}&limit=50`,
  );
  const json = await response.json();
  return json;
}

async function updateJobOpenings(parent, num = 16) {
  // load first batch of job openings, if not already loaded
  if (!jobOpenings) {
    jobOpenings = await getJobOpenings(0);
  }

  // filter job openings
  const displayJobOpenings = jobOpenings.content.filter((jobItem) => {
    const matchLocation = selectedLocation === 'all'
      ? true
      : jobItem.customField
        .filter((e) => e.fieldLabel === 'Country')
        .map((e) => e.valueLabel)
        .indexOf(selectedLocation) > -1;
    const matchPosition = selectedPosition === 'all'
      ? true
      : jobItem.customField
        .filter((e) => e.fieldLabel === 'Role')
        .map((e) => e.valueLabel)
        .indexOf(selectedPosition) > -1;
    if (matchLocation && matchPosition) {
      return jobItem;
    }
    return null;
  });

  // update result count and list
  const results = parent.querySelector('.job-openings p.job-openings-results');
  const size = selectedLocation === 'all' && selectedPosition === 'all'
    ? jobOpenings.totalFound
    : displayJobOpenings.length;
  const count = jobListOffset + num < size ? jobListOffset + num : size;
  results.textContent = window.placeholders?.default?.showingCountOfSizeJobs?.replace('{count}', count).replace('{size}', size) || `Showing ${count} of ${size} jobs`;
  const jobList = parent.querySelector('.job-openings ul.job-openings-list');

  addCardsToCardList(displayJobOpenings.splice(jobListOffset, num), jobList);

  // hide show more if we are at the end of the list
  if (count === size) {
    parent.querySelector('.job-openings .button-row').classList.add('hidden');
  }

  // adjust offset for next loading
  jobListOffset += num;

  // load more items in the background
  if (jobOpenings.content.length < jobOpenings.totalFound) {
    let index = 50;
    const promises = [];
    while (index < jobOpenings.totalFound) {
      promises.push(getJobOpenings(index));
      index += 50;
    }
    (await Promise.all(promises)).forEach((result) => jobOpenings.content.push(...result.content));
  }
}

function updateFilter(event) {
  const filterType = event.target.getAttribute('filter-type');
  if (filterType) {
    // update filters
    if (filterType === 'positions') {
      selectedPosition = event.target.value;
    }
    if (filterType === 'locations') {
      selectedLocation = event.target.value;
    }

    // reset all loaded job openings
    jobListOffset = 0;
    document.querySelector('.job-openings ul.job-openings-list').innerHTML = '';
    document
      .querySelector('.job-openings .button-row')
      .classList.remove('hidden');
    updateJobOpenings(document.querySelector('.job-openings'));
  }
}

export default async function decorate(block) {
  const { positions, locations } = readBlockConfig(block);
  block.innerHTML = '';

  createJobFilters(block, positions.split(','), locations.split(','), (e) => {
    updateFilter(e);
  });

  createJobList(block);
  updateJobOpenings(block);

  createCTASection(block, () => {
    updateJobOpenings(block);
  });
}
