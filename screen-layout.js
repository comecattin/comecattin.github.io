/* Keep section and anchor offsets in sync with the compact navigation. */
(() => {
    const nav = document.querySelector('.navigation-index');
    if (!nav) return;

    const compactNavigation = matchMedia('(max-width: 64rem)');
    const updateNavigationHeight = () => {
        const height = compactNavigation.matches ? nav.offsetHeight : 0;
        document.documentElement.style.setProperty('--navigation-height', `${height}px`);
    };

    updateNavigationHeight();
    window.addEventListener('resize', updateNavigationHeight);
    if ('ResizeObserver' in window) new ResizeObserver(updateNavigationHeight).observe(nav);
})();
