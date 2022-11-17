export default function decorate(block) {
    const videoId = block.textContent.trim();
    const wrap = document.createElement('div');
    const video = document.createElement('iframe');

    wrap.classList.add('youtube__base');
    video.classList.add('youtube__iframe');
    video.setAttribute('width', '100%');
    video.setAttribute('src', `https://www.youtube.com/embed/${videoId}?showinfo=0`);
    video.setAttribute('allow', 'autoplay; encrypted-media');
    video.setAttribute('allowfullscreen', 'true');
    block.innerHTML = '';
    wrap.append(video);
    block.append(wrap);
}