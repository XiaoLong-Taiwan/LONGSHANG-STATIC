const root = document.documentElement;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const descriptionMeta = document.querySelector('meta[name="description"]');
const mainSiteOriginMeta = document.querySelector('meta[name="main-site-origin"]');
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const supportedLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja'];

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

darkModeQuery.addEventListener('change', applySystemTheme);
