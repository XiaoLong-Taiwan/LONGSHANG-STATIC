const root = document.documentElement;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const descriptionMeta = document.querySelector('meta[name="description"]');
const mainSiteOriginMeta = document.querySelector('meta[name="main-site-origin"]');
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const supportedLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja'];
const allowedInternalHosts = ['longshang.pro', 'static.longshang.pro'];
const dashboardUrl = 'https://longshang.pro/dashboard';

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
    try {
        if (window.self !== window.top) {
            window.top.location.href = dashboardUrl;
        } else {
            window.location.href = dashboardUrl;
        }
    } catch (error) {
        window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
    }
}

window.openExternal = openExternal;
window.openDashboard = openDashboard;

function getMainSiteOrigin() {
    const configuredOrigin = mainSiteOriginMeta ? mainSiteOriginMeta.getAttribute('content').trim() : '';

    if (configuredOrigin) {
        return configuredOrigin.replace(/\/$/, '');
    }

    if (document.referrer) {
        try {
            return new URL(document.referrer).origin;
        } catch (error) {
            return window.location.origin;
        }
    }

    return window.location.origin;
}

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

        if (link.hasAttribute('data-dashboard-link')) {
            link.href = dashboardUrl;
            link.removeAttribute('target');
            link.removeAttribute('rel');
            link.addEventListener('click', (event) => {
                event.preventDefault();
                setOpeningState(link);
                openDashboard();
            });
            return;
        }

        if (link.hasAttribute('data-internal-link')) {
            const internalUrl = link.getAttribute('data-internal-link');
            link.href = internalUrl;
            link.removeAttribute('target');
            link.removeAttribute('rel');
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

darkModeQuery.addEventListener('change', applySystemTheme);
