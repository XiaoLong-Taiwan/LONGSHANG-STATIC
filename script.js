const root = document.documentElement;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const descriptionMeta = document.querySelector('meta[name="description"]');
const mainSiteOriginMeta = document.querySelector('meta[name="main-site-origin"]');
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const supportedLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja'];
const allowedInternalHosts = ['longshang.pro', 'static.longshang.pro'];

function getMainSiteOrigin() {
    const configuredOrigin = mainSiteOriginMeta ? mainSiteOriginMeta.getAttribute('content').trim() : '';

    return (configuredOrigin || 'https://longshang.pro').replace(/\/$/, '');
}

function getMainSiteUrl(path) {
    return new URL(path, `${getMainSiteOrigin()}/`).href;
}

function isEmbedded() {
    try {
        return window.self !== window.top;
    } catch (error) {
        return true;
    }
}

function openExternal(url) {
    try {
        const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');

        if (!openedWindow) {
            window.location.href = url;
        }
    } catch (error) {
        window.location.href = url;
    }
}

function openDashboard() {
    openInternalPath('/dashboard');
}

function openInternalPath(path) {
    const url = getMainSiteUrl(path);

    try {
        if (window.self !== window.top) {
            window.top.location.href = url;
        } else {
            window.location.href = url;
        }
    } catch (error) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

window.openExternal = openExternal;
window.openDashboard = openDashboard;
window.openInternalPath = openInternalPath;

function applyMainSiteLinks() {
    const mainSiteOrigin = getMainSiteOrigin();

    document.querySelectorAll('[data-main-link]').forEach((link) => {
        const path = link.dataset.mainLink;

        if (path) {
            link.href = new URL(path, mainSiteOrigin).href;
        }
    });
}

function isAllowedInternalUrl(url) {
    return allowedInternalHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

function setOpeningState(link) {
    link.classList.add('is-opening');

    window.setTimeout(() => {
        link.classList.remove('is-opening');
    }, 1200);
}

function applySafeLinkBehavior() {
    document.querySelectorAll('a[href]').forEach((link) => {
        let url;

        try {
            url = new URL(link.getAttribute('href'), window.location.href);
        } catch (error) {
            return;
        }

        if (link.hasAttribute('data-internal-path')) {
            const internalPath = link.getAttribute('data-internal-path');
            link.href = getMainSiteUrl(internalPath);
            link.removeAttribute('target');
            link.removeAttribute('rel');
            link.addEventListener('click', (event) => {
                event.preventDefault();
                setOpeningState(link);
                openInternalPath(internalPath);
            });
            return;
        }

        if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'tg:') {
            const isExternal = !isAllowedInternalUrl(url);

            if (isExternal || link.hasAttribute('data-external-link')) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    setOpeningState(link);
                    openExternal(link.href);
                });
            }
        }
    });
}

function applyScrollLinks() {
    document.querySelectorAll('[data-scroll-target]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const targetName = link.getAttribute('data-scroll-target');
            const target = document.querySelector(`[data-section="${targetName}"]`);

            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function applySystemTheme(eventOrQuery) {
    const isDark = eventOrQuery.matches;

    root.dataset.theme = isDark ? 'dark' : 'light';

    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#080b12' : '#4f46e5');
    }
}

function normalizeBrowserLanguage(language) {
    const normalized = language.toLowerCase();

    if (normalized.startsWith('zh')) {
        if (normalized.includes('cn') || normalized.includes('sg') || normalized.includes('hans')) {
            return 'zh-Hans';
        }

        return 'zh-Hant';
    }

    if (normalized.startsWith('ja')) {
        return 'ja';
    }

    return 'en';
}

function detectLanguage() {
    const browserLanguages = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || 'en'];

    for (const browserLanguage of browserLanguages) {
        const detectedLanguage = normalizeBrowserLanguage(browserLanguage);

        if (supportedLanguages.includes(detectedLanguage)) {
            return detectedLanguage;
        }
    }

    return 'en';
}

function applyLanguage(language) {
    const translations = window.LONGSHANG_LANGUAGES[language] || window.LONGSHANG_LANGUAGES.en;

    root.lang = translations.htmlLang;
    document.title = translations.title;

    if (descriptionMeta) {
        descriptionMeta.setAttribute('content', translations.description);
    }

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.dataset.i18n;

        if (Object.prototype.hasOwnProperty.call(translations, key)) {
            element.innerHTML = translations[key];
        }
    });
}

applySystemTheme(darkModeQuery);
applyLanguage(detectLanguage());
applyMainSiteLinks();
applySafeLinkBehavior();
applyScrollLinks();

darkModeQuery.addEventListener('change', applySystemTheme);
