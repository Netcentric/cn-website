const accept = '/accept';
const urlProd = 'https://api.netcentric.biz/gdpr';
const urlBase = urlProd;

/**
 * get url parameters
 */
const urlParams = new URL('https://www.netcentric.biz/legal/gdpr/confirmation.html?data=12JBYvkhK7wL6e3VKb6797jN7oAHMVI2eafHoe8eEdo%3D&init=tLyDuutMdlPcIvcm').searchParams;
const paramdata = urlParams.get('data');
const paraminit = urlParams.get('init');

/**
 * Send a query to the GDPR API and save the apiKey to localStorage for further calls
 * form fields */
async function acceptresult() {
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
    const resdata = await response.text();
    if (response.ok) {
      window.open('/thank-you');
    } else {
      const { message } = JSON.parse(resdata);
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
acceptresult.call();
