import { loadCSS } from '../../scripts/lib-franklin.js';
import { isMarketoFormUrl } from '../../scripts/scripts.js';

/**
 * Add a script element to the document's head
 * @param {String} url
 * @param {Function} callback
 * @param {String} type
 * @returns {HTMLScriptElement} HTMLScriptElement
 */
const loadScript = (url, callback, type) => {
  const { head } = document;
  const script = document.createElement('script');
  script.src = url;
  if (type) {
    script.setAttribute('type', type);
  }
  head.append(script);
  script.onload = callback;
  return script;
};

/**
 * Prepares the values of the form elements to be submitted
 * @param {object} form
 * @returns {object} payload
 */
function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((formElement) => {
    const {
      type,
      checked,
      name,
      value,
    } = formElement;
    if (type === 'checkbox') {
      if (checked) payload[name] = value;
    } else if (name) {
      payload[name] = value;
    }
  });
  // send date
  payload.sent = new Date().toUTCString();
  return payload;
}

/**
 * Send the form values and returns the payload values if the send is ok, or null if not
 * @param {object} form
 * @returns {(object|null)} payload || null
 */
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

/**
 * Creates a button element based on the Field data
 * @param {object} fd - field data object
 * @param {string} fd.Type - field type
 * @param {string} fd.Label - button text
 * @param {string} fd.Extra - extra link
 * @returns {HTMLButtonElement} HTMLButtonElement
 */
function createButton(fd) {
  const {
    Type: type,
    Label: text,
    Extra: redirectTo,
    Options,
  } = fd;
  const button = document.createElement('button');
  const isGDPRForm = Options === 'gdpr';
  button.textContent = text;
  button.classList.add('button');
  if (type === 'submit' && !isGDPRForm) {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        const payload = await submitForm(form);
        if (payload) {
          window.location.href = redirectTo;
        }
      }
    });
  }
  return button;
}

/**
 * Creates a header element based on the Field data
 * @param {object} fd - field data object
 * @param {string} fd.Label - header text
 * @returns {HTMLHeadingElement} HTMLHeadingElement
 */
function createHeading(fd) {
  const heading = document.createElement('h3');
  heading.textContent = fd.Label;
  return heading;
}

/**
 * Creates an input element based on the Field data
 * @param {object} fd - field data object
 * @param {string} fd.Type - field type
 * @param {string} fd.Field - id or name
 * @param {string} fd.Value - field value
 * @param {string} fd.Placeholder  - field placeholder
 * @param {string} fd.Mandatory - 'x' means required
 * @returns {HTMLInputElement} HTMLInputElement
 */
function createInput(fd) {
  const {
    Type: type,
    Field: name,
    Value: value,
    Placeholder: placeholder,
    Mandatory: isRequired,
  } = fd;
  const input = document.createElement('input');
  input.type = type;
  input.id = name;
  input.name = name;
  input.value = value || '';
  if (placeholder) {
    input.setAttribute('placeholder', placeholder);
  }
  if (isRequired === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

/**
 * Creates a textarea element based on the Field data
 * @param {object} fd - field data object
 * @param {string} fd.Field - field name
 * @param {string} fd.Value - field value
 * @param {string} fd.Placeholder - field placeholder
 * @param {string} fd.Mandatory - 'x' means required
 * @returns {HTMLTextAreaElement} HTMLTextAreaElement
 */
function createTextArea(fd) {
  const {
    Field: name,
    Value: value,
    Placeholder: placeholder,
    Mandatory: isRequired,
  } = fd;
  const input = document.createElement('textarea');
  input.name = name;
  input.value = value || '';
  if (placeholder) {
    input.setAttribute('placeholder', placeholder);
  }
  if (isRequired === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

/**
 * Creates a select element based on the Field data
 * @param {object} fd - field data object
 * @param {string} fd.Field - field name
 * @param {string} fd.Value - field value
 * @param {string} fd.Placeholder - field placeholder
 * @param {string} fd.Mandatory - 'x' means required
 * @returns {HTMLSelectElement} HTMLSelectElement
 */
function createSelect(fd) {
  const {
    Field: name,
    Value: value,
    Placeholder: placeholder,
    Mandatory: isRequired,
  } = fd;
  const select = document.createElement('select');
  select.name = name;
  select.value = value || '';
  if (placeholder) {
    const ph = document.createElement('option');
    ph.textContent = placeholder;
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
  if (isRequired === 'x') {
    select.setAttribute('required', 'required');
  }
  return select;
}

/**
 * Creates a select element based on the Field data
 * @param {object} fd - field data object
 * @param {string} fd.Field - id
 * @param {string} fd.Label - field text
 * @param {string} fd.Extra - a link text
 * @param {string} fd.Mandatory - 'x' means required
 * @returns {HTMLLabelElement} HTMLLabelElement
 */
function createLabel(fd) {
  const {
    Field: id,
    Label: text,
    Extra: linkString,
    Mandatory: isRequired,
  } = fd;
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = text;
  if (isRequired === 'x') {
    label.classList.add('required');
  }
  if (linkString) {
    const [linkText, href] = linkString.split(',').map((str) => str.trim());
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

/**
 * Show or hide each form field depending of its rule in a none Marketo form
 * @param {object} form
 * @param {Array<object>} rules
 * @returns {void}
 */
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

/**
 * Returns an array with the functions to create the elements of a certain field type
 * @param {string} type filed type
 * @returns {Array<Function>} create[element] functions
 */
function getFieldFunctionsByType(type) {
  const defaultFieldType = [createLabel, createInput];
  const fieldType = {
    select: [createLabel, createSelect],
    heading: [createHeading],
    checkbox: [createInput, createLabel],
    'text-area': [createLabel, createTextArea],
    submit: [createButton],
  };

  return fieldType[type] ?? defaultFieldType;
}

/**
 * Creates a form passed by parameters if it is not a Marketo one
 * @param {string} formURL
 * @returns {Promise<HTMLFormElement>} Promise<HTMLFormElement>
 */
async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  [form.dataset.action] = pathname.split('.json');
  json.data.forEach((fd) => {
    // fd stands for field data
    const type = fd.Type || 'text';
    const { Style: theme, Rules: fieldRules } = fd;
    const fieldWrapper = document.createElement('div');
    const style = theme ? ` form-${theme}` : '';
    const fieldClass = `form-${type}-wrapper${style}`;
    fieldWrapper.className = fieldClass;
    fieldWrapper.classList.add('field-wrapper');

    getFieldFunctionsByType(type).forEach((createField) => fieldWrapper.append(createField(fd)));

    if (fieldRules) {
      try {
        rules.push({ fieldId: fieldClass, rule: JSON.parse(fieldRules) });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fieldRules}: ${error}`);
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
 * @param {object} mktoForm
 * @return {void}
 */
function removeDefaultFormStyles(mktoForm) {
  const formEl = mktoForm.getFormElem()[0];
  const formStyleElements = formEl.querySelectorAll('[style]');

  formEl.removeAttribute('style');
  formStyleElements.forEach((element) => element.removeAttribute('style'));

  // Remove all default Marketo stylesheets
  const { styleSheets } = document;

  [...styleSheets].forEach((styleSheet) => {
    const styleSheetId = styleSheet.ownerNode.getAttribute('id');
    const ids = ['mktoForms2BaseStyle', 'mktoForms2ThemeStyle'];
    if (ids.includes(styleSheetId) || formEl.contains(styleSheet.ownerNode)) {
      styleSheet.disabled = true;
    }
  });
}

/**
 * Marketo uses the same ids for the same fields. To allow multiple forms, we append a random
 * value to the default input ids
 * @param {object} form
 * @returns {void}
 */
function fixFieldLabelAssociation(form) {
  const formEl = form.getFormElem()[0];
  const randomValue = `-${Date.now()}${Math.random()}`;
  const labelElements = formEl.querySelectorAll('label[for]');

  labelElements.forEach((labelElement) => {
    const forEl = formEl.querySelector(`[id='${labelElement.htmlFor}'],
       [id='${labelElement.htmlFor}${randomValue}']`);
    if (forEl) {
      forEl.setAttribute('data-orig-id', labelElement.htmlFor);
      forEl.id = forEl.id.includes(randomValue)
        ? forEl.id
        : forEl.id + randomValue;
      labelElement.htmlFor = forEl.id;
    }
  });
}

/**
   * By default all checkboxes and radio buttons are right aligned in Marketo Forms. This function
   * moves these elements to the left side.
   * @param {object} form
   * @return {void}
   */
function moveCheckboxesToTheLeft(form) {
  const formEl = form.getFormElem()[0];
  const formRowElements = formEl.querySelectorAll('.mktoFormRow');

  formRowElements.forEach((formRowElement) => {
    // Get all checkboxes and radio buttons within form row
    const formCheckboxEl = formRowElement.querySelectorAll('input[type=checkbox], input[type=radio]');
    const hasOnlyOneCheckbox = formCheckboxEl && formCheckboxEl.length === 1;

    // Check if there's only one of these elements in that row to ensure to only transform single
    // checkbox / radio button elements
    if (hasOnlyOneCheckbox) {
      const formCheckboxLabel = formRowElement.querySelectorAll(`label[for="${formCheckboxEl[0].getAttribute('name')}"],
         label[for="${formCheckboxEl[0].getAttribute('id')}"]`);

      // Check if second label element is empty which should be the case for all single
      // checkbox / radio button elements
      if (formCheckboxLabel[1].textContent === '') {
        formCheckboxLabel[1].innerHTML = formCheckboxLabel[0].innerHTML;
        formCheckboxLabel[0].innerHTML = '';
      }
    }
  });
}

/**
 * Transform asterisk element into text in order to fix styling issues for rich-text
 * labels. The asterisks for non-required fields are removed.
 * @param {object} form
 * @param {string} [pos='right'] 'right' or 'left'
 * @returns {void}
 */
function adjustAsterisk(form, pos = 'right') {
  const formEl = form.getFormElem()[0];
  const formFieldWrapElements = formEl.querySelectorAll('.mktoFieldWrap');
  const asteriskPos = pos === 'left' ? 'left' : 'right';

  formFieldWrapElements.forEach((formFieldWrapEl) => {
    const isNotAdjusted = formFieldWrapEl.dataset.asteriskAdjusted !== 'true';
    if (isNotAdjusted) {
      const isRequired = formFieldWrapEl.classList.contains('mktoRequiredField');
      const asteriskEl = formFieldWrapEl.querySelector('.mktoAsterix');
      if (asteriskEl) {
        const asteriskParentEl = asteriskEl.parentNode;
        asteriskParentEl.removeChild(asteriskEl);
        if (isRequired) {
          const labelHTML = asteriskParentEl.innerHTML;
          asteriskParentEl.innerHTML = asteriskPos === 'left' ? `* ${labelHTML}` : `${labelHTML} *`;
        }

        formFieldWrapEl.dataset.asteriskAdjusted = true;
      }
    }
  });
}

/**
 * Get closest parent element by selector
 * @param {element} el
 * @param {string} selector
 * @returns {element|null}
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

/**
 * Attach a Success Message at Flied elements
 * @param {object} block
 * @param {object} form
 */
function attachSuccessMessage(block, form) {
  const fieldsetElements = form.getFormElem()[0].querySelectorAll('fieldset');
  let successMessage = false;

  [...fieldsetElements].every((fieldsetElement) => {
    const legendEl = fieldsetElement.querySelector('legend');
    if (legendEl.textContent === 'Success Message') {
      const hasInputEl = fieldsetElement.querySelector('input, select, textarea') !== null;
      const htmlTextEl = fieldsetElement.querySelector('.mktoHtmlText');
      if (!hasInputEl && htmlTextEl) {
        const rowEl = getClosest(fieldsetElement, '.mktoFormRow');
        rowEl.parentNode.removeChild(rowEl);
        successMessage = htmlTextEl.innerHTML;
        return false;
      }
    }
    return true;
  });

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
      const [, formId] = target.hash.split(/\/mkt[Ff]orm\//);
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
      if (block.classList.contains('gdpr')) {
        await import('./gdpr.js');
        loadCSS('/blocks/form/gdpr.css');
      }
      else if (block.classList.contains('gdpr-confirmation')) {
        await import('./gdpr-confirmation.js'); // calling confirmation js
        loadCSS('/blocks/form/gdpr.css'); 
      }
    }
  } catch (error) {
    block.innerHTML = window.location.hostname.endsWith('.page')
      ? `Invalid form configuration: ${error}`
      : '<!-- invalid form configuration -->';
    console.error(error); // eslint-disable-line no-console
  }
}
