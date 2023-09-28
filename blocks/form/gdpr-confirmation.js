import { readBlockConfig } from '../../scripts/lib-franklin.js';

function hasQueryParams() {
  return !!window.location.search;
}

// Send a query parameters to the GDPR API Accept
async function acceptResult(accept, urlProd, sucessRedirect, block, submitButton) {
  try {
    submitButton.disabled = true;
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
    const response = await fetch(url, options);
    const resData = await response.text();
    if (response.ok) {
      window.location.href = sucessRedirect;
    } else {
      const { message } = JSON.parse(resData);
      throw message;
    }
  } catch (error) {
    block.querySelectorAll('.error').forEach((div) => div.remove());
    const divError = document.createElement('div');
    divError.className = 'error';
    divError.innerHTML = 'Something went wrong. Please try again.';
    block.appendChild(divError);
    const span = document.createElement('span');
    span.innerHTML = 'x';
    span.className = 'close-error';
    divError.appendChild(span);
    span.addEventListener('click', () => {
      divError.classList.add('hidden');
    });

    // eslint-disable-next-line no-console
    console.error(
      `%cError sending the data: %c${error}`,
      'color:#f88; background-color:#290002',
      'color:white; background-color:#290002',
    );
  } finally {
    submitButton.disabled = false;
  }
}

export default function decorate(block) {
  const confirmationForm = document.createElement('form');
  const config = readBlockConfig(block);
  const sucessRedirect = config['success-redirect'];
  block.textContent = '';
  // creates a check box
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.setAttribute('required', 'true');
  checkbox.setAttribute('name', 'confirm');
  checkbox.className = 'confirmation-checkbox';
  const label = document.createElement('label');
  label.setAttribute('for', 'confirm');
  label.innerHTML = config['checkbox-text'];
  label.className = 'confirm-label';
  // creates a button
  const btn = document.createElement('button');
  btn.innerText = config['button-label'];
  btn.className = 'button confirm-btn';
  confirmationForm.method = 'POST';
  confirmationForm.append(checkbox, label, btn);
  block.append(confirmationForm);
  // checking query parameters
  if (!hasQueryParams()) {
    btn.disabled = true;
  }
  // API Variables
  const accept = '/accept';
  const urlProd = config['api-base-url'];
  confirmationForm.onsubmit = async (e) => {
    e.preventDefault();
    acceptResult(accept, urlProd, sucessRedirect, block, btn);
  };
}
