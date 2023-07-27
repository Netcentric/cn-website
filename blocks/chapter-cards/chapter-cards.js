function createPopup(modalWrapper) {
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  const closeSpan = document.createElement('span');
  closeSpan.classList.add('icon', 'icon-close');
  const form = document.createElement('form');
  const formHeadline = document.createElement('h5');
  formHeadline.innerText = 'Fill the form to unlock all the chapters';
  const firstName = document.createElement('input');
  firstName.placeholder = 'First Name';
  firstName.name = 'fname';
  const lastName = document.createElement('input');
  lastName.placeholder = 'Last Name';
  lastName.name = 'lname';
  const company = document.createElement('input');
  company.placeholder = 'Company';
  company.name = 'company';
  const email = document.createElement('input');
  email.placeholder = 'Email Address';
  const fieldArray = [firstName, lastName, company, email];
  fieldArray.forEach((fields) => {
    fields.setAttribute('type', 'text');
    fields.setAttribute('required', 'true');
  });
  const btn = document.createElement('button');
  btn.innerText = 'Submit';
  btn.className = 'button';
  btn.setAttribute('type', 'submit');
  form.append(formHeadline, firstName, lastName, company, email, btn);
  modalContent.append(closeSpan, form);
  modalWrapper.append(modalContent);
  closeSpan.addEventListener('click', () => {
    modalWrapper.style.display = 'none';
  });
  window.addEventListener('click', (event) => {
    if (event.target === modalWrapper) {
      modalWrapper.style.display = 'none';
    }
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.classList.add('chapter-cards-wrap');

  const modalWrapper = document.createElement('div');
  modalWrapper.classList.add('modal');

  [...block.children].forEach((row, index) => {
    const [chapterName, title, link] = row.children;
    const cardLink = document.createElement('a');
    cardLink.href = link.innerText;
    chapterName.classList.add('chapter-cards-name');
    title.classList.add('chapter-cards-title');
    const span = document.createElement('span');
    title.append(span);
    const li = document.createElement('li');
    li.classList.add('chapter-cards-item');
    cardLink.append(chapterName, title);
    li.append(cardLink);
    if (index === 0) {
      span.classList.add('icon', 'icon-plus');
    } else {
      span.classList.add('icon', 'icon-lock');
      li.addEventListener('click', (e) => {
        modalWrapper.style.display = 'block';
        e.preventDefault();
      });
    }
    ul.append(li);
  });
  createPopup(modalWrapper);
  block.textContent = '';
  block.append(ul, modalWrapper);
}
