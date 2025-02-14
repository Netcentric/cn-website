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

function validateForm(form) {
  return true;
}

function createDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'login-dialog';
  dialog.innerHTML = `
    <form name="loginForm">
      <div class="login-dialog-content">
        <label for="email">Email</label>
        <input type="text" name="email" data-validate="email" required>
        <label for="password">Password</label>
        <input type="password" name="password" required>
        <button type="submit">Log In</button>   
      </div>  
    </form>
`;
  window.document.body.appendChild(dialog);
  return dialog;
}

function setUpButtonText(button) {
  button.textContent = userLoggedIn ? 'Log Out' : 'Log In';
}

function setUserCookie(data) {
  document.cookie = `ncUser=${data}`;
  userLoggedIn = true;
}

function removeUserCookie() {
  document.cookie = 'ncUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  userLoggedIn = false;
}

export default function initLogIn(button) {
  const dialog = createDialog();
  const submitButton = dialog.querySelector('button');
  userLoggedIn = getCookie('ncUser');
  setUpButtonText(button);
  button.href = '#';

  button.addEventListener('click', (e) => {
    e.preventDefault();

    if (userLoggedIn) {
      removeUserCookie()
      setUpButtonText(button);
    } else {
      dialog.showModal();
    }
  });

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });

  submitButton.addEventListener('click', (e) => {
    e.preventDefault();
    const form = document.forms.loginForm;
    const email = form.email.value;
    const isValid = validateForm(form);

    if (isValid) {
      setUserCookie(email);
      setUpButtonText(button);
      dialog.close();
    }
  });
}