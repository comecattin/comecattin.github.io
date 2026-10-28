/* Measure the header and progressively enhance mobile sections as a carousel. */
(() => {
    const nav = document.querySelector('.navigation-index');
    const compactNavigation = matchMedia('(max-width: 64rem)');
    const mobile = matchMedia('(max-width: 48rem)');
    const updateNavigationHeight = () => {
        const height = nav && compactNavigation.matches ? nav.offsetHeight : 0;
        document.documentElement.style.setProperty('--navigation-height', `${height}px`);
    };
    updateNavigationHeight();
    window.addEventListener('resize', updateNavigationHeight);
    if (nav && 'ResizeObserver' in window) new ResizeObserver(updateNavigationHeight).observe(nav);

    const sections = [...document.querySelectorAll('body > section')];
    if (sections.length < 2) return;

    const controls = document.createElement('div');
    controls.className = 'card-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Section navigation');
    controls.innerHTML = '<button type="button" aria-label="Previous section">&#8592;</button><span class="card-status" aria-live="polite" aria-atomic="true"></span><button type="button" aria-label="Next section">&#8594;</button>';
    sections[0].before(controls);
    const [previous, next] = controls.querySelectorAll('button');
    const status = controls.querySelector('.card-status');
    let current = 0;
    let touchStart = null;
    let transitioning = false;

    function sectionForHash() {
        if (!location.hash) return -1;
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return -1; }
        const target = document.getElementById(id);
        return target ? sections.findIndex(section => section.contains(target)) : -1;
    }

    function render() {
        const enabled = mobile.matches;
        document.body.classList.toggle('carousel-ready', enabled);
        sections.forEach((section, index) => { section.hidden = enabled && index !== current; });
        previous.disabled = current === 0;
        next.disabled = current === sections.length - 1;
        const heading = sections[current].querySelector('h1, h2, h3');
        status.textContent = `${current + 1} / ${sections.length} · ${heading ? heading.textContent.trim().replace(/\s+/g, ' ') : 'Section'}`;
    }

    function select(index, moveToTop) {
        if (transitioning || index < 0 || index >= sections.length || index === current) return;
        const direction = index > current ? 1 : -1;
        const outgoing = sections[current];
        const finish = () => {
            current = index;
            document.documentElement.style.setProperty('--card-entry-offset', `${direction * 8}px`);
            render();
            if (moveToTop) window.scrollTo(0, 0);
            transitioning = false;
        };
        if (moveToTop && mobile.matches && outgoing.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
            transitioning = true;
            outgoing.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: .7, transform: `translateX(${-direction * 8}px)` }], { duration: 120, easing: 'ease-in', fill: 'none' }).finished.then(finish, finish);
        } else {
            finish();
        }
    }

    previous.addEventListener('click', () => select(current - 1, true));
    next.addEventListener('click', () => select(current + 1, true));
    document.addEventListener('touchstart', event => {
        if (mobile.matches && event.touches.length === 1 && event.target.closest('body > section')) {
            touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }
    }, { passive: true });
    document.addEventListener('touchend', event => {
        if (!touchStart || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        touchStart = null;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) select(current + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!mobile.matches || !link || link.hash.length < 2) return;
        let id;
        try { id = decodeURIComponent(link.hash.slice(1)); } catch (_) { return; }
        const target = document.getElementById(id);
        const index = target ? sections.findIndex(section => section.contains(target)) : -1;
        if (index < 0) return;
        event.preventDefault();
        history.pushState(null, '', link.hash);
        select(index, false);
        target.scrollIntoView();
    });
    window.addEventListener('hashchange', () => {
        const index = sectionForHash();
        if (index >= 0) { current = index; render(); }
    });
    window.addEventListener('resize', render);
    const initial = sectionForHash();
    if (initial >= 0) current = initial;
    render();
})();
