import { loadCSS } from '../../scripts/lib-franklin.js';
import { isMarketoFormUrl } from '../../scripts/scripts.js';

const loadScript = (url, callback, type) => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  head.append(script);
  script.onload = callback;
  return script;
};

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox') {
      if (fe.checked) payload[fe.name] = fe.value;
    } else if (fe.name) {
      payload[fe.name] = fe.value;
    }
  });
  // send date
  payload.sent = new Date().toUTCString();
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: payload }),
  });
  if (resp.ok) {
    await resp.text();
    return payload;
  }
  return null;
}

function createButton(fd) {
  const button = document.createElement('button');
  button.textContent = fd.Label;
  button.classList.add('button');
  if (fd.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        const payload = await submitForm(form);
        if (payload) {
          const redirectTo = fd.Extra;
          window.location.href = redirectTo;
        }
      }
    });
  }
  return button;
}

function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

function createInput(fd) {
  const input = document.createElement('input');
  input.type = fd.Type;
  input.id = fd.Field;
  input.name = fd.Field;
  input.value = fd.Value || '';
  if (fd.Placeholder) {
    input.setAttribute('placeholder', fd.Placeholder);
  }
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createTextArea(fd) {
  const input = document.createElement('textarea');
  input.name = fd.Field;
  input.value = fd.Value || '';
  if (fd.Placeholder) {
    input.setAttribute('placeholder', fd.Placeholder);
  }
  if (fd.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function createSelect(fd) {
  const select = document.createElement('select');
  select.name = fd.Field;
  select.value = fd.Value || '';
  if (fd.Placeholder) {
    const ph = document.createElement('option');
    ph.textContent = fd.Placeholder;
    ph.setAttribute('selected', '');
    ph.setAttribute('disabled', '');
    select.append(ph);
  }
  fd.Options.split(',').forEach((o) => {
    const option = document.createElement('option');
    option.textContent = o.trim();
    option.value = o.trim();
    select.append(option);
  });
  if (fd.Mandatory === 'x') {
    select.setAttribute('required', 'required');
  }
  return select;
}

function createLabel(fd) {
  const label = document.createElement('label');
  label.setAttribute('for', fd.Field);
  label.textContent = fd.Label;
  if (fd.Mandatory === 'x') {
    label.classList.add('required');
  }
  if (fd.Extra) {
    const [linkText, href] = fd.Extra.split(',').map((str) => str.trim());
    if (href) {
      // insert link in label text
      const labelTexts = label.textContent.split(linkText);
      label.innerHTML = '';

      const link = document.createElement('a');
      link.textContent = linkText;
      link.href = href;
      link.target = '_blank';

      label.append(labelTexts[0]);
      label.append(link);
      label.append(labelTexts[1]);
    }
  }
  return label;
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const {
      type,
      condition: { key, operator, value },
    } = field.rule;
    if (type === 'visible') {
      if (operator === 'eq') {
        if (payload[key] === value) {
          form.querySelector(`.${field.fieldId}`).classList.remove('hidden');
        } else {
          form.querySelector(`.${field.fieldId}`).classList.add('hidden');
        }
      }
    }
  });
}

async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  [form.dataset.action] = pathname.split('.json');
  json.data.forEach((fd) => {
    fd.Type = fd.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = fd.Style ? ` form-${fd.Style}` : '';
    const fieldClass = `form-${fd.Type}-wrapper${style}`;
    fieldWrapper.className = fieldClass;
    fieldWrapper.classList.add('field-wrapper');
    switch (fd.Type) {
      case 'select':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createSelect(fd));
        break;
      case 'heading':
        fieldWrapper.append(createHeading(fd));
        break;
      case 'checkbox':
        fieldWrapper.append(createInput(fd));
        fieldWrapper.append(createLabel(fd));
        break;
      case 'text-area':
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createTextArea(fd));
        break;
      case 'submit':
        fieldWrapper.append(createButton(fd));
        break;
      default:
        fieldWrapper.append(createLabel(fd));
        fieldWrapper.append(createInput(fd));
    }

    if (fd.Rules) {
      try {
        rules.push({ fieldId: fieldClass, rule: JSON.parse(fd.Rules) });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.Rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });
  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);

  return form;
}

const marketoCnames = {
  '742-RCX-794': 'pagessbx.netcentric.biz',
  '598-XRJ-385': 'pages.netcentric.biz',
};

/**
 * Create a completely barebones, user-styles-only Marketo form by removing inline STYLE
 * attributes and disabling STYLE and LINK elements.
 * @param {Object} form
 * @return {Void}
 */
function removeDefaultFormStyles(mktoForm) {
  const formEl = mktoForm.getFormElem()[0];
  const formStyleEl = formEl.querySelectorAll('[style]');

  formEl.removeAttribute('style');
  for (let i = 0; i < formStyleEl.length; i += 1) {
    formStyleEl[i].removeAttribute('style');
  }

  // Remove all default Marketo stylesheets
  const { styleSheets } = document;

  for (let i = 0; i < styleSheets.length; i += 1) {
    const styleSheetId = styleSheets[i].ownerNode.getAttribute('id');
    if (styleSheetId === 'mktoForms2BaseStyle' || styleSheetId === 'mktoForms2ThemeStyle' || formEl.contains(styleSheets[i].ownerNode)) {
      styleSheets[i].disabled = true;
    }
  }
}

/**
 * Marketo uses the same ids for the same fields. To allow multiple forms, we append a random
 * value to the default input ids
 * @param {Object} form
 * @returns {Void}
 */
function fixFieldLabelAssociation(form) {
  const formEl = form.getFormElem()[0];
  const randomValue = `-${Date.now()}${Math.random()}`;
  const labelEl = formEl.querySelectorAll('label[for]');

  for (let i = 0; i < labelEl.length; i += 1) {
    const forEl = formEl.querySelector(`[id='${labelEl[i].htmlFor}'],
       [id='${labelEl[i].htmlFor}${randomValue}']`);
    if (forEl) {
      forEl.setAttribute('data-orig-id', labelEl[i].htmlFor);
      forEl.id = forEl.id.indexOf(randomValue) === -1
        ? forEl.id + randomValue
        : forEl.id;
      labelEl[i].htmlFor = forEl.id;
    }
  }
}

/**
   * By default all checkboxes and radio buttons are right aligned in Marketo Forms. This function
   * moves these elements to the left side.
   * @param {Object} form
   * @return {Void}
   */
function moveCheckboxesToTheLeft(form) {
  const formEl = form.getFormElem()[0];
  const formRowEl = formEl.querySelectorAll('.mktoFormRow');

  for (let i = 0; i < formRowEl.length; i += 1) {
    // Get all checkboxes and radio buttons within form row
    const formCheckboxEl = formRowEl[i].querySelectorAll('input[type=checkbox], input[type=radio]');
    const hasOnlyOneCheckbox = formCheckboxEl !== null && formCheckboxEl.length === 1;

    // Check if there's only one of these elements in that row to ensure to only transform single
    // checkbox / radio button elements
    if (hasOnlyOneCheckbox) {
      const formCheckboxLabel = formRowEl[i].querySelectorAll(`label[for="${formCheckboxEl[0].getAttribute('name')}"],
         label[for="${formCheckboxEl[0].getAttribute('id')}"]`);

      // Check if second label element is empty which should be the case for all single checkbox /
      // radio button elements
      if (formCheckboxLabel[1].textContent === '') {
        formCheckboxLabel[1].innerHTML = formCheckboxLabel[0].innerHTML;
        formCheckboxLabel[0].innerHTML = '';
      }
    }
  }
}

/**
 * Transform asterisk element into text in order to fix styling issues for rich-text
 * labels. The asterisks for non-required fields are removed.
 * @param {Object} form
 * @param {String} [pos='right'] 'right' or 'left'
 * @returns {Void}
 */
function adjustAsterisk(form, pos) {
  const formEl = form.getFormElem()[0];
  const formFieldWrapEl = formEl.querySelectorAll('.mktoFieldWrap');
  const asteriskPos = pos === 'left' ? 'left' : 'right';
  for (let i = 0; i < formFieldWrapEl.length; i += 1) {
    if (
      formFieldWrapEl[i].getAttribute('data-asterisk-adjusted') !== 'true'
    ) {
      const isRequired = formFieldWrapEl[i].classList.contains('mktoRequiredField');
      const asteriskEl = formFieldWrapEl[i].querySelector('.mktoAsterix');
      if (asteriskEl) {
        const asteriskParentEl = asteriskEl.parentNode;
        asteriskParentEl.removeChild(asteriskEl);
        if (isRequired) {
          const labelHTML = asteriskParentEl.innerHTML;
          asteriskParentEl.innerHTML = asteriskPos === 'left' ? `* ${labelHTML}` : `${labelHTML} *`;
        }

        formFieldWrapEl[i].setAttribute('data-asterisk-adjusted', true);
      }
    }
  }
}

/**
 * Get closest parent element by selector
 * @param {Element} elem
 * @param {String} selector
 * @returns {Element|null}
 */
function getClosest(el, selector) {
  let elTemp = el;
  for (; elTemp && elTemp !== document; elTemp = elTemp.parentNode) {
    if (elTemp.matches(selector)) {
      return elTemp;
    }
  }
  return null;
}

function attachSuccessMessage(block, form) {
  const fieldsetEl = form.getFormElem()[0].querySelectorAll('fieldset');
  let successMessage = false;
  for (let i = 0; i < fieldsetEl.length; i += 1) {
    const legendEl = fieldsetEl[i].querySelector('legend');
    if (legendEl.textContent === 'Success Message') {
      const hasInputEl = fieldsetEl[i].querySelector('input, select, textarea') !== null;
      const htmlTextEl = fieldsetEl[i].querySelector('.mktoHtmlText');
      if (!hasInputEl && htmlTextEl) {
        const rowEl = getClosest(fieldsetEl[i], '.mktoFormRow');
        rowEl.parentNode.removeChild(rowEl);
        successMessage = htmlTextEl.innerHTML;
        break;
      }
    }
  }

  if (successMessage) {
    form.onSuccess(() => {
      block.className = 'mktoFormSuccess';
      block.innerHTML = `<div class="mktoFormSuccess">${successMessage}</div>`;
      return false;
    });
  }
}

export default async function decorate(block) {
  const form = block.querySelector('a[href]');
  try {
    const target = new URL(form?.href);
    if (isMarketoFormUrl(target)) {
      loadCSS('/blocks/form/form-marketo.css');
      const [, formId] = target.hash.split('#/mktForm/');
      const munchkinId = new URLSearchParams(target.search).get('munchkinId');
      const cname = marketoCnames[munchkinId];
      block.innerHTML = `<form id="mktoForm_${formId}"></form>`;
      loadScript(`//${cname}/js/forms2/js/forms2.min.js`, () => {
        window.MktoForms2.loadForm(`//${cname}`, munchkinId, formId, (loadedForm) => {
          removeDefaultFormStyles(loadedForm);
          fixFieldLabelAssociation(loadedForm);
          moveCheckboxesToTheLeft(loadedForm);
          adjustAsterisk(loadedForm);
          attachSuccessMessage(block, loadedForm);
        });
      });
    } else if (target.pathname.endsWith('.json')) {
      form.replaceWith(await createForm(form.href));
    }
  } catch (e) {
    if (window.location.hostname.endsWith('.page')) {
      block.innerHTML = `Invalid form configuration: ${e}`;
    } else {
      block.innerHTML = '<!-- invalid form configuration -->';
    }
    console.error(e); // eslint-disable-line no-console
  }
}
