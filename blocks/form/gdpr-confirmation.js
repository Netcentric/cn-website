function hasQueryParams() {
  return !!window.location.search;
}

// Send a query parameters to the GDPR API Accept
async function acceptResult(accept, urlProd, sucessRedirect, block) {
  // get url parameters
  const urlParams = new URLSearchParams(window.location.search);
  const paramData = urlParams.get('data');
  const paramInit = urlParams.get('init');
  const url = urlProd + accept;
  const options = {
    method: 'PUT',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      data: paramData,
      init: paramInit,
      confirm: 'true',
    }),
  };
  try {
    const response = await fetch(url, options);
    const resData = await response.text();
    if (response.ok) {
      window.open(sucessRedirect);
    } else {
      const { message } = JSON.parse(resData);
      throw message;
    }
  } catch (error) {
    const divError = document.createElement('div');
    divError.className = 'diverror';
    divError.innerHTML = 'Something went wrong. Try again';
    block.appendChild(divError);
    const span = document.createElement('span');
    span.innerHTML = 'x';
    span.className = 'closeerror';
    divError.appendChild(span);
    span.addEventListener('click', () => {
      divError.style.display = 'none';
    });
  }
}

/* eslint-disable import/prefer-default-export */
export function createConfirmForm(block) {
  const confirmationForm = document.createElement('form');
  const configlIst = [];
  const configlIstNames = [];
  [...block.children].forEach((row) => {
    configlIst.push(row.children[1].textContent);
    [row].forEach((div) => {
      configlIstNames.push(div.children[0].textContent);
    });
  });
  const indexBaseurl = configlIstNames.indexOf('API base URL');
  const indexSuccessRedirect = configlIstNames.indexOf('Success Redirect');
  const sucessRedirect = configlIst[indexSuccessRedirect];
  const indexButtonLabel = configlIstNames.indexOf('Button Label');
  const indexCheckboxText = configlIstNames.indexOf('Checkbox Text');
  block.textContent = '';
  // creates a check box
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('required', 'true');
  checkbox.setAttribute('name', 'confirm');
  checkbox.className = 'confirmation-checkbox';
  const label = document.createElement('label');
  label.setAttribute('for', 'confirm');
  label.innerHTML = configlIst[indexCheckboxText];
  label.className = 'confirm-label';
  // creates a button
  const btn = document.createElement('button');
  btn.innerText = configlIst[indexButtonLabel];
  btn.className = 'button';
  confirmationForm.method = 'POST';
  confirmationForm.append(checkbox, label, btn);
  block.append(confirmationForm);
  // checking query parameters
  if (!hasQueryParams()) {
    btn.setAttribute('disabled', '');
  }
  // API Variables
  const accept = '/accept';
  const urlProd = configlIst[indexBaseurl];
  confirmationForm.onsubmit = async (e) => {
    e.preventDefault();
    acceptResult(accept, urlProd, sucessRedirect, block);
  };
}
