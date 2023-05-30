// get url parameters
const curUrl = window.location.href;
const urlParams = new URLSearchParams(window.location.search);
const paramdata = urlParams.get('data');
const paraminit = urlParams.get('init');

function hasQueryParams() {
  return curUrl.toString().includes('?');
}

// Send a query parameters to the GDPR API Accept
export async function acceptresult(accept, urlProd, secondConfig) {
  const url = urlProd + accept;
  const options = {
    method: 'PUT',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      data: paramdata,
      init: paraminit,
      confirm: 'true',
    }),
  };
  try {
    const response = await fetch(url, options);
    const resData = await response.text();
    if (response.ok) {
      window.open(secondConfig);
    } else {
      const { message } = JSON.parse(resData);
      throw message;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `%cError sending the data: %c${error}`,
      'color:#f88; background-color:#290002',
      'color:white; background-color:#290002',
    );
  }
}

export function createConfirmForm(block) {
  const confirmationForm = document.createElement('form');
  const configlIst = [];
  [...block.children].forEach((row) => {
    configlIst.push(row.children[1].textContent);
  });
  block.textContent = '';
  // creates a check box
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('required', 'true');
  checkbox.setAttribute('name', 'confirm');
  checkbox.className = 'confirmation-checkbox';
  const label = document.createElement('label');
  label.setAttribute('for', 'confirm');
  const [firstConfig, secondConfig, thirdConfig, fourthConfig] = configlIst;
  label.innerHTML = fourthConfig;
  label.className = 'confirm-label';
  // creates a button
  const btn = document.createElement('button');
  btn.innerText = thirdConfig;
  btn.className = 'button';
  confirmationForm.method = 'POST';
  confirmationForm.append(checkbox, label, btn);
  block.append(confirmationForm);
  // checking query parameters
  if (!hasQueryParams(curUrl)) {
    btn.setAttribute('disabled', '');
  }
  // API Variables
  const accept = '/accept';
  const urlProd = firstConfig;
  confirmationForm.onsubmit = async (e) => {
    e.preventDefault();
    acceptresult(accept, urlProd, secondConfig);
  };
}
