// eslint-disable-next-line import/no-cycle
import { configlIst } from './form.js';

const accept = '/accept';
const urlProd = configlIst[0];
const urlBase = urlProd;

/* get url parameters */
const curUrl = window.location.href;
const urlParams = new URLSearchParams(window.location.search);
const paramdata = urlParams.get('data');
const paraminit = urlParams.get('init');

function hasQueryParams() {
  return curUrl.toString().includes('?');
}

if (!hasQueryParams(curUrl)) {
  const btn = document.querySelector('.button');
  btn.setAttribute('disabled', '');
}

/**
 * Send a query to the GDPR API and save the apiKey to localStorage for further calls
 * form fields */
/* eslint-disable import/prefer-default-export */
export async function acceptresult() {
  const url = urlBase + accept;
  const options = {
    method: 'PUT',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      data: paramdata,
      init: paraminit,
      confirm: 'true',
    }),
  };
  try {
    const response = await fetch(url, options);
    const resData = await response.text();
    if (response.ok) {
      window.open(configlIst[1]);
    } else {
      const { message } = JSON.parse(resData);
      throw message;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `%cError sending the data: %c${error}`,
      'color:#f88; background-color:#290002',
      'color:white; background-color:#290002',
    );
  }
}
