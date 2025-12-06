// Translation dictionaries
const translations = {
  fi: {
    home: "Etusivu",
    menu: "Ruokalista",
    info: "Tietoa",
    contact: "Yhteystiedot",
    searchPlaceholder: "Etsi ruokia...",
    brand: "TK",
    language: "Kieli:"
  },
  en: {
    home: "Home",
    menu: "Menu",
    info: "Info",
    contact: "Contact",
    searchPlaceholder: "Search foods...",
    brand: "TK",
    language: "Language:"
  }
};

function updateLanguage(lang) {
  document.querySelector('.main-navigation a[href="#etusivu"]').textContent = translations[lang].home;
  document.querySelector('.main-navigation a[href="#menu"]').textContent = translations[lang].menu;
  document.querySelector('.main-navigation a[href="#tietoa"]').textContent = translations[lang].info;
  document.querySelector('.main-navigation a[href="#yhteystiedot"]').textContent = translations[lang].contact;
  document.getElementById('searchInput').placeholder = translations[lang].searchPlaceholder;
  document.querySelector('.brand-text').textContent = translations[lang].brand;
  document.querySelector('label[for="langSelect"]').textContent = translations[lang].language;
  // Päivitä ruokalista kielen mukaan
  if (typeof renderMenu === 'function') renderMenu();
}

// Event listener for language select
document.addEventListener('DOMContentLoaded', function() {
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', function() {
      updateLanguage(langSelect.value);
    });
    // Set initial language
    updateLanguage(langSelect.value);
  }
});
