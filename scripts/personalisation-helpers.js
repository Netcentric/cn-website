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

export {
  handleHardReload,
  isValidJSON
}