export class ScrollIndicator {
    constructor() {
        this.container = document.createElement('div');
        this.bar = document.createElement('div');
    }

    init() {
        this.decorate();
        window.addEventListener('scroll', this.checkScroll.bind(this), { passive: true });
    }

    decorate() {
        this.container.classList.add('scroll-indicator-container');
        this.bar.classList.add('scroll-indicator-bar');
        this.container.append(this.bar);
        document.body.prepend(this.container);
    }

    checkScroll() {
        const pageScroll = window.scrollY;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollValue = (pageScroll / height) * 100;
        this.bar.style.width = `${scrollValue}%`;
    }
}