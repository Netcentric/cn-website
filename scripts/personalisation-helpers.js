async function handleHardReload(url) {
  await fetch(url+ '?nocache=' + Math.random()*1e5|0);
  window.location.href = url;
  // This is to ensure reload with url's having '#'
  window.location.reload();
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