import { getMetadata } from './lib-franklin.js';

const defaultAuthor = { name: 'Cognizant Netcentric', role: '', image: '/icons/nc.svg' };
let authors = false;

// TODO use in related-blogs?
export default async function getAuthors() {
  if (authors) {
    return authors;
  }

  authors = (async () => {
    const response = await fetch('/profiles/query-index.json');
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('error loading profile blog', response);
      return { data: [] };
    }
    return response.json();
  })().then((json) => {
    const metadata = getMetadata('authors').split(',');
    const result = metadata.map((author) => ({
      ...defaultAuthor,
      ...json.data.find((element) => element.name.trim() === author.trim()),
    }));
    return result.length > 0 ? result : [];
  });
  return authors;
}
