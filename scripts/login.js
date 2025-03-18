import { handleHardReload } from './personalisation-helpers.js';

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

function generateUUID() {
  let d = new Date().getTime();

  // Use high-precision timer if available
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function post(request, callback) {
  try {
    const response = await fetch(request);
    const result = await response.json();
    console.log("Success:", result);
    if (callback) callback();
  } catch (error) {
    console.error("Error:", error);
  }
}

function  sentSignInData(form  , callback) {
  const data = {
    "header": {
      "schemaRef": {
        "id": "https://ns.adobe.com/netcentricgmbh/schemas/709781f368368fceb6e2fb8c62b4def7ad2d6c2e91f98551",
        "contentType": "application/vnd.adobe.xed-full+json;version=1"
      },
      "imsOrgId": "FA907D44536A3C2B0A490D4D@AdobeOrg",
      "source": {
        "name": "postman"
      },
      "datasetId": "67b1acd4627d0f2aefaca606"
    },
    "body": {
      "xdmMeta": {
        "schemaRef": {
          "id": "https://ns.adobe.com/netcentricgmbh/schemas/709781f368368fceb6e2fb8c62b4def7ad2d6c2e91f98551",
          "contentType": "application/vnd.adobe.xed-full+json;version=1"
        }
      },
      "xdmEntity": {
        "_id": generateUUID(),
        "identityMap": {
          "email": [
            {
              "id": form.email.value
            }
          ]
        },
        "consents": {
          "marketing": {
            "preferred": "email",
            "postalMail": {
              "val": "y"
            },
            "email": {
              "val": "y"
            },
            "call": {
              "val": "n"
            },
            "any": {
              "val": "y"
            }
          }
        },
        "person": {
          "name": {
            "lastName": form.lastName.value,
            "firstName": form.firstName.value
          }
        },
        "homeAddress": {
          "label": form.company.value
        },
        "personalEmail": {
          "address": form.email.value
        }
      }
    }
  };

  const request = new Request("https://dcs.adobedc.net/collection/d51a67adf7de6444b4bd4be318417667b13aea942d5d1edd548ad7174419a7be?syncValidation=true", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  post(request, callback);
}

function createSignInButton(button) {
  if (userLoggedIn) return;
  const signInButton = document.createElement('a');
  signInButton.href = '#';
  signInButton.textContent = 'Sign In';
  button.parentElement.append(signInButton);

  const dialog = document.createElement('dialog');
  dialog.className = 'login-dialog';
  dialog.innerHTML = `
    <form name="signInForm">
      <div class="login-dialog-content">
        <div class="form-wrapper">
          <label for="firstName">First Name</label>
          <input type="text" name="firstName" required>
          <label for="lastName">Last Name</label>
          <input type="text" name="lastName" required>
          <label for="company">Company</label>
          <input type="text" name="company" required>
          <label for="email">Email</label>
          <input type="text" name="email" data-validate="email" required>
          <label for="password">Password</label>
          <input type="password" name="password" required>
          <button type="submit">Sign In</button>   
        </div>
      </div>  
    </form>
  `;
  window.document.body.appendChild(dialog);
  const submitButton = dialog.querySelector('button');

  signInButton.addEventListener('click', (e) => {
    e.preventDefault();
    dialog.showModal();
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
      resetValidationErrors(document.forms.signInForm);
    }
  });

  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const form = document.forms.signInForm;
    const isValid = validateForm(form);


    if (isValid) {
      sentSignInData(form, () => {
        dialog.close();
        document.cookie = `ncUser=${form.email.value}`;
        userLoggedIn = true;
        handleHardReload(window.location.href);
      });
    }
  });
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
  window.personalizationData = window.personalizationData || {};
  userLoggedIn = getCookie('ncUser');
  setUpButtonText(button);
  button.href = '#';
  createSignInButton(button)

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