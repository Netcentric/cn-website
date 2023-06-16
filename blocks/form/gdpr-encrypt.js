const apiKeyStoreName = 'gdpr-api-key';
const encryptEndpoint = 'https://api.netcentric.biz/gdpr/ticket2link';

function resetResults(resultElements) {
  resultElements.forEach((p) => {
    p.classList.remove('show');
    p.innerHTML = '';
  });
}

function showResult(element, message) {
  element.classList.add('show');
  element.innerText = message;
}

/**
 * Send a query to the GDPR API and save the apiKey to localStorage for further calls
 * @param {{ticket:string, apiKey:string}} result form fields
 */
async function encrypt(apiKey, ticket) {
  localStorage.setItem(apiKeyStoreName, apiKey);

  const endpoint = new URL(encryptEndpoint);
  endpoint.searchParams.set('ticket', ticket);
  const options = {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticket }),
  };
  const response = await fetch(encryptEndpoint, options);
  if (!response.ok) {
    throw new Error('Network error.');
  }
  return response.json();
}

export default function decorate(form) {
  // setup result section
  const resultElement = document.createElement('div');
  resultElement.classList.add('form-submission-result');
  form.append(resultElement);
  resultElement.innerHTML = `
  <p class="form-submission-error"></p>
  <p class="form-submission-success"></p>`;
  const errorElement = resultElement.querySelector('.form-submission-error');
  const successElement = resultElement.querySelector('.form-submission-success');

  // get and check input fields
  const inputApiKey = form.querySelector('input[name="apiKey"]');
  const inputTicket = form.querySelector('input[name="ticket"]');
  if (!inputApiKey || !inputTicket) {
    // eslint-disable-next-line no-console
    console.error('api key and ticket needed for api call', inputApiKey, inputTicket);
    showResult(errorElement, 'Invalid form configuration. The two fields "apiKey" and "ticket" are required for link generation.');
    return;
  }

  // Fill API key if it is saved in localStorage
  const savedApiKey = localStorage.getItem(apiKeyStoreName);
  inputApiKey.value = savedApiKey ?? '';

  // setup form submission
  const button = form.querySelector('button[name="submit"]');
  button.addEventListener('click', async (e) => {
    try {
      button.disabled = true;
      resetResults([errorElement, successElement]);
      if (form.checkValidity()) {
        e.preventDefault();
        const data = await encrypt(inputApiKey.value.trim(), inputTicket.value.trim());
        const link = new URL(form.dataset.confirmationPage);
        link.protocol = window.location.protocol;
        link.host = window.location.host;
        link.searchParams.set('init', data.init);
        link.searchParams.set('data', data.data);
        showResult(successElement, '');
        successElement.innerHTML = `Right click to copy link: <a href="${link.toString()}">${link.toString()}</a>`;
      }
    } catch (error) {
      showResult(errorElement, error);

      // eslint-disable-next-line no-console
      console.error(
        `%cError encypting: %c${error}`,
        'color:#f88; background-color:#290002',
        'color:white; background-color:#290002',
        error,
      );
    } finally {
      button.disabled = false;
    }
  });
}
