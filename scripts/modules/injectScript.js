export default function injectScript(src) {
  window.scriptsLoaded = window.scriptsLoaded || [];

  if (window.scriptsLoaded.indexOf(src)) {
    const head = document.querySelector('head');
    const script = document.createElement('script');

    script.src = src;
    script.setAttribute('async', 'true');
    head.append(script);
    window.scriptsLoaded.push(src);
  }
}
