# MotoWash 🛵

Platform Cuci Motor Digital — Full-Stack Web App dengan **Laravel 11** + **Vue 3** + **Tailwind CSS v4**

## Fitur Utama

- 🧑‍💼 **Multi-Role**: Pembeli (Customer), Pencuci (Washer), Admin — bisa switch live
- 📋 **Booking Motor**: Form lengkap dengan pilihan waktu, lokasi parkir, dan jenis layanan
- 🎫 **QR Ticket**: Tiket digital dengan QR code visual setelah booking
- 📡 **Antrean Live**: Status real-time dengan progress bar waktu cuci
- ⏱️ **Timer Pencuci**: Board tugas washer dengan ring timer dan progress aktif
- 📊 **Admin Panel**: Monitor kapasitas bay, panggil antrean, statistik pendapatan
- 🌙 **Dark & Light Mode**: Toggle tema dengan CSS variables
- 🔊 **Sound FX**: Notifikasi audio Web Audio API untuk booking & panggilan antrean
- 📱 **Fully Responsive**: Sidebar desktop + bottom nav mobile

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Laravel 11 + Sanctum API |
| Frontend | Vue 3 + Pinia + Vue Router |
| Styling | Tailwind CSS v4 + CSS Variables |
| Build | Vite 8 |
| Icons | Heroicons |
| DB | MySQL (via Laragon) |

## Quick Start

### 1. Setup Database

Buka **Laragon** → Start MySQL. Buat database `motowash`.

Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=motowash
DB_USERNAME=root
DB_PASSWORD=
```

### 2. Migrasi & Seed

```bash
php artisan migrate
php artisan db:seed
```

### 3. Jalankan Dev Server

Terminal 1 — Laravel:
```bash
php artisan serve
```

Terminal 2 — Vite (hot reload):
```bash
npm run dev
```

Buka **http://localhost:8000**

### 4. Demo Login Cepat

Di halaman login, klik salah satu tombol demo:

| Role | Email | Password |
|------|-------|----------|
| Pembeli | customer@motowash.id | password |
| Pencuci | washer@motowash.id | password |
| Admin | admin@motowash.id | password |

---

## Struktur Folder

```
motowash/
├── app/Http/Controllers/Api/
│   ├── AuthController.php          # Register, Login, Logout
│   ├── BookingController.php       # CRUD + Start/Finish Wash
│   └── QueueController.php         # Live Queue + Stats
├── app/Models/
│   ├── User.php                    # Sanctum + role
│   └── Booking.php                 # Queue, motor, status
├── database/migrations/
├── resources/
│   ├── css/app.css                 # Design tokens + styles
│   └── js/
│       ├── stores/app.js           # Pinia global state
│       ├── layouts/MainLayout.vue  # Sidebar + Topbar + Mobile Nav
│       └── views/                  # LoginView, DashboardView,
│                                   # CustomerView, QueueView,
│                                   # WasherView, AdminView,
│                                   # SettingsView
└── routes/api.php                  # REST API v1
```

## API Endpoints

```
POST   /api/v1/register
POST   /api/v1/login
GET    /api/v1/bookings
POST   /api/v1/bookings
PATCH  /api/v1/bookings/{id}/start
PATCH  /api/v1/bookings/{id}/finish
GET    /api/v1/queue/live
POST   /api/v1/queue/call-next
GET    /api/v1/queue/stats
```
