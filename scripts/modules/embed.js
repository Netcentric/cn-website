function createIframe(a, vendor) {
  const div = a.nextElementSibling;
  const embed = a.pathname;
  const id = embed.split('/').pop();
  let source;
  let className;
  let allow;

  a.remove();

  if (vendor === 'youtube') {
    source = `https://www.youtube.com/embed/${id}`;
    className = 'youtube-player';
    allow = 'encrypted-media; accelerometer; gyroscope; picture-in-picture';
  } else if (vendor === 'spotify') {
    source = `https://open.spotify.com/embed/episode/${id}`;
    className = 'spotify-player';
    allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  } else if (vendor === 'wistia') {
    source = `https://fast.wistia.net/embed/iframe/${id}`;
    className = 'wistia-player';
    allow = 'autoplay; clipboard-write; encrypted-media; fullscreen;';
  }

  div.innerHTML = `<iframe src="${source}" 
        class="${className}"
        allowfullscreen  
        allow="${allow}"
        loading="lazy">
    </iframe>`;
}

export function decorateEmbed() {
  window.embedAnchors?.youTubeAnchors?.forEach((a) => {
    createIframe(a, 'youtube');
  });
  window.embedAnchors?.spotifyAnchors?.forEach((a) => {
    createIframe(a, 'spotify');
  });
  window.embedAnchors?.wistiaAnchors?.forEach((a) => {
    createIframe(a, 'wistia');
  });
}
