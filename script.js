const root = document.documentElement;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const descriptionMeta = document.querySelector('meta[name="description"]');
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const languageSelect = document.getElementById('languageSelect');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
const supportedLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja'];
const languageStorageKey = 'longshang-language';
const themeStorageKey = 'longshang-theme';

function updateThemeControl(theme) {
    if (!themeToggle) {
        return;
    }

    const isDark = theme === 'dark';

    themeToggle.setAttribute('aria-pressed', String(isDark));

    if (themeIcon) {
        themeIcon.textContent = isDark ? '☾' : '☼';
    }
}

function applyTheme(theme) {
    const resolvedTheme = theme === 'dark' ? 'dark' : 'light';

    root.dataset.theme = resolvedTheme;
    updateThemeControl(resolvedTheme);

    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', resolvedTheme === 'dark' ? '#080b12' : '#4f46e5');
    }
}

function getSystemTheme() {
    return darkModeQuery.matches ? 'dark' : 'light';
}

function detectTheme() {
    const savedTheme = localStorage.getItem(themeStorageKey);

    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }

    return getSystemTheme();
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
    const savedLanguage = localStorage.getItem(languageStorageKey);

    if (supportedLanguages.includes(savedLanguage)) {
        return savedLanguage;
    }

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

    if (languageSelect) {
        languageSelect.value = language;
    }
}

applyTheme(detectTheme());
applyLanguage(detectLanguage());

darkModeQuery.addEventListener('change', () => {
    if (!localStorage.getItem(themeStorageKey)) {
        applyTheme(getSystemTheme());
    }
});

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';

        localStorage.setItem(themeStorageKey, nextTheme);
        applyTheme(nextTheme);
    });
}

if (languageSelect) {
    languageSelect.addEventListener('change', (event) => {
        const selectedLanguage = event.target.value;

        localStorage.setItem(languageStorageKey, selectedLanguage);
        applyLanguage(selectedLanguage);
    });
}
