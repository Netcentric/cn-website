const accept = '/accept';
const urlProd = 'https://api.netcentric.biz/gdpr';
const urlBase = urlProd;

/**
 * get url parameters
 */
const urlParams = new URL("https://www.netcentric.biz/legal/gdpr/confirmation.html?data=12JBYvkhK7wL6e3VKb6797jN7oAHMVI2eafHoe8eEdo%3D&init=tLyDuutMdlPcIvcm").searchParams;
const paramdata = urlParams.get('data');
const paraminit = urlParams.get('init');
const confirm = true;

/**
 * Send a query to the GDPR API and save the apiKey to localStorage for further calls
 * @param {{paramdata:string, paraminit:string, confirm:string}} result form fields
 */
async function acceptresult(result) {
  const { paramdata, paraminit, confirm } = result;
  const url = urlBase + accept;
  const options = {
    method: 'PUT',
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      data: "paramdata",
      init: "paraminit",
      confirm: "true"
  })
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
    // Show a message below the form, in the feedback section
    console.log(error);

    // eslint-disable-next-line no-console
    console.error(
      `%cError sending the data: %c${error}`,
      'color:#f88; background-color:#290002',
      'color:white; background-color:#290002',
    );
  }
}

