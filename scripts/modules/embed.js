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

function createEmbedWrap(a, vendor) {
    const div = document.createElement('div');
    div.classList.add(`${vendor}-base`);

    a.style.display = 'none';
    a.insertAdjacentElement('afterend', div);
}

export function preDecorateEmbed(main) {
    const anchors = main.getElementsByTagName('a');
    const youTubeAnchors = Array.from(anchors).filter((a) => a.href.includes('youtu'));
    const spotifyAnchors = Array.from(anchors).filter((a) => a.href.includes('spotify'));
    const wistiaAnchors = Array.from(anchors).filter((a) => a.href.includes('wistia'));

    window.embedAnchors = {
        youTubeAnchors,
        spotifyAnchors,
        wistiaAnchors,
    };

    youTubeAnchors.forEach((a) => {
        createEmbedWrap(a, 'youtube');
    });
    spotifyAnchors.forEach((a) => {
        createEmbedWrap(a, 'spotify');
    });
    wistiaAnchors.forEach((a) => {
        createEmbedWrap(a, 'wistia');
    });
}