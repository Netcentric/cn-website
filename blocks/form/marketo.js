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

export default function decorate(block, target) {
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
}
