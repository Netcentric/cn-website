function debounce(func) {
  let timer;

  return () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(func, 100);
  };
}

class ExpandingCards {
  timer = null;

  indexCurrentCardOpen = null;

  constructor(block) {
    this.block = block;

    this.wrap = document.createElement('ul');
    this.wrap.classList.add('expanding-cards-wrap');

    this.nav = document.createElement('ul');
    this.nav.classList.add('expanding-cards-nav');

    this.parentElement = this.block.parentElement;

    this.cards = [];
    this.cardsText = [];
    this.navItems = [];
  }

  init() {
    this.decorate();

    this.addEvents();

    this.startAnimation();
  }

  setCurrentCardOpen(value) {
    if (this.indexCurrentCardOpen !== null) {
      this.cards[this.indexCurrentCardOpen].classList.remove('expanding-cards-item-active');
      this.navItems[this.indexCurrentCardOpen].classList.remove('expanding-cards-nav-item-active');
    }

    this.cards[value].classList.add('expanding-cards-item-active');
    this.navItems[value].classList.add('expanding-cards-nav-item-active');

    this.indexCurrentCardOpen = value;
  }

  decorate() {
    this.processBlock();
    this.addWrapNavToDOM();
  }

  processBlock() {
    [...this.block.children].forEach((row, index) => {
      const [card, cardText] = this.createCard(row.children, index);
      this.wrap.append(card);
      this.cards.push(card);
      this.cardsText.push(cardText);

      const navItem = this.createNavItem(index);
      this.nav.append(navItem);
      this.navItems.push(navItem);
    });
  }

  addWrapNavToDOM() {
    this.parentElement.append(this.wrap, this.nav);

    this.block.remove();

    this.setCurrentCardOpen(0);

    // wait a frame to read the correct width
    requestAnimationFrame(() => {
      this.updateCardWidth();
      this.updateTextWidth(0);
    });
  }

  updateTextWidth(index) {
    this.cardsText[index].style.width = `${this.openCardWidth / 2}px`;
  }

  createCard([image, content, text], index) {
    const li = document.createElement('li');
    li.classList.add('expanding-cards-item');

    image.classList.add('expanding-cards-image');
    content.classList.add('expanding-cards-content');
    text.classList.add('expanding-cards-text');
    content.append(text);

    li.append(content, image);

    li.addEventListener('click', this.jumpToCard.bind(this, index));

    return [li, text];
  }

  createNavItem(index) {
    const li = document.createElement('li');
    li.classList.add('expanding-cards-nav-item');

    const button = document.createElement('button');
    button.datasetJumpTo = index;
    button.innerHTML = `<span class="visuallyhidden">${index + 1}</span>`;
    button.addEventListener('click', (event) => {
      const i = parseInt(event.currentTarget.datasetJumpTo, 10);
      this.jumpToCard(i);
    });

    li.append(button);

    return li;
  }

  addEvents() {
    const stopAnimationBind = this.stopAnimation.bind(this);
    const startAnimationBind = this.startAnimation.bind(this);

    this.parentElement.addEventListener('mouseenter', stopAnimationBind);
    this.parentElement.addEventListener('focusin', stopAnimationBind);
    this.parentElement.addEventListener('focusout', startAnimationBind);
    this.parentElement.addEventListener('mouseleave', startAnimationBind);

    window.addEventListener('resize', debounce(this.updateCardWidth.bind(this)));
  }

  updateCardWidth() {
    const cardOpen = this.parentElement.querySelector('.expanding-cards-item-active');
    this.openCardWidth = cardOpen.getBoundingClientRect().width;
  }

  startAnimation() {
    // be sure we don't have an animation already triggered by addEvents()
    this.stopAnimation();

    this.timer = setInterval(() => {
      this.nextCard();
    }, 5000);
  }

  stopAnimation() {
    clearInterval(this.timer);
  }

  jumpToCard(value) {
    if (this.indexCurrentCardOpen !== value) {
      this.setCurrentCardOpen(value);
      this.updateTextWidth(value);
    }
  }

  nextCard() {
    let value = this.indexCurrentCardOpen + 1;

    if (value === this.cards.length) {
      value = 0;
    }

    this.jumpToCard(value);
  }
}

export default function decorate(block) {
  const cards = new ExpandingCards(block);
  cards.init();
}
