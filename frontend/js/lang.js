// Translation dictionaries
const translations = {
  fi: {
    home: "Etusivu",
    menu: "Ruokalista",
    info: "Tietoa",
    contact: "Yhteystiedot",
    searchPlaceholder: "Etsi ruokia...",
    brand: "TK",
    language: "Kieli:",
    loginTitle: "Kirjaudu sisään",
    namePlaceholder: "Nimi (vain rekisteröinti)",
    emailPlaceholder: "Sähköposti",
    passwordPlaceholder: "Salasana",
    student: "Opiskelija (saat alennuksia)",
    login: "Kirjaudu",
    register: "Rekisteröidy",
    welcome: "Tervetuloa, ",
    adminPanel: "⚙️ Hallintapaneeli",
    logout: "Kirjaudu ulos",
    heroTitle: "Tervetuloa Apricukseen",
    heroSubtitle: "Ainutlaatuisia makuelämyksiä sydämessä kaupunkia",
    exploreMenu: "Tutustu ruokalistaan",
    readMore: "Lue lisää",
    filterFoods: "Suodata ruokia",
    diet: "Ruokavalio",
    vegan: "🌱 Vegaani",
    vegetarian: "🥬 Kasvisruoka",
    glutenFree: "🌾 Gluteeniton"
  },
  en: {
    home: "Home",
    menu: "Menu",
    info: "Info",
    contact: "Contact",
    searchPlaceholder: "Search foods...",
    brand: "TK",
    language: "Language:",
    loginTitle: "Sign In",
    namePlaceholder: "Name (registration only)",
    emailPlaceholder: "Email",
    passwordPlaceholder: "Password",
    student: "Student (get discounts)",
    login: "Login",
    register: "Register",
    welcome: "Welcome, ",
    adminPanel: "⚙️ Admin Panel",
    logout: "Logout",
    heroTitle: "Welcome to Apricus",
    heroSubtitle: "Unique taste experiences in the heart of the city",
    exploreMenu: "Explore Menu",
    readMore: "Read More",
    filterFoods: "Filter Foods",
    diet: "Diet",
    vegan: "🌱 Vegan",
    vegetarian: "🥬 Vegetarian",
    glutenFree: "🌾 Gluten-Free"
  }
};

function updateLanguage(lang) {
  // تحديث العناصر التي تحمل خاصية data-i18n
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });
  // دعم العناصر القديمة
  if (document.querySelector('.main-navigation a[href="#etusivu"]'))
    document.querySelector('.main-navigation a[href="#etusivu"]').textContent = translations[lang].home;
  if (document.querySelector('.main-navigation a[href="#menu"]'))
    document.querySelector('.main-navigation a[href="#menu"]').textContent = translations[lang].menu;
  if (document.querySelector('.main-navigation a[href="#tietoa"]'))
    document.querySelector('.main-navigation a[href="#tietoa"]').textContent = translations[lang].info;
  if (document.querySelector('.main-navigation a[href="#yhteystiedot"]'))
    document.querySelector('.main-navigation a[href="#yhteystiedot"]').textContent = translations[lang].contact;
  if (document.getElementById('searchInput'))
    document.getElementById('searchInput').placeholder = translations[lang].searchPlaceholder;
  if (document.querySelector('.brand-text'))
    document.querySelector('.brand-text').textContent = translations[lang].brand;
  if (document.querySelector('label[for="langSelect"]'))
    document.querySelector('label[for="langSelect"]').textContent = translations[lang].language;
  // تحديث القائمة حسب اللغة
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
