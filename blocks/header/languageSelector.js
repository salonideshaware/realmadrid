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

function createLanguageDropdown(languages, languageButtonContent, currentLanguage) {
  const languageDropdown = document.createElement('ul');
  languageDropdown.classList.add('language-selector-dropdown');

  const languageButtonItem = document.createElement('li');
  languageButtonItem.classList.add('language-button-item');
  languageButtonItem.appendChild(document.createRange()
    .createContextualFragment(languageButtonContent));
  languageDropdown.appendChild(languageButtonItem);
  languageButtonItem.addEventListener('click', (e) => {
    e.preventDefault();
    languageDropdown.classList.toggle('visible');
  }, false);

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

  const currentLanguage = getLanguage();
  console.log(currentLanguage);

  const languageButtonContent = `
    <svg focusable="false" width="16" height="16" aria-hidden="true">
      <use xlink:href="/blocks/header/landing-sprite.svg#lang"></use>
    </svg>
    <span>${currentLanguage.substring(0, 2)}</span>
    <svg focusable="false" width="16" height="16" aria-hidden="true">
      <use xlink:href="/blocks/header/cibeles-sprite.svg#chevron-up"></use>
    </svg>
  `;

  languageSelectorButton.appendChild(document.createRange()
    .createContextualFragment(languageButtonContent));

  const languageDropdown = createLanguageDropdown(
    languages,
    languageButtonContent,
    currentLanguage,
  );

  languageSelectorButton.addEventListener('click', (e) => {
    e.preventDefault();
    languageDropdown.classList.toggle('visible');
  }, false);

  languageSelector.appendChild(languageSelectorButton);
  languageSelector.appendChild(languageDropdown);
}
