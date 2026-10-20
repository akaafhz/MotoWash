# MotoWash 🛵

Platform cuci motor digital untuk mengelola booking, antrean, proses pencucian,
dan monitoring operasional dalam satu aplikasi.

MotoWash menggunakan Laravel sebagai backend API dan Vue sebagai single-page
application (SPA) untuk antarmuka customer, washer, dan admin.

## Fitur

- **Multi-role**: Customer, Washer, dan Admin.
- **Autentikasi API**: Register, login, logout, dan informasi pengguna dengan
  Laravel Sanctum.
- **Dua mode booking**: Cuci Motor (Rp15.000, 15 menit) dan Service Motor
  (biaya pengecekan awal Rp10.000, 20 menit).
- **Service fleksibel**: Customer menuliskan keluhan atau kerusakan pada
  catatan. Biaya suku cadang atau tindakan tambahan ditentukan setelah
  pemeriksaan oleh petugas.
- **Jadwal berbasis ketersediaan lokasi dan mode**: Satu slot aktif untuk
  setiap kombinasi lokasi, jam, dan mode. Antrean Cuci Motor dan Service Motor
  terpisah sehingga keduanya dapat berjalan pada lokasi dan jam yang sama.
- **Urutan pelayanan**: Petugas melayani antrean berdasarkan jam pengambilan
  paling awal, lintas mode layanan. Antrean yang tidak hadir dapat dilewati,
  tetapi wajib diberi alasan dan tercatat sebagai `Dilewati`.
- **Tiket booking**: QR pass visual untuk nomor antrean.
- **Status antrean**: Daftar antrean berdasarkan status menunggu, proses, dan
  selesai.
- **Notifikasi pemanggilan**: Saat admin atau washer memanggil antrean,
  customer terkait melihat notifikasi di Dashboard dan halaman Status Antrean.
- **Panel admin**: Statistik antrean, ringkasan layanan, laporan hari ini,
  kapasitas bay, pendapatan, dan tombol panggil antrean berikutnya.
- **Board washer**: Mulai dan selesaikan pekerjaan dengan timer serta progress
  pencucian.
- **Sound effect**: Audio browser untuk booking, perubahan status, dan
  pemanggilan antrean.
- **Responsive UI**: Sidebar desktop dan navigasi bawah untuk perangkat mobile.

> Notifikasi pemanggilan saat ini disinkronkan antar-tab pada browser yang sama
> menggunakan `localStorage`. Untuk penggunaan lintas perangkat secara
> real-time, integrasikan event backend dengan Laravel Broadcasting/WebSocket.

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Backend | Laravel 13, PHP 8.3+, Laravel Sanctum |
| Frontend | Vue 3, Pinia, Vue Router |
| Styling | Tailwind CSS v4 dan CSS variables |
| Build | Vite 8 |
| Icons | Heroicons |
| Database | MySQL atau SQLite sesuai konfigurasi `.env` |
| Testing | PHPUnit |

## Persyaratan

- PHP 8.3 atau lebih baru
- Composer
- Node.js dan npm
- MySQL/MariaDB jika menggunakan database MySQL

## Instalasi

### 1. Clone dan masuk ke folder proyek

```bash
git clone <url-repository>
cd MotoWash
```

### 2. Instal dependency

```bash
composer install
npm install
```

### 3. Siapkan environment

Salin `.env.example` menjadi `.env`, lalu buat application key:

```bash
copy .env.example .env
php artisan key:generate
```

Pada macOS/Linux, gunakan:

```bash
cp .env.example .env
php artisan key:generate
```

Sesuaikan koneksi database di `.env`. Contoh MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=motowash
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Migrasi dan seed data

```bash
php artisan migrate
php artisan db:seed
```

### 5. Jalankan aplikasi

Jalankan backend dan frontend di terminal terpisah:

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

Buka [http://localhost:8000](http://localhost:8000).

Untuk membuat asset production:

```bash
npm run build
```

## Akun Demo

Jika akun demo tersedia setelah menjalankan seeder, gunakan kredensial berikut:

| Role | Email | Password |
| --- | --- | --- |
| Customer | customer@motowash.id | password |
| Washer | washer@motowash.id | password |
| Admin | admin@motowash.id | password |

## Alur Pemanggilan Antrean

1. Admin membuka halaman **Panel Admin**.
2. Admin menekan **Panggil Antrean Berikutnya**.
3. Nomor antrean berikutnya ditampilkan di panel admin.
4. Customer dengan nama yang sesuai melihat notifikasi di:
   - Dashboard customer.
   - Halaman **Status Antrean**.
5. Notifikasi aktif selama sekitar 10 detik.

Untuk menguji alur ini pada versi frontend saat ini, buka panel admin dan
halaman customer di dua tab pada browser yang sama.

## Struktur Folder

```text
MotoWash/
├── app/
│   ├── Http/Controllers/Api/       # Controller endpoint API
│   ├── Http/Middleware/            # Middleware role
│   ├── Models/                     # Model User dan Booking
│   └── Providers/                  # Service provider aplikasi
├── bootstrap/                      # Bootstrap dan konfigurasi aplikasi
├── config/                         # Konfigurasi Laravel
├── database/
│   ├── factories/                  # Factory untuk testing
│   ├── migrations/                 # Struktur tabel database
│   └── seeders/                    # Data awal aplikasi
├── resources/
│   ├── css/app.css                 # Design tokens dan style global
│   └── js/
│       ├── components/             # Komponen Vue yang dapat digunakan ulang
│       ├── layouts/                # Layout utama dan navigasi
│       ├── router/                 # Konfigurasi route Vue
│       ├── stores/                 # State global Pinia
│       └── views/                  # Halaman customer, washer, dan admin
├── routes/
│   ├── api.php                     # REST API v1
│   ├── console.php                 # Artisan console routes
│   └── web.php                     # Entry point SPA
└── tests/                          # Unit dan feature tests
```

## API Endpoints

Semua endpoint berada di bawah prefix `/api/v1`.

### Public

```text
POST   /api/v1/register
POST   /api/v1/login
```

### Membutuhkan autentikasi Sanctum

```text
POST   /api/v1/logout
GET    /api/v1/me

GET    /api/v1/bookings
POST   /api/v1/bookings
GET    /api/v1/bookings/{booking}
PATCH  /api/v1/bookings/{booking}
DELETE /api/v1/bookings/{booking}
PATCH  /api/v1/bookings/{booking}/start
PATCH  /api/v1/bookings/{booking}/finish

GET    /api/v1/queue/live
POST   /api/v1/queue/call-next
GET    /api/v1/queue/stats
```

Endpoint booking dan queue memiliki pembatasan role sesuai kebutuhan operasi.
Detail middleware role dapat dilihat pada route API dan
`app/Http/Middleware/EnsureUserHasRole.php`.

## Pengujian

Jalankan seluruh test:

```bash
php artisan test --compact
```

Atau gunakan script Composer:

```bash
composer test
```
