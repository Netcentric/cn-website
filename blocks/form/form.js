import { loadCSS } from '../../scripts/lib-franklin.js';
import { isMarketoFormUrl } from '../../scripts/scripts.js';

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
    Field: name,
    Type: type,
    Label: text,
    Extra: redirectTo,
  } = fd;
  const button = document.createElement('button');
  button.name = name;
  button.textContent = text;
  button.classList.add('button');
  if (type === 'submit') {
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

function addExtraFormData(fd) {
  fd.form.dataset[fd.Field] = fd.Extra;
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
    button: [createButton],
    submit: [createButton],
    data: [addExtraFormData],
  };

  return fieldType[type] ?? defaultFieldType;
}

/**
 * Creates a form passed by parameters if it is not a Marketo one
 * @param {string} formURL
 * @returns {Promise<HTMLFormElement>} Promise<HTMLFormElement>
 */
async function createForm(formURL) {
  const { pathname } = formURL;
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  const rules = [];
  [form.dataset.action] = pathname.split('.json');
  json.data.forEach((fd) => {
    // fd stands for field data
    fd.form = form;
    const type = fd.Type || 'text';
    const { Style: theme, Rules: fieldRules } = fd;
    const style = theme ? ` form-${theme}` : '';
    const fieldClass = `form-${type}-wrapper${style}`;
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = fieldClass;
    fieldWrapper.classList.add('field-wrapper');

    getFieldFunctionsByType(type).forEach((createField) => {
      const field = createField(fd);
      if (field) {
        fieldWrapper.append(field);
      }
    });

    if (fieldRules) {
      try {
        rules.push({ fieldId: fieldClass, rule: JSON.parse(fieldRules) });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fieldRules}: ${error}`);
      }
    }
    if (fieldWrapper.children.length > 0) {
      form.append(fieldWrapper);
    }
  });
  form.addEventListener('change', () => applyRules(form, rules));
  applyRules(form, rules);

  return form;
}

async function loadFormExtension(jsName, cssName, parameters) {
  loadCSS(`/blocks/form/${cssName}.css`);
  const extension = await import(`./${jsName}.js`);
  await extension.default(...parameters);
}

export default async function decorate(block) {
  try {
    if (block.classList.contains('gdpr-confirmation')) {
      loadFormExtension('gdpr-confirmation', 'gdpr', [block]);
      return;
    }
    const link = block.querySelector('a[href]');
    const target = new URL(link?.href);
    if (isMarketoFormUrl(target)) {
      loadFormExtension('marketo', 'marketo', [block, target]);
    } else if (target.pathname.endsWith('.json')) {
      const form = await createForm(target);
      if (block.classList.contains('gdpr-encrypt')) {
        await loadFormExtension('gdpr-encrypt', 'gdpr', [form]);
      }
      block.replaceChildren(form);
    }
  } catch (error) {
    block.innerHTML = window.location.hostname.endsWith('.page')
      ? `Invalid form configuration: ${error}`
      : '<!-- invalid form configuration -->';
    console.error(error); // eslint-disable-line no-console
  }
}
