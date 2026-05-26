export function applyTranslations(currentLang, translations) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = translations[currentLang]?.[key] || translations['el']?.[key];
        if (text) el.textContent = text;
    });
}

export function routeTo(tabName) {
    const tabs = ['homeTab', 'historyTab', 'formTab'];
    tabs.forEach(tab => document.getElementById(tab).classList.add('hidden'));
    document.getElementById(tabName).classList.remove('hidden');
}

export function initKeyboardEngine() {
    // Εδώ μεταφέρεις όλο το logic του keyboard που είχες
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('focus', () => document.getElementById('bottomNav').classList.add('nav-hidden'));
        input.addEventListener('blur', () => document.getElementById('bottomNav').classList.remove('nav-hidden'));
    });
}
