import { buildBlogFooter } from '../../blocks/blog-footer/blog-footer.js';

function buildBlogSidebar(main) {
  const blogpost = main.querySelector('.blogpost > main > div:nth-child(2)');
  if (blogpost === null) {
    return;
  }

  const sidebar = document.createElement('div');
  sidebar.classList.add('blog-sidebar');
  blogpost.prepend(sidebar);
}

export default function buildAutoBlocks() {
  const main = document.querySelector('main');
  buildBlogFooter(main);
  buildBlogSidebar(main);
}
