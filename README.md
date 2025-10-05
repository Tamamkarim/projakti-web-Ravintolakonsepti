# 🍽️ Apricus - Kahvila & Ravintola

Moderni web-sovellus ravintolan hallintaan asiakaspalveluineen ja kehittyneellä hallintatyökaluineen.

## 📋 Ominaisuudet

- 🎯 Moderni ja käyttäjäystävällinen käyttöliittymä
- 📱 Responsiivinen design kaikille laitteille
- 🛒 Ostoskorijärjestelmä
- 👨‍💼 Hallintapaneeli
- 🔐 Tunnistautumis- ja rekisteröintijärjestelmä
- 📊 Ruokalistojen ja reseptien hallinta

## 🏗️ Projektin rakenne

```
├── 📁 Backend/          # Palvelinpuolen sovellus
│   ├── server.js        # Pääpalvelintiedosto
│   ├── package.json     # Backend-riippuvuudet
│   ├── database/        # Tietokanta
│   ├── middleware/      # Välikerros
│   └── routes/          # API-reitit
├── 📁 frontend/         # Käyttöliittymä
│   ├── index.html       # Pääsivu
│   ├── admin.html       # Hallintapaneeli
│   ├── assets/          # Kuvat ja staattiset tiedostot
│   ├── css/            # Tyylitiedostot
│   └── js/             # JavaScript-tiedostot
└── 📁 docs/            # Dokumentaatio ja viitteet
```

## 🚀 Nopea käynnistys

### Edellytykset
- Node.js (versio 14 tai uudempi)
- npm

### Riippuvuuksien asennus
```bash
npm run install-all
```

### Kehityspalvelimen käynnistys
```bash
npm run dev
```

### Vain backend-palvelimen käynnistys
```bash
npm run backend
```

### Tuotantopalvelimen käynnistys
```bash
npm start
```

## 🌐 Linkit

- 🏠 Pääsivu: `http://localhost:3000`
- ⚙️ Hallintapaneeli: `http://localhost:3000/admin.html`

## 🔧 Kehitysympäristö

Voit luoda `.env`-tiedoston pääkansioon seuraavilla muuttujilla:

```
PORT=3000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## 🍽️ Ravintolan tiedot

**Apricus - Kahvila & Ravintola**
- 📍 Osoite: Makuja-katu 12, Helsinki
- 📞 Puhelin: +358 12 345 6789
- ✉️ Sähköposti: info@apricus.fi

### Aukioloajat
- **Ma-Pe:** 10:00 - 22:00
- **La:** 11:00 - 23:00
- **Su:** 12:00 - 21:00

## 🎨 Käytetyt teknologiat

- **Frontend:** Vanilla JavaScript, CSS3, HTML5
- **Backend:** Node.js, Express.js
- **Tietokanta:** Muistitietokanta (skaalautuva)
- **Autentikointi:** JWT (JSON Web Tokens)
- **Tyylit:** Moderni CSS Grid ja Flexbox

## 🔧 Saatavilla olevat komennot

```bash
# Asenna kaikki riippuvuudet
npm run install-all

# Käynnistä kehityspalvelin automaattisella uudelleenkäynnistyksellä
npm run dev

# Käynnistä vain backend
npm run backend

# Käynnistä tuotanto
npm start

# Siivoa projekti
npm run clean
```

## 🤝 Osallistuminen

Osallistuminen on tervetullutta! Luo Pull Request tai avaa Issue ehdotuksia varten.

## 📄 Lisenssi

Tämä projekti on lisensoitu ISC-lisenssin alaisuudessa.

## 🚀 Kehitysideoita

### Tulevat ominaisuudet:
1. **Pöytävaraukset:** Verkossa tapahtuva pöytävarausjärjestelmä
2. **Arvostelut:** Ruokien arvostelujärjestelmä
3. **Kotiinkuljetus:** Integraatio toimituspalveluihin
4. **Kanta-asiakasohjelma:** Pisteet ja palkinnot

### Tekniset parannukset:
1. **PWA:** Parannettu Service Worker
2. **Maksut:** Oikeiden maksujärjestelmien integrointi
3. **Analytiikka:** Google Analytics
4. **Testit:** Automaattiset testit
5. **SEO:** Hakukoneoptimoinni

## 📞 Tuki

Teknisen tuen tai virheiden ilmoittamista varten:
- Luo Issue GitHubissa
- Ota yhteyttä kehittäjään: Tamam

---

**Kehitetty ❤️:lla suomalaisille makuelämyksille**

**Apricus** - *Ainutlaatuisia makuelämyksiä sydämessä kaupunkia*