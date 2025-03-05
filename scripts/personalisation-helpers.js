async function handleHardReload(url) {
  await fetch(url, {
    headers: {
      Pragma: 'no-cache',
      Expires: '-1',
      'Cache-Control': 'no-cache',
    },
  });
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