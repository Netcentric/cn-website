import { loadCSS, toClassName } from '../../scripts/lib-franklin.js';

export async function getProfile() {
  const authors = document.head.querySelector('meta[name="authors"]').content;
  const profile = {};
  let profileQuery = '/profiles/';
  profileQuery += toClassName(authors);
  profileQuery += '.plain.html';
  const response = await fetch(profileQuery);
  const profileResponse = await response.text();
  if (response.ok) {
    const parser = new DOMParser();
    const pdoc = parser.parseFromString(profileResponse, 'text/html');
    const name = pdoc.querySelector('h1');
    const title = pdoc.querySelector('h3');
    const image = pdoc.querySelector('body > div > p > picture > img');
    profile.name = name.innerHTML;
    profile.title = title.innerHTML;
    profile.image = image.getAttribute('src');
  }
  return profile;
}

export async function buildBlogFooter(main) {
  loadCSS('/blocks/blog-footer/blog-footer.css');
  // detect presence of blog content
  const blogpost = main.querySelector('.blogpost > main > div:nth-child(2)');
  if (blogpost === null) {
    return;
  }
  const bFooter = document.createElement('div');
  bFooter.setAttribute('itemtype', 'http://schema.org/WPFooter');
  const shareFooter = document.createElement('div');
  shareFooter.setAttribute('data-nc', 'Share');
  shareFooter.setAttribute('class', 'share-base share-big');
  shareFooter.innerHTML = `<span class="share-header">SHARE</span>
        <ul class="share-list">
            <li class="share-item">
                <a href="http://www.facebook.com/share.php?u=${window.location.href}" class="share-link share-facebook" target="_blank" rel="noopener noreferrer">
                    <i class="icons icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 70 70"><path d="M28.84 31.16v-3.08c0-4.51 3.34-8.12 7.43-8.12h5v6.1h-5A1.77 1.77 0 0035.05 28v3.19h6.21v6.21h-6.21v15.05h-6.21V37.37h-5v-6.21h5z"></path></svg>
                    </i>
                </a>
            </li>
            <li class="share-item">
                <a href="http://www.twitter.com/share?url=${window.location.href}&amp;text=${document.title}" class="share-link share-twitter" target="_blank" rel="noopener noreferrer">
                    <i class="icons icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 70 70"><path d="M46.77 29.89v.74c0 8.55-6.42 18.26-18.16 18.26A17.93 17.93 0 0118.8 46a14.51 14.51 0 001.54.05 12.52 12.52 0 007.91-2.71 6.34 6.34 0 01-5.95-4.46 4.41 4.41 0 001.17.16 8.23 8.23 0 001.7-.21A6.47 6.47 0 0120 32.54v-.05a6.47 6.47 0 003 .74 6.12 6.12 0 01-2.87-5.31 6.54 6.54 0 01.87-3.24 17.81 17.81 0 0013.17 6.69A6.1 6.1 0 0134 30a6.45 6.45 0 016.37-6.48 6.36 6.36 0 014.67 2A13.48 13.48 0 0049.11 24a7 7 0 01-2.81 3.5 13.27 13.27 0 003.66-1 15.79 15.79 0 01-3.19 3.39z"></path></svg>
                    </i>
                </a>
            </li>
            <li class="share-item">
                <a href="http://www.linkedin.com/shareArticle?mini=true&amp;url=${window.location.href}&amp;title=${document.title}&amp;source=netcentric.biz" class="share-link share-linkedIn" target="_blank" rel="noopener noreferrer">
                    <i class="icons icon-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 70 70"><path d="M28 22.61a3.67 3.67 0 01-3.66 3.66 3.62 3.62 0 01-3.61-3.66 3.67 3.67 0 013.61-3.72A3.72 3.72 0 0128 22.61zM21.37 49V28.45h5.95V49h-5.95zm14.76-20.55v1a8.78 8.78 0 017.64.21 8.17 8.17 0 014 6.85V49h-5.85V36.47a2.19 2.19 0 00-1-1.7c-2.34-1.33-4.78 1.06-4.78 1.06V49h-5.95V28.45h5.95z"></path></svg>
                    </i>
                </a>
            </li>
            <li class="share-item">
                <a href="mailto:?subject=How to master delivering content at scale&amp;body=${window.location.href}" class="share-link share-mail" target="_blank" rel="noopener noreferrer">
                    <i class="icons icon-wrapper ">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70"><path d="M49 23H21c-1.3 0-2.3 1-2.3 2.3v19.4c0 1.3 1 2.3 2.3 2.3h28c1.3 0 2.3-1 2.3-2.3V25.3c0-1.3-1-2.3-2.3-2.3zm-.5 4.7v14.2l-7.1-7.1 7.1-7.1zm-19.9 7.1l-7.1 7.1V27.7l7.1 7.1zM23 44.2l7.5-7.5 4.5 4.5 4.4-4.5 7.5 7.5H23zm12-6.9L23.5 25.8h23L35 37.3z"></path></svg>
                    </i>
                </a>
            </li>
        </ul>`;
  bFooter.append(shareFooter);
  const shareTopics = document.createElement('div');
  shareTopics.setAttribute('class', 'blogfooter-base');
  const shareHeaderSpan = document.createElement('span');
  shareHeaderSpan.setAttribute('class', 'blogfooter-header');
  shareHeaderSpan.innerText = 'TOPICS';
  shareTopics.append(shareHeaderSpan);
  const shareSpan = document.createElement('span');
  shareSpan.setAttribute('class', 'blogfooter-topics');

  // get the configured tags
  const tags = document.head.querySelectorAll('meta[property="article:tag"]');
  tags.forEach((tag, index) => {
    const topic = document.createElement('a');
    topic.setAttribute('class', 'blogfooter-topics-link');
    let linkHref = '/insights/blog?tag_filter=';
    linkHref += toClassName((tag.getAttribute('content')));
    topic.setAttribute('href', linkHref);
    topic.innerText = tag.getAttribute(('content'));

    shareSpan.append(topic);
    if ((index + 1) !== (tags.length)) {
      shareSpan.append(', ');
    }
  });

  shareTopics.append(shareSpan);
  bFooter.append(shareTopics);
  const hrFooter = document.createElement('hr');
  hrFooter.setAttribute('class', 'line-base');
  bFooter.append(hrFooter);
  const blogfooterAuthor = document.createElement('div');
  blogfooterAuthor.setAttribute('class', 'blogfooter-authorprofile');
  const author = await getProfile();
  blogfooterAuthor.innerHTML = `<div>
                <div class="authorprofile-base">
                    <div class="authorprofile-image">
                        <div class="nc-image-base">
                            <div class="nc-image-container" itemtype="http://schema.org/ImageObject">
                                <img class="nc-image" src="${author.image ?? '/icons/nc.svg'}" itemprop="contentUrl" alt="" sizes="10vw">
                            </div>
                        </div>
                    </div>
                    <div class="authorprofile-info">
                        <p class="authorprofile-name">${author.name ?? 'Cognizant Netcentric'}</p>
                        <p class="authorprofile-position">${author.title ?? ''}</p>
                        <ul class="authorprofile-socialnetworks">
                            <li class="authorprofile-socialnetwork">
                                <a href="https://twitter.com/netcentricHQ" target="_blank" rel="noopener noreferrer">
                                    <i class="icons icon-wrapper ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31.05 31.05"><g data-name="Capa 2"><path d="M15.53 0a15.53 15.53 0 1015.52 15.52A15.52 15.52 0 0015.53 0zM22 12.24v.39a9.44 9.44 0 01-14.55 8 7.3 7.3 0 00.81 0 6.47 6.47 0 004.11-1.41 3.29 3.29 0 01-3.1-2.31 2.55 2.55 0 00.61.08 4.42 4.42 0 00.89-.11 3.36 3.36 0 01-2.69-3.27 3.28 3.28 0 001.53.39 3.16 3.16 0 01-1.49-2.76 3.37 3.37 0 01.45-1.69A9.24 9.24 0 0015.42 13a2.82 2.82 0 01-.09-.71 3.35 3.35 0 013.31-3.37 3.29 3.29 0 012.43 1 6.9 6.9 0 002.11-.79A3.59 3.59 0 0121.72 11a6.86 6.86 0 001.9-.52A8.12 8.12 0 0122 12.24z" data-name="Capa 1"></path></g></svg>
                                    </i>
                                </a>
                            </li>
                            <li class="authorprofile-socialnetwork">
                                <a href="https://www.linkedin.com/company/cognizantnetcentric" target="_blank" rel="noopener noreferrer">
                                    <i class="icons icon-wrapper ">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g data-name="Capa 2"><path d="M16 0a16 16 0 1016 16A16 16 0 0016 0zm-3.33 23.23H9.82v-9.87h2.85zm-1.43-10.91a1.75 1.75 0 01-1.73-1.75 1.77 1.77 0 011.73-1.79A1.79 1.79 0 0113 10.56a1.77 1.77 0 01-1.76 1.76zm11.25 10.91h-2.81v-6a1 1 0 00-.48-.81c-1.12-.64-2.29.5-2.29.5v6.33h-2.86v-9.89h2.85v.48a4.22 4.22 0 013.67.1 3.94 3.94 0 011.92 3.29z" data-name="Capa 1"></path></g></svg>
                                    </i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>`;
  if (author.name) {
    // strip out the social networks for non-nc profiles
    blogfooterAuthor.querySelector('.authorprofile-socialnetworks').remove();
  }
  bFooter.append(blogfooterAuthor);
  blogpost.appendChild(bFooter);
}

export default async function decorate(block) {
  // do nothing - auto blocked
  block.innerHTML = '';
}
