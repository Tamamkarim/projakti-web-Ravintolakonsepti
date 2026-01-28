# Backend-suunnitelma

## 1. Tietokanta

- Käytetään relaatiotietokantaa (esim. MySQL, PostgreSQL)
- Taulut: käyttäjät, tuotteet, tilaukset, tilausrivit
- Yhteys tietokantaan `db.js`-tiedostossa

## 2. API-rajapinta

- Node.js + Express
- REST-rajapinta: CRUD-toiminnot käyttäjille, tuotteille, tilauksille
- Autentikointi: JWT-tunnisteet, salasanan hash (bcrypt)
- Reitit: /api/users, /api/menu, /api/orders

## 3. Middleware

- Syötteen validointi (esim. `middleware/validation.js`)
- Virheenkäsittely
- CORS-tuki

## 4. Tietoturva

- Salasanojen hash (bcrypt)
- JWT-tunnisteet kirjautumiseen
- Inputin validointi ja sanitaatio

## 5. Tiedostojen lataus

- Mahdollisuus ladata kuvia (esim. tuotteille)
- Tallennus `public/uploads/`-kansioon

## 6. Testaus

- HTTP-pyyntöjen testaus (esim. Postman, test/api-test-requests.http)
- Yksikkötestit (esim. Jest, Mocha)

## 7. Dokumentaatio

- README.md ja tk.md sisältävät suunnitelmat ja ohjeet
- Koodikommentit ja esimerkkipyynnöt

## 8. Jatkokehitys

- Admin-paneeli tilauksille ja tuotteille
- Monikielisyys
- Responsiivinen käyttöliittymä

---

Tämä dokumentti toimii backendin kehityksen ja ylläpidon tukena.
