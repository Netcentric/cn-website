async function handleHardReload(url) {
  window.location.href = url + '?nocache=' + Math.random()*1e5;
}

function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function getImageURL(imageUrl) {
  const validHosts = ['www.netcentric.biz', 'rockstar.moment-innovation.com']
  const url = new URL(imageUrl);
  if (validHosts.includes(url.hostname)) {
    return url.pathname;
  }
  return imageUrl;
}

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

export {
  handleHardReload,
  isValidJSON,
  getImageURL,
  getCookie
}