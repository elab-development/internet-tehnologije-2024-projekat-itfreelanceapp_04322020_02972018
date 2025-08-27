# cat.dev_ — platforma za IT freelance usluge

cat.dev_ je web aplikacija koja povezuje kupce i prodavce IT usluga kroz **gig** ponude, **licitacije (bidove)** i transparentno upravljanje **porudžbinama**. Projekat je podeljen na **Laravel REST API** (backend) i **React SPA** (frontend), sa modernim UI-jem zasnovanim na Material UI komponentama i dijagramima (Recharts).

![Logo](./it-freelance-app-react/public/images/logo.png)

---

## ✨ Glavne funkcionalnosti

- **Katalog gig-ova:** pregled, pretraga, filtriranje i sortiranje usluga.
- **Detalj giga:** opis, ocena, feedback, kontakt podaci prodavca i **kutija za poručivanje**.
- **Licitacije (bid):** kupac pri „Order now” vidi *osnovnu cenu* i *trenutno najviši bid* (sa imenom vodećeg kupca), unosi višu ponudu i predaje je kao porudžbinu sa statusom `pending`.
- **Zaključavanje pobedničke cene:** prodavac za dati gig može jednu porudžbinu označiti `completed` → sve ostale porudžbine za taj gig se automatski `cancelled`, a na samom gig-u se „Order now” **zaključava** i ispisuje se pobednik.
- **Moji gig-ovi (prodavac):** kreiranje/uređivanje/brisanje, pregled porudžbina po gig-u.
- **Moje porudžbine (kupac):** pregled statusa, izostavljanje/ostavljanje ocene i komentara po završetku.
- **App Metrics (administrator):** kartice sa ukupnim brojem porudžbina, prihodom i raspodelom statusa + **jedan Recharts dijagram** (npr. Orders by Status).
- **Izvoz porudžbina u Excel:** administratorsko preuzimanje `orders.xlsx`.

---

## 👤 Uloge korisnika

- **Neulogovani korisnik** – vidi javne stranice i katalog; pri pokušaju pristupa zaštićenim rutama preusmerava se na prijavu/registraciju.
- **Kupac (buyer)** – pregleda gig-ove, **licitira**, kreira porudžbine, prati statuse i po završetku ostavlja **rating/feedback**.
- **Prodavac (seller)** – kreira i uređuje svoje gig-ove, vidi porudžbine na njima i **zaključava pobedničku cenu**.
- **Administrator** – ima uvid u sve metrike i koristi **izvoz porudžbina u Excel**.

---

## 🧱 Arhitektura

- **Backend:** Laravel + Sanctum (token autentikacija), Eloquent ORM, validacije, resursi (`JsonResource`) i servisi za licitacije.
- **Frontend:** React (SPA) + Material UI (MUI) + Recharts (jedan dijagram na metrikama) + Lottie (pozadinske animacije).
- **Baza:** MySQL/MariaDB sa migracijama, fabrikama i seeder-ima.

---

## 🧪 Model licitacija (bidova)

- Svaka porudžbina (`orders`) ima **price** (ponuđena cena/bid) i **status** (`pending`, `completed`, `cancelled`).
- **Najviši bid** po gig-u dobija se `MAX(price)` nad `orders` gde `status != cancelled`.
- **Zaključavanje**: kada prodavac markira jednu porudžbinu `completed`, sve ostale porudžbine za taj gig se automatski `cancelled` i gig više **ne prima porudžbine**.

---

## 🔌 Ključni API endpoint-i (skraćeno)

> Sve rute su pod `/api` i štite se preko **Sanctum** middleware-a.

- Autentikacija: `POST /login`, `POST /register`, `POST /logout`
- Gig-ovi:  
  - `GET /gigs` (katalog, uz opcioni `?category=`)  
  - `GET /gigs/{id}` (detalj)  
  - `POST /gigs` (seller)  
  - `PUT /gigs/{id}` (seller, uređivanje)  
  - `DELETE /gigs/{id}` (seller)  
  - `GET /my-gigs` (seller – samo njegovi gig-ovi)  
  - `PATCH /gigs/{id}/rating` (buyer – ostavljanje ocene/feedback-a)
- Porudžbine / licitacije:  
  - `GET /orders` (buyer: svoje; seller: za svoje gig-ove; admin: sve)  
  - `POST /orders` (buyer – kreiranje porudžbine/bida: `{ gig_id, price }`)  
  - `PATCH /orders/{id}/status` (`pending|completed|cancelled`)
- Administracija:  
  - `GET /admin/orders/metrics` (karte + Recharts)  
  - `GET /admin/orders/export` (preuzimanje `orders.xlsx`)
- **(Opciono, ako je uključeno):** `GET /gigs/{gigId}/bids-summary` – vraća *highest_bid*, *leader_name*, *is_locked*, *winner_name/winner_price* (koriste ga modal i „Order box”).

---

## 🧰 Tehnologije

**Backend**
- Laravel 10, Sanctum (API tokeni)
- Eloquent ORM (relacije: User–Gig–Order)
- Maatwebsite/Excel (izvoz)
- PHP 8.2+

**Frontend**
- React 18 (Vite/CRA), React Router
- Material UI (MUI) dizajn sistem
- Recharts (jedan dijagram na App Metrics stranici)
- Lottie animacije
- Fetch API/async hooks

---

## 🌐 Javni web servisi

- **Avatar u navigaciji:** *pravatar.cc* (ili sličan placeholder) – dinamično generiše profilne slike bez otpremanja fajlova.
- **Vremenska prognoza (App Metrics):** *Open-Meteo API* – bez API ključa, prikazuje temperaturu i osnovne meteo podatke u posebnoj kartici.

---

## 📈 App Metrics + Recharts

Na stranici metrika prikazujemo:
- **Total Orders**, **Total Revenue** (sa razlaganjem po statusima),
- **Weather** karticu (Open-Meteo),
- **Orders by Status** – **jedan Recharts dijagram** (stubičasti) koji vizuelno sabira `completed/pending/cancelled`.

Administratorsko dugme **Export Orders** koristi rutu `GET /admin/orders/export` i preuzima `orders.xlsx`.

---

## 🚀 Pokretanje projekta (lokalno)

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2024-projekat-itfreelanceapp_04322020_02972018.git
```
2. Pokrenite backend:
```bash
   cd it-freelance-app
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
```
    
3. Pokrenite frontend:
```bash
   cd it-freelance-app-react
   npm install
   npm start
```
    
4.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
