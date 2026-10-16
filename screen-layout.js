/* Keep compact snap pages readable by flowing whole entries onto extra screens.
   The original markup remains the no-JavaScript/large-screen reading layout. */
(() => {
    const originals = [...document.querySelectorAll('body > section')].map(section => section.cloneNode(true));
    const compact = matchMedia('(max-width: 64rem), (max-height: 38rem)');
    let resizeTimer;
    let firstLayout = true;

    function layout() {
        const currentPage = [...document.querySelectorAll('body > section')]
            .find(section => section.getBoundingClientRect().bottom > innerHeight / 2);
        const currentSource = currentPage?.dataset.screenSource;
        document.querySelectorAll('body > section').forEach(section => section.remove());
        const sections = originals.map(section => section.cloneNode(true));
        sections.forEach((section, index) => { section.dataset.screenSource = index; });
        document.body.append(...sections);
        const screenHeight = document.documentElement.clientHeight;
        const nav = document.querySelector('.navigation-index');
        const navHeight = matchMedia('(max-width: 64rem)').matches ? nav.offsetHeight : 0;
        document.documentElement.style.setProperty('--screen-height', `${screenHeight}px`);
        document.documentElement.style.setProperty('--navigation-height', `${navHeight}px`);
        if (compact.matches) for (const section of sections) {
            const container = section.querySelector('.container');
            const heading = container.querySelector(':scope > h1, :scope > h2, :scope > h3');
            const blocks = [...container.children].filter(block => block !== heading);
            blocks.forEach(block => block.remove());
            let page = section;
            let content = container;

            const fits = () => {
                const style = getComputedStyle(page);
                const available = screenHeight - navHeight
                    - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
                return content.getBoundingClientRect().height <= available + 1;
            };
            const nextPage = () => {
                const next = section.cloneNode(false);
                const nextContent = container.cloneNode(false);
                if (heading) {
                    const title = heading.cloneNode(true);
                    // Only the original title owns an anchor destination.
                    title.removeAttribute('id');
                    title.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
                    nextContent.append(title);
                }
                next.append(nextContent);
                page.after(next);
                page = next;
                content = nextContent;
            };

            for (const block of blocks) {
                if (block.matches('ul, ol')) {
                    let list = block.cloneNode(false);
                    content.append(list);
                    for (const item of [...block.children]) {
                        list.append(item);
                        if (!fits() && (list.children.length > 1 || content.children.length > 2)) {
                            item.remove();
                            if (!list.children.length) list.remove();
                            nextPage();
                            list = block.cloneNode(false);
                            list.append(item);
                            content.append(list);
                        }
                    }
                } else {
                    content.append(block);
                    if (!fits() && content.children.length > (heading ? 2 : 1)) {
                        block.remove();
                        nextPage();
                        content.append(block);
                    }
                }
            }
        }
        const anchor = firstLayout && location.hash
            ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
        const destination = anchor?.closest('section')
            || sections.find(section => section.dataset.screenSource === currentSource);
        if (destination && (!firstLayout || anchor)) destination.scrollIntoView();
        firstLayout = false;
        document.documentElement.dataset.screenLayout = 'ready';
    }

    const imagesReady = [...document.images].map(image => image.decode().catch(() => {}));
    Promise.all([document.fonts.ready, ...imagesReady]).then(layout);
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(layout, 150);
    });
})();
