import { handleHardReload, getImageURL } from './personalisation-helpers.js';

let userLoggedIn = false;

function getCookie(cookieStartName) {
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.startsWith(cookieStartName)) {
      return c.substring(c.indexOf('=') + 1);
    }
  }
  return '';
}

function resetForm(form) {
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input) => {
    input.value = '';
  });
}

function resetValidationErrors(form) {
  const errorMessages = form.querySelectorAll('.error-message');
  const inputs = form.querySelectorAll('input');

  errorMessages.forEach((errorMessage) => {
    errorMessage.remove();
  });
  inputs.forEach((input) => {
    input.classList.remove('error');
  });
}

function validateForm(form) {
  const inputs = form.querySelectorAll('input');
  let isValid = true;
  resetValidationErrors(form);

  inputs.forEach((input) => {
    const errorMessage = document.createElement('span');
    input.before(errorMessage);

    if (input.required && !input.value) {
      errorMessage.textContent = 'This field is required';
      errorMessage.className = 'error-message';
      isValid = false;
      input.classList.add('error');
    }
    if (input.dataset.validate === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value)) {
        errorMessage.textContent = 'Please enter a valid email address';
        errorMessage.className = 'error-message';
        isValid = false;
        input.classList.add('error');
      }
    }
  });

  return isValid;
}

function createDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'login-dialog';
  dialog.innerHTML = `
    <form name="loginForm">
      <div class="login-dialog-content">
        <div class="form-wrapper">
          <label for="email">Email</label>
          <input type="text" name="email" data-validate="email" required>
          <label for="password">Password</label>
          <input type="password" name="password" required>
          <button type="submit">Log In</button>   
        </div>
      </div>  
    </form>
`;
  window.document.body.appendChild(dialog);
  return dialog;
}

function setUpButtonText(button) {
  const firstName = window.personalizationData.content?.firstName ? `${window.personalizationData.content.firstName},` : '';
  button.textContent = userLoggedIn ? `${firstName} Log Out` : 'Log In';
}

function setUserCookie(data) {
  document.cookie = `ncUser=${data}`;
  userLoggedIn = true;
}

function removeUserCookie() {
  document.cookie = 'ncUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  window.personalizationData = {};
  userLoggedIn = false;
}

export default function initLogIn(button) {
  const dialog = createDialog();
  const submitButton = dialog.querySelector('button');
  const logo = document.querySelector('.icon-netcentric-logo');
  window.personalizationData = window.personalizationData || {};
  userLoggedIn = getCookie('ncUser');
  setUpButtonText(button);
  button.href = '#';

  button.addEventListener('click', (e) => {
    e.preventDefault();

    if (userLoggedIn) {
      document.cookie = 'userchanged=true';
      removeUserCookie();
      setUpButtonText(button);
      handleHardReload(window.location.href);
    } else {
      resetForm(document.forms.loginForm);
      dialog.showModal();
    }
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
      resetValidationErrors(document.forms.loginForm);
    }
  });

  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const form = document.forms.loginForm;
    const email = form.email.value;
    const isValid = validateForm(form);

    if (isValid) {
      document.cookie = 'userchanged=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      setUserCookie(email);
      setUpButtonText(button);
      dialog.close();
      handleHardReload(window.location.href);
    }
  });
}