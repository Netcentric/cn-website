import { createCardsList } from '../blog-posts/blog-posts.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  loadCSS('/blocks/blog-posts/blog-card.css');

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
