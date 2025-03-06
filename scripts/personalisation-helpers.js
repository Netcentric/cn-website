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

export {
  handleHardReload,
  isValidJSON,
  getImageURL
}