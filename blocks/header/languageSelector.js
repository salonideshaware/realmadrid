const SITE_URL = 'https://app-rm-spa-web-stg.azurewebsites.net';
const DEFAULT_LANGUAGE = 'es-ES';

function getLanguage() {
  const { pathname } = new URL(window.location.href);
  const urlParts = pathname.split('/');
  if (urlParts.length > 1 && urlParts[urlParts.length - 1]) {
    return urlParts[urlParts.length - 1];
  }
  return DEFAULT_LANGUAGE;
}

function createLanguageDropdown(languages) {
  const languageDropdown = document.createElement('ul');
  languageDropdown.classList.add('language-selector-dropdown');

  const currentLanguage = getLanguage();
  console.log(currentLanguage);

  for (let i = 0; i < languages.length; i += 1) {
    const languageItem = document.createElement('li');
    languageItem.classList.add('language-selector-item');
    if (languages[i].code === currentLanguage) {
      languageItem.classList.add('current');
    }
    languageItem.innerHTML = `
      <a href="${SITE_URL}/${languages[i].code}">${languages[i].label}</a>
      <svg focusable="false" width="22" height="22" aria-hidden="true">
        <use xlink:href="/blocks/header/cibeles-sprite.svg#check"></use>
      </svg>
    `;
    languageDropdown.appendChild(languageItem);
  }

  return languageDropdown;
}

export default function createLanguageSelectorButton(parent, languages) {
  const languageSelector = document.createElement('div');
  languageSelector.classList.add('language-selector');
  parent.appendChild(languageSelector);

  const languageSelectorButton = document.createElement('button');
  languageSelectorButton.id = 'language-selector-button';
  languageSelectorButton.classList.add('language-selector-button');

  const languageDropdown = createLanguageDropdown(languages);

  languageSelectorButton.appendChild(document.createRange().createContextualFragment(`
    <svg focusable="false" width="16" height="16" aria-hidden="true">
      <use xlink:href="/blocks/header/landing-sprite.svg#lang"></use>
    </svg>
    <span>ES</span>
    <svg focusable="false" width="16" height="16" aria-hidden="true">
      <use xlink:href="/blocks/header/cibeles-sprite.svg#chevron-up"></use>
    </svg>
  `));

  languageSelectorButton.addEventListener('click', (e) => {
    e.preventDefault();
    languageDropdown.classList.toggle('visible');
  }, false);

  languageSelector.appendChild(languageSelectorButton);
  languageSelector.appendChild(languageDropdown);
}
