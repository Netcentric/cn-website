const defaultAuthorName = 'Cognizant Netcentric';
const defaultAuthorRole = '';
const defaultAuthorImage = '/icons/nc.svg';

function buildCard(card) {
  const {
    title, profiles: authorProfile,
  } = card;

  const cardElement = document.createElement('li');
  cardElement.classList.add('testimonial-card');

  if (authorProfile.image === '') authorProfile.image = defaultAuthorImage;

  cardElement.innerHTML = `
    <h2 class="quote">
      ${title}
    </h2>
    <div class="authorprofile-container">
      <img class="nc-image" src="${authorProfile.image ?? defaultAuthorImage}" itemprop="contentUrl" alt="" sizes="10vw" width="85" height="85" />
      <div class="authorprofile-name">${authorProfile.name ?? defaultAuthorName}</div>
      <div class="authorprofile-position">${authorProfile.role ?? defaultAuthorRole}</div>
    </div>`;

  return cardElement;
}

function createCardsList(parent, cards) {
  const blogList = document.createElement('ul');

  cards.forEach((card) => {
    blogList.appendChild(buildCard(card));
  });

  parent.appendChild(blogList);
}

export default async function decorate(block) {
  const cards = [...block.children].map((child) => {
    const profilePicture = child.querySelector('picture > img').getAttribute('src');
    const textContainer = child.children[1];

    const quote = textContainer.children[0].textContent;
    const name = textContainer.children[1].textContent;
    const role = textContainer.children[2].textContent;

    return {
      title: quote,
      profiles: {
        name,
        role,
        image: profilePicture,
      },
    };
  });

  block.innerHTML = '';

  createCardsList(block, cards);
}
