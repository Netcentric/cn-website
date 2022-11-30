import { decorateIcons } from '../../scripts/lib-franklin.js';

class CarouselSlider {
  constructor(element, options) {
    const defaults = {
      elementsPerSlide: 6,
      transitionTime: '1s',
    };
    this.element = element;
    this.options = options || defaults;
    this.wrap = this.element.querySelector('.slider-wrap');
    this.originalElements = Array.from(this.element.querySelectorAll('.slider-element'));
    this.slideCounter = 0;
    this.inTransition = false;
  }

  init() {
    if (this.originalElements.length > this.options.elementsPerSlide) {
      this.setStyles();
      this.setElements();
      this.reorderSlides();
      this.setControls();
      this.addEventListeners();
    }
  }

  setStyles() {
    this.element.style.setProperty('--slide-transform', '0');
    this.element.style.setProperty('--transition', `transform ${this.options.transitionTime}`);
    this.wrap.style.setProperty('transform', 'translateX(var(--slide-transform))');
    this.wrap.style.setProperty('transition', 'var(--transition)');
  }

  setControls() {
    this.element.setAttribute('tabindex', '0');
    this.prevButton = document.createElement('button');
    this.nextButton = document.createElement('button');
    this.prevButton.innerHTML = '<span class="icon icon-chevron-right"></span><span class="visuallyhidden">Previous</span>';
    this.nextButton.innerHTML = '<span class="icon icon-chevron-right"></span><span class="visuallyhidden">Next</span>';
    this.element.prepend(this.prevButton);
    this.element.append(this.nextButton);
    decorateIcons(this.element);
  }

  setElements() {
    const width = this.element.offsetWidth;
    const elementWidth = width / this.options.elementsPerSlide;
    let elementsLength = this.originalElements.length;
    let clonesNumber = 0;
    let i = 0;
    let indexToAppend;
    let elementToAppend;

    this.wrap.innerHTML = '';

    if (this.options.elementsPerSlide * 3 > elementsLength) {
      clonesNumber = elementsLength;
      while (this.options.elementsPerSlide * 3 > clonesNumber) {
        clonesNumber += clonesNumber;
      }
    }
    for (i; i < elementsLength + clonesNumber; i++) {
      indexToAppend = i % elementsLength;
      elementToAppend = this.originalElements[indexToAppend].cloneNode(true);
      elementToAppend.style.width = `${elementWidth}px`;
      this.wrap.append(elementToAppend);
    }
    elementsLength += clonesNumber;
    this.slidesNumber = Math.floor(elementsLength / this.options.elementsPerSlide);
    this.wrap.style.width = `${elementWidth * (elementsLength)}px`;
  }

  addEventListeners() {
    this.wrap.addEventListener('transitionend', this.reorderSlides.bind(this));
    this.prevButton.addEventListener('click', this.move.bind(this, 'left'));
    this.nextButton.addEventListener('click', this.move.bind(this, 'right'));
    this.element.addEventListener('keydown', this.keyboardNavigation.bind(this));
  }

  getTransformValue() {
    return Number(this.element.style.getPropertyValue('--slide-transform').replace('px', ''));
  }

  moveLeft(transformValue) {
    this.element.style.setProperty(
      '--slide-transform',
      `${transformValue + this.wrap.children[this.slideCounter].scrollWidth * this.options.elementsPerSlide}px`,
    );
    this.slideCounter--;
  }

  moveRight(transformValue) {
    this.element.style.setProperty(
      '--slide-transform',
      `${transformValue - this.wrap.children[this.slideCounter].scrollWidth * this.options.elementsPerSlide}px`,
    );
    this.slideCounter++;
  }

  move(direction) {
    if (this.inTransition) {
      return;
    }

    const transformValue = this.getTransformValue();
    this.element.style.setProperty('--transition', `transform ${this.options.transitionTime}`);
    this.inTransition = true;

    if (direction === 'left') {
      this.moveLeft(transformValue);
    } else if (direction === 'right') {
      this.moveRight(transformValue);
    }
  }

  reorderSlides() {
    const transformValue = this.getTransformValue();
    let i = 0;
    this.element.style.setProperty('--transition', 'none');

    if (this.slideCounter === this.slidesNumber - 1) {
      for (i; i < this.options.elementsPerSlide; i++) {
        this.wrap.appendChild(this.wrap.firstElementChild);
      }
      this.moveLeft(transformValue);
    } else if (this.slideCounter === 0) {
      for (i; i < this.options.elementsPerSlide; i++) {
        this.wrap.prepend(this.wrap.lastElementChild);
      }
      this.moveRight(transformValue);
    }
    this.inTransition = false;
  }

  keyboardNavigation(e) {
    switch (e.key) {
      case 'ArrowLeft':
        this.move('left');
        break;
      case 'ArrowRight':
        this.move('right');
        break;
    }
  }
}

function waitForAppear(block) {
  const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const slider = new CarouselSlider(block);
        slider.init();
        intersectionObserver.unobserve(document.body);
      }
    });
  });

  intersectionObserver.observe(document.body);
}

export default function decorate(block) {
  const elements = Array.from(block.children);
  const wrap = document.createElement('div');

  block.classList.add('slider-base');
  wrap.classList.add('slider-wrap');
  elements.forEach((element) => {
    element.classList.add('slider-element');
    wrap.append(element);
  });
  block.innerHTML = '';
  block.append(wrap);
  waitForAppear(block);
}
