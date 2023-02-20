const apiClass = 'apiKey';
const inputApi = document.getElementById(apiClass);
const main = document.querySelector('main');
const formBlock = document.querySelector('.gdpr');
const form = formBlock.querySelector('form');
const inputs = form.querySelectorAll('input');
const ticket2Link = '/ticket2link?ticket=';
const urlProd = 'https://api.netcentric.biz/gdpr';
const urlBase = urlProd;

// Fill API key if it is saved in localStorage
const savedApiKey = localStorage.getItem(apiClass);
inputApi.value = savedApiKey ?? '';

// Set up Feedback section
const section = document.createElement('div');
const SWrapper = document.createElement('div');
const feedback = document.createElement('div');
const fbWrapper = document.createElement('div');
const fbContainer = document.createElement('div');
section.classList.add('section', 'section-feedback-container');
SWrapper.classList.add('section-feedback-wrapper');
feedback.classList.add('feedback');
fbWrapper.classList.add('feedback-wrapper');
fbContainer.classList.add('feedback-container');
main.appendChild(section);
section.appendChild(SWrapper);
SWrapper.appendChild(feedback);
feedback.appendChild(fbWrapper);
fbWrapper.appendChild(fbContainer);

/**
 * Add an error message to an input field in a form
 * @param {HTMLElement} el HTMLElement
 * @param {string} text text to show as error
 */
function showErrorMessage(el, text) {
  const wrapper = el.parentElement;
  const hasMessage = wrapper.querySelector('.error-message');
  if (!hasMessage) {
    const message = document.createElement('p');
    message.classList.add('error-message');
    message.innerText = text;
    wrapper.appendChild(message);
  }
}

/**
 * Remove an error message from an input field in a form
 * @param {HTMLElement} el HTMLElement
 */
function hideErrorMessage(el) {
  const wrapper = el.parentElement;
  const message = wrapper.querySelector('.error-message');
  if (message) wrapper.removeChild(message);
}

/**
 * Check the inputs value to decide if it needs to show an error message ot not
 * @param {Event} e Event
 */
function checkErrorMessage(e) {
  const input = e.target;
  const errorClass = 'error';
  if (input.value.trim().length < 1) {
    input.classList.add(errorClass);
    showErrorMessage(input, 'This field is required');
  } else {
    input.classList.remove(errorClass);
    hideErrorMessage(input);
  }
}

/**
 * Add a feedback message with technical errors and shows it
 * @param {string} message The error message
 */
function showFeedbackMessage(message) {
  const title = document.createElement('h4');
  const text = document.createElement('p');
  const close = document.createElement('button');
  title.textContent = 'Something goes wrong';
  text.innerText = message;
  close.innerText = 'close message';
  close.type = 'button';
  // A close button to hide the message
  close.onclick = () => {
    fbContainer.innerHTML = '';
    feedback.classList.remove('show');
  };
  close.classList.add('button');
  fbContainer.innerHTML = '';
  fbContainer.append(title, text, close);
}

/**
 * Open the results in a new tab/window
 * @param {string} data The answered data from the API
 * @param {string} url destination url
 */
function openInNewWindow(data, url = 'about:blank') {
  const newWindow = window.open(url, '_blank');
  newWindow.document.write(data);
  newWindow.focus();
}

/**
 * Send a query to the GDPR API and save the apiKey to localStorage for further calls
 * @param {{ticket:string, apiKey:string}} result form fields
 */
async function fetchForm(result) {
  const { ticket, apiKey } = result;
  const url = urlBase + ticket2Link + ticket;
  const options = {
    method: 'GET',
    headers: { 'x-api-key': apiKey },
  };
  try {
    const response = await fetch(url, options);
    const data = await response.text();
    if (data.includes('http')) {
      if (!savedApiKey || savedApiKey !== apiKey) localStorage.setItem(apiClass, apiKey);
      openInNewWindow(data, url);
    } else {
      const { message } = JSON.parse(data);
      throw message;
    }
  } catch (error) {
    // Show a message below the form, in the feedback section
    feedback.classList.add('show');
    showFeedbackMessage(error);

    // eslint-disable-next-line no-console
    console.error(
      `%cError sending the data: %c${error}`,
      'color:#f88; background-color:#290002',
      'color:white; background-color:#290002',
    );
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const results = {};
  const inputFields = inputs.length;
  [...e.target].forEach((el) => {
    const { id } = el;
    if (id !== '' && el.value.trim() !== '') {
      results[id] = el.value;
    }
  });

  const { length } = Object.entries(results);
  // fetch the data
  if (length === inputFields) await fetchForm(results);
};

form.onkeyup = (e) => checkErrorMessage(e);

inputs.forEach((input) => {
  input.onblur = (e) => checkErrorMessage(e);
});
