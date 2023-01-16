function triggerSearchEndpoint(event, pattern) {
  const { detail: { data: { status: { webPath } } } } = event;
  const url = pattern.replace('{{path}}', encodeURIComponent(webPath));
  return fetch(url, {
    method: 'POST',
    mode: 'no-cors',
  });
}

function triggerSearchIngest(event) {
  try {
    const { detail: { data: { config: { searchApiEndpoints: { ingest } } } } } = event;
    triggerSearchEndpoint(event, ingest);
  } catch (e) {
    console.error('error while triggering search ingest', e); // eslint-disable-line no-console
  }
}

function triggerSearchDelete(event) {
  try {
    const { detail: { data: { config: { searchApiEndpoints: { delete: d } } } } } = event;
    triggerSearchEndpoint(event, d);
  } catch (e) {
    console.error('error while triggering search delete', e); // eslint-disable-line no-console
  }
}

function triggerSearchUpdate(event) {
  try {
    const { detail: { data: { status: { live: { status } } } } } = event;
    if (status === 404) {
      triggerSearchDelete(event);
    } else {
      triggerSearchIngest(event);
    }
  } catch (e) {
    console.error('error while triggering updating search', e); // eslint-disable-line no-console
  }
}

function initSidekickExtension(sk) {
  sk.addEventListener('custom:cn-publish', triggerSearchIngest);
  sk.addEventListener('custom:cn-unpublish', triggerSearchDelete);
  sk.addEventListener('custom:cn-delete', triggerSearchDelete);
  sk.addEventListener('custom:cn-search-update', triggerSearchUpdate);
}

function getSidekick() {
  return document.querySelector('helix-sidekick');
}

(function bootstrap() {
  const sk = getSidekick();
  if (sk) {
    initSidekickExtension(sk);
  } else {
    document.addEventListener('helix-sidekick-ready', () => {
      initSidekickExtension(getSidekick());
    }, { once: true });
  }
}());
