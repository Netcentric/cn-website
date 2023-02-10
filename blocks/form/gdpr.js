const apiClass = 'apiKey';
const feedbackClass = 'feedback';
const inputApi = document.getElementById(apiClass);
const formBlock = document.querySelector('.gdpr');
const feedback = document.querySelector('.feedback');
const fbWrapper = feedback.children[0];
const fbContainer = fbWrapper.children[0];
const form = formBlock.querySelector('form');
const inputs = form.querySelectorAll('input');
const ticket2Link = '/ticket2link?ticket=';
const urlProd = 'https://api.netcentric.biz/gdpr';
const urlBase = urlProd;

const savedApiKey = localStorage.getItem(apiClass);
inputApi.value = savedApiKey ?? '';

fbWrapper.classList.add(`${feedbackClass}-wrapper`);
fbContainer.classList.add(`${feedbackClass}-container`);

/**
 * Add a CSS class to an HTMLElement
 * @param {HTMLElement} el Element to add the className
 * @param {string} className
 */
function addClass(el, className) {
  el.classList.add(className);
}

/**
 * Remove a CSS class from an HTMLElement
 * @param {HTMLElement} el Element to remove the className
 * @param {string} className
 */
function removeClass(el, className) {
  el.classList.remove(className);
}

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
    addClass(message, 'error-message');
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
    addClass(input, errorClass);
    showErrorMessage(input, 'This field is required');
  } else {
    removeClass(input, errorClass);
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
    removeClass(feedback, 'show');
  };
  addClass(close, 'button');
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
    addClass(feedback, 'show');
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
