const root = document.documentElement;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const descriptionMeta = document.querySelector('meta[name="description"]');
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const supportedLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja'];

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

darkModeQuery.addEventListener('change', applySystemTheme);
