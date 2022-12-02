import { loadCSS, readBlockConfig } from '../../scripts/lib-franklin.js';

function injectScript(src, block) {
  const script = document.createElement('script');
  script.src = src;
  script.setAttribute('defer', '');
  block.appendChild(script);
}

export default async function decorate(block) {
  const { form: formId } = readBlockConfig(block);
  block.innerHTML = '';

  loadCSS(
    'https://pages.netcentric.biz/rs/598-XRJ-385/images/netcentric-forms-rebranded.min.css',
  );

  const peCaptchaScript = document.createElement('script');
  peCaptchaScript.type = 'text/javascript';
  peCaptchaScript.text = 'if (!window._onReCAPTCHALoad) { window._isReCAPTCHALoaded = false; window._onReCAPTCHALoad = () => { window._isReCAPTCHALoaded = true; };}';
  block.appendChild(peCaptchaScript);

  const form = document.createElement('form');
  form.classList.add('mktoForm');
  form.setAttribute('data-form-id', formId);
  block.appendChild(form);

  injectScript(
    'https://www.google.com/recaptcha/api.js?render=explicit&onload=_onReCAPTCHALoad',
    block,
  );
  injectScript(
    'https://pages.netcentric.biz/js/forms2/js/forms2.min.js',
    block,
  );

  window.setTimeout(() => {
    injectScript(
      'https://pages.netcentric.biz/rs/598-XRJ-385/images/netcentric-forms.min.js',
      block,
    );

    console.log('marketo scripts loaded');
  }, 100);
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
  });
}
